import fetchClient from "@/lib/fetchClient";

export const getAttachments = async (meeting_id) => {
    return await fetchClient(`/meetings/${meeting_id}/attachments`);
}

export const presignAttachment = async (meeting_id, { file_name, file_size }) => {
    return await fetchClient(`/meetings/${meeting_id}/attachments/presign`, {
        method: 'POST',
        body: JSON.stringify({ file_name, file_size }),
    });
}

export const confirmAttachment = async (meeting_id, attachment_id) => {
    return await fetchClient(`/meetings/${meeting_id}/attachments/${attachment_id}/confirm`, {
        method: 'POST',
    });
}

export const getAttachmentUrl = async (meeting_id, attachment_id, mode = 'download') => {
    return await fetchClient(`/meetings/${meeting_id}/attachments/${attachment_id}/url?mode=${mode}`);
}

export const deleteAttachment = async (meeting_id, attachment_id) => {
    return await fetchClient(`/meetings/${meeting_id}/attachments/${attachment_id}`, {
        method: 'DELETE',
    });
}

const STORAGE_ERROR_MESSAGES = {
    EntityTooLarge: 'Ukuran file tidak sesuai dengan yang dideklarasikan',
    EntityTooSmall: 'Ukuran file tidak sesuai dengan yang dideklarasikan',
    AccessDenied: 'Izin upload ditolak atau sudah kedaluwarsa, silakan coba lagi',
    InvalidPolicyDocument: 'Izin upload tidak valid, silakan coba lagi',
}

const parseStorageError = (xhr) => {
    const code = /<Code>([^<]+)<\/Code>/.exec(xhr.responseText || '')?.[1]
    return STORAGE_ERROR_MESSAGES[code] || `Upload ke penyimpanan gagal (${xhr.status})`
}

// Upload langsung ke MinIO memakai presigned POST. Sengaja TIDAK lewat fetchClient:
// fetchClient menambahkan header Authorization dan Content-Type JSON yang akan ditolak MinIO.
// XMLHttpRequest dipakai karena fetch belum mendukung progress upload.
export const uploadToStorage = ({ upload_url, fields, file, onProgress }) => {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        Object.entries(fields).forEach(([key, value]) => form.append(key, value));
        // Field "file" harus paling terakhir, setelah semua field dari backend
        form.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', upload_url);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(parseStorageError(xhr)));
        };
        xhr.onerror = () => reject(new Error('Gagal terhubung ke penyimpanan file, periksa koneksi jaringan'));
        xhr.onabort = () => reject(new Error('Upload dibatalkan'));

        xhr.send(form);
    });
}
