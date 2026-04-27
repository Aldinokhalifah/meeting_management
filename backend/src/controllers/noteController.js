const noteService = require('../services/noteService');

const createNote = async (req, res, next) => {
    try {
        const {content} = req.body;
        if (!content) return res.status(400).json({ message: 'Content wajib diisi' });

        const note = await noteService.createNote({
            meeting_id: req.params.id,
            content,
            user_id: req.user.id,
        });

        res.status(201).json({
            message: 'Notulen berhasil dibuat',
            data: note
        });
    } catch (err) {
        if (err.message === 'Meeting tidak ditemukan') return res.status(404).json({ message: err.message });
        if (err.message === 'Kamu tidak memiliki akses ke meeting ini') return res.status(403).json({ message: err.message });
        if (err.message === 'Hanya host dan secretary yang dapat membuat notulen') return res.status(403).json({ message: err.message });
        if (err.message === 'Notulen sudah ada, gunakan endpoint edit') return res.status(409).json({ message: err.message });
        next(err);
    }
}

const getNote = async (req, res, next) => {
    try {
        const note = await noteService.getNote({
            meeting_id: req.params.id,
            user_id: req.user.id,
        });
        res.status(200).json({ message: 'Berhasil mengambil notulen', data: note });
    } catch (err) {
        if (err.message === 'Meeting tidak ditemukan') return res.status(404).json({ message: err.message });
        if (err.message === 'Kamu tidak memiliki akses ke meeting ini') return res.status(403).json({ message: err.message });
        if (err.message === 'Notulen belum dibuat') return res.status(404).json({ message: err.message });
        next(err);
    }
}

const updateNote = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content wajib diisi' });

        const note = await noteService.updateNote({
            meeting_id: req.params.id,
            content,
            user_id: req.user.id,
        });
        res.status(200).json({ message: 'Notulen berhasil diupdate', data: note });
    } catch (err) {
        if (err.message === 'Meeting tidak ditemukan') return res.status(404).json({ message: err.message });
        if (err.message === 'Kamu tidak memiliki akses ke meeting ini') return res.status(403).json({ message: err.message });
        if (err.message === 'Hanya host dan secretary yang dapat mengedit notulen') return res.status(403).json({ message: err.message });
        if (err.message === 'Notulen belum dibuat') return res.status(404).json({ message: err.message });
        next(err);
    }
}

module.exports = { createNote, getNote, updateNote};