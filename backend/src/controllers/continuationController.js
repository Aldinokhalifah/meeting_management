const continuationService = require('../services/continuationService');

const createContinuation = async (req, res, next) => {
    try {
        const { title, description, scheduled_at, participant_ids } = req.body;

        if (!title || !scheduled_at) {
        return res.status(400).json({ message: 'Title dan jadwal wajib diisi' });
        }

        const result = await continuationService.createContinuation(
        {
            source_meeting_id: req.params.id,
            title,
            description,
            scheduled_at,
            participant_ids: participant_ids || [],
        },
        req.user.id
        );

        res.status(201).json({ message: 'Meeting lanjutan berhasil dibuat', data: result });
    } catch (err) {
        if (err.message === 'Meeting sebelumnya tidak ditemukan') return res.status(404).json({ message: err.message });
        if (err.message === 'Hanya host yang dapat membuat meeting lanjutan') return res.status(403).json({ message: err.message });
        if (err.message === 'Title dan jadwal wajib diisi') return res.status(400).json({ message: err.message });
        if (err.message.startsWith('Access level tidak valid')) return res.status(400).json({ message: err.message });
        next(err);
    }
}

const getPreviousMeeting = async (req, res, next) => {
    try {
        // req.params.continuationId adalah id continuation meeting yang ingin dicek
        const result = await continuationService.getPreviousMeeting(req.params.continuationId, req.user.id);
        res.status(200).json({ message: 'Berhasil mengambil meeting sebelumnya', data: result });
    } catch (err) {
        if (err.message === 'Meeting tidak ditemukan') return res.status(404).json({ message: err.message });
        if (err.message === 'Kamu tidak memiliki akses ke meeting ini') return res.status(403).json({ message: err.message });
        if (err.message === 'Meeting ini tidak memiliki meeting sebelumnya') return res.status(404).json({ message: err.message });
        if (err.message === 'Kamu tidak memiliki akses ke meeting sebelumnya') return res.status(403).json({ message: err.message })
        next(err);
    }
}

module.exports = { createContinuation, getPreviousMeeting };