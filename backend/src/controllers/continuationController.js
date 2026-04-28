const continuationService = require('../services/continuationService');

const createContinuation = async (req, res, next) => {
    try {
        const { title, description, scheduled_at, end_time, location, participant_ids } = req.body

        const result = await continuationService.createContinuation(
        {
            source_meeting_id: req.params.id,
            title,
            description,
            scheduled_at,
            end_time,
            location,
            participant_ids: participant_ids || [],
        },
        req.user.id
        )
        res.status(201).json({ message: 'Meeting lanjutan berhasil dibuat', data: result })
    } catch (err) {
        next(err)
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