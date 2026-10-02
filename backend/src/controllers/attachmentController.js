const attachmentService = require('../services/attachmentService');

const requestUpload = async (req, res, next) => {
    try {
        const { file_name, file_size } = req.body;

        const data = await attachmentService.requestUpload({
            meeting_id: req.params.id,
            user_id: req.user.id,
            file_name,
            file_size,
        });

        res.status(201).json({ message: 'URL upload berhasil dibuat', data });
    } catch (err) {
        next(err);
    }
};

const confirmUpload = async (req, res, next) => {
    try {
        const data = await attachmentService.confirmUpload({
            meeting_id: req.params.id,
            attachment_id: req.params.attId,
            user_id: req.user.id,
        });

        res.status(200).json({ message: 'Dokumen berhasil diunggah', data });
    } catch (err) {
        next(err);
    }
};

const listAttachments = async (req, res, next) => {
    try {
        const data = await attachmentService.listAttachments({
            meeting_id: req.params.id,
            user_id: req.user.id,
        });

        res.status(200).json({ message: 'Berhasil mengambil dokumen pendukung', data });
    } catch (err) {
        next(err);
    }
};

const getAttachmentUrl = async (req, res, next) => {
    try {
        const data = await attachmentService.getAccessUrl({
            meeting_id: req.params.id,
            attachment_id: req.params.attId,
            user_id: req.user.id,
            mode: req.query.mode,
        });

        res.status(200).json({ message: 'Berhasil membuat URL dokumen', data });
    } catch (err) {
        next(err);
    }
};

const deleteAttachment = async (req, res, next) => {
    try {
        await attachmentService.deleteAttachment({
            meeting_id: req.params.id,
            attachment_id: req.params.attId,
            user_id: req.user.id,
        });

        res.status(200).json({ message: 'Dokumen berhasil dihapus' });
    } catch (err) {
        next(err);
    }
};

module.exports = { requestUpload, confirmUpload, listAttachments, getAttachmentUrl, deleteAttachment };