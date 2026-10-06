const crypto = require('crypto');
const attachmentRepo = require('../repositories/attachmentRepository');
const meetingRepo = require('../repositories/meetingRepository');
const minio = require('../config/minio');
const { isValidUUID } = require('../utils/validateUuid');
const {
    ALLOWED_FILES, sanitizeFileName, getExtension, buildContentDisposition,
} = require('../utils/attachmentFiles');
const parseFileSize = require('../utils/parseFileSize')

const PRESIGN_UPLOAD_EXPIRY = Number(process.env.PRESIGN_UPLOAD_EXPIRY) || 300;
const PRESIGN_VIEW_EXPIRY = Number(process.env.PRESIGN_VIEW_EXPIRY) || 600;
const MAX_ATTACHMENTS_PER_MEETING = Number(process.env.MAX_ATTACHMENTS_PER_MEETING) || 5;
// Harus lebih lama dari PRESIGN_UPLOAD_EXPIRY supaya upload yang masih berjalan tidak ikut terhapus
const PENDING_TTL_MINUTES = Number(process.env.PENDING_ATTACHMENT_TTL_MINUTES) || 15;

const MANAGE_ROLES = ['host', 'secretary'];
const UPLOADABLE_MEETING_STATUSES = ['ongoing', 'done'];
const HEADER_BYTES_TO_CHECK = 1024;

const assertMeetingAccess = async (meeting_id, user_id) => {
    if (!isValidUUID(meeting_id)) throw new Error('INVALID_MEETING_ID');

    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!role) throw new Error('ACCESS_FORBIDDEN');

    return { meeting, role };
};

// Attachment harus milik meeting yang ada di URL, kalau tidak :attId bisa dipakai lintas meeting
const assertAttachmentInMeeting = async (meeting_id, attachment_id) => {
    if (!isValidUUID(attachment_id)) throw new Error('INVALID_ATTACHMENT_ID');

    const attachment = await attachmentRepo.getAttachmentById(attachment_id);
    if (!attachment || attachment.meeting_id !== meeting_id) throw new Error('ATTACHMENT_NOT_FOUND');

    return attachment;
};

const removeObjectQuietly = async (object_key) => {
    try {
        await minio.internalClient.removeObject(minio.bucket, object_key);
    } catch (err) {
        console.error(`[MinIO Error] Gagal menghapus objek ${object_key}:`, err.message);
    }
};

// Untuk penghapusan banyak objek di belakang layar (tidak perlu ditunggu response)
const removeObjectsQuietly = async (object_keys) => {
    for (const object_key of object_keys) {
        await removeObjectQuietly(object_key);
    }
};

// DB dulu, baru objek: kalau langkah kedua gagal, yang tersisa hanya objek yatim yang tidak terlihat user
const discardAttachment = async (attachment) => {
    await attachmentRepo.deleteAttachment(attachment.id);
    await removeObjectQuietly(attachment.object_key);
};

const requestUpload = async ({ meeting_id, user_id, file_name, file_size }) => {
    const { meeting, role } = await assertMeetingAccess(meeting_id, user_id);

    if (!MANAGE_ROLES.includes(role)) throw new Error('ONLY_HOST_SECRETARY_CAN_UPLOAD');
    if (!UPLOADABLE_MEETING_STATUSES.includes(meeting.status)) throw new Error('MEETING_STATUS_NOT_ALLOW_UPLOAD');

    const cleanName = sanitizeFileName(file_name);
    if (!cleanName) throw new Error('INVALID_FILE_NAME');

    const extension = getExtension(cleanName);
    const fileSpec = ALLOWED_FILES[extension];
    if (!fileSpec) throw new Error('FILE_TYPE_NOT_ALLOWED');

    const size = parseFileSize(file_size);

    const id = crypto.randomUUID();
    const object_key = `${meeting_id}/${id}.${extension}`;

    const { attachment, stale_keys } = await attachmentRepo.createPendingAttachment({
        id,
        meeting_id,
        file_name: cleanName,
        object_key,
        file_size: size,
        file_type: fileSpec.mime,
        uploaded_by: user_id,
        max_files: MAX_ATTACHMENTS_PER_MEETING,
        pending_ttl_minutes: PENDING_TTL_MINUTES,
    });

    if (stale_keys.length > 0) removeObjectsQuietly(stale_keys);
    if (!attachment) throw new Error('ATTACHMENT_LIMIT_REACHED');

    try {
        const policy = new minio.PostPolicy();
        policy.setBucket(minio.bucket);
        policy.setKey(object_key);
        policy.setContentType(fileSpec.mime);
        // Ukuran harus persis sama dengan yang dideklarasikan
        policy.setContentLengthRange(size, size);
        policy.setExpires(new Date(Date.now() + PRESIGN_UPLOAD_EXPIRY * 1000));

        const { postURL, formData } = await minio.publicClient.presignedPostPolicy(policy);

        return {
            attachment_id: attachment.id,
            upload_url: postURL,
            fields: formData,
            expires_in: PRESIGN_UPLOAD_EXPIRY,
        };
    } catch (err) {
        await attachmentRepo.deleteAttachment(attachment.id).catch(() => { });
        throw err;
    }
};

const isObjectMissing = (err) => ['NotFound', 'NoSuchKey'].includes(err?.code);

const readObjectHeader = async (object_key) => {
    const stream = await minio.internalClient.getPartialObject(minio.bucket, object_key, 0, HEADER_BYTES_TO_CHECK);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
};

const confirmUpload = async ({ meeting_id, attachment_id, user_id }) => {
    const { meeting, role } = await assertMeetingAccess(meeting_id, user_id);

    if (!MANAGE_ROLES.includes(role)) throw new Error('ONLY_HOST_SECRETARY_CAN_UPLOAD');

    const attachment = await assertAttachmentInMeeting(meeting_id, attachment_id);
    if (attachment.uploaded_by !== user_id) throw new Error('ONLY_UPLOADER_CAN_CONFIRM');

    // Konfirmasi ulang aman (idempotent)
    if (attachment.status === 'uploaded') {
        const { object_key, ...publicData } = attachment;
        return publicData;
    }

    // Status meeting bisa berubah antara presign dan confirm (mis. dibatalkan)
    if (!UPLOADABLE_MEETING_STATUSES.includes(meeting.status)) {
        await discardAttachment(attachment);
        throw new Error('MEETING_STATUS_NOT_ALLOW_UPLOAD');
    }

    let stat;
    try {
        stat = await minio.internalClient.statObject(minio.bucket, attachment.object_key);
    } catch (err) {
        if (!isObjectMissing(err)) throw err;
        await discardAttachment(attachment);
        throw new Error('UPLOAD_VERIFICATION_FAILED');
    }

    const storedType = stat.metaData?.['content-type'];
    const fileSpec = ALLOWED_FILES[attachment.object_key.split('.').pop()];
    const header = fileSpec ? await readObjectHeader(attachment.object_key) : null;

    const isValid = fileSpec
        && stat.size === attachment.file_size
        && storedType === attachment.file_type
        && fileSpec.matchesSignature(header);

    if (!isValid) {
        await discardAttachment(attachment);
        throw new Error('UPLOAD_VERIFICATION_FAILED');
    }

    const confirmed = await attachmentRepo.markUploaded(attachment.id, meeting_id, stat.size);
    if (!confirmed) throw new Error('ATTACHMENT_NOT_FOUND');

    return confirmed;
};

const listAttachments = async ({ meeting_id, user_id }) => {
    await assertMeetingAccess(meeting_id, user_id);
    return await attachmentRepo.getUploadedByMeetingId(meeting_id);
};

const getAccessUrl = async ({ meeting_id, attachment_id, user_id, mode = 'download' }) => {
    if (!['preview', 'download'].includes(mode)) throw new Error('INVALID_URL_MODE');

    await assertMeetingAccess(meeting_id, user_id);

    const attachment = await assertAttachmentInMeeting(meeting_id, attachment_id);
    if (attachment.status !== 'uploaded') throw new Error('ATTACHMENT_NOT_UPLOADED');

    // Inline hanya untuk tipe yang aman ditampilkan browser; sisanya selalu diunduh
    const fileSpec = ALLOWED_FILES[attachment.object_key.split('.').pop()];
    const effectiveMode = mode === 'preview' && fileSpec?.previewable ? 'preview' : 'download';

    const disposition = effectiveMode === 'preview'
        ? 'inline'
        : buildContentDisposition('attachment', attachment.file_name);

    const url = await minio.publicClient.presignedGetObject(
        minio.bucket,
        attachment.object_key,
        PRESIGN_VIEW_EXPIRY,
        {
            'response-content-disposition': disposition,
            // Paksa tipe hasil verifikasi, bukan apa pun yang tertulis di metadata objek
            'response-content-type': attachment.file_type,
        }
    );

    return { url, mode: effectiveMode, expires_in: PRESIGN_VIEW_EXPIRY };
};

const deleteAttachment = async ({ meeting_id, attachment_id, user_id }) => {
    const { role } = await assertMeetingAccess(meeting_id, user_id);

    if (!MANAGE_ROLES.includes(role)) throw new Error('ONLY_HOST_SECRETARY_CAN_DELETE_ATTACHMENT');

    const attachment = await assertAttachmentInMeeting(meeting_id, attachment_id);
    await discardAttachment(attachment);

    return { id: attachment.id };
};

// Dipakai meetingService sebelum meeting dihapus (cascade menghapus baris DB, bukan objek MinIO)
const getMeetingObjectKeys = async (meeting_id) => attachmentRepo.getObjectKeysByMeetingId(meeting_id);

module.exports = {
    requestUpload, confirmUpload, listAttachments, getAccessUrl, deleteAttachment,
    getMeetingObjectKeys, removeObjectsQuietly,
};