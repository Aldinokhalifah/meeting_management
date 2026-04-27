const meetingService = require('../services/meetingService');

const createMeeting = async (req, res, next) => {
    try {
        const { title, description, scheduled_at, participant_ids } = req.body;
        const meeting = await meetingService.createMeeting(
        { title, description, scheduled_at, participant_ids },
        req.user.id
        );
        res.status(201).json({ message: 'Meeting berhasil dibuat', data: meeting });
    } catch (err) {
        next(err);
    }
};

const getMeetings = async (req, res, next) => {
    try {
        const meetings = await meetingService.getMeetings(req.user.id);
        res.status(200).json({ message: 'Berhasil mengambil data meeting', data: meetings });
    } catch (err) {
        next(err);
    }
};

const getMeetingDetail = async (req, res, next) => {
    try {
        const meeting = await meetingService.getMeetingDetail(req.params.id, req.user.id);
        res.status(200).json({ message: 'Berhasil mengambil detail meeting', data: meeting });
    } catch (err) {
        next(err);
    }
};

const updateMeeting = async (req, res, next) => {
    try {
        const meeting = await meetingService.updateMeeting(req.params.id, req.user.id, req.body);
        res.status(200).json({ message: 'Meeting berhasil diupdate', data: meeting });
    } catch (err) {
        next(err);
    }
};

const deleteMeeting = async (req, res, next) => {
    try {
        await meetingService.deleteMeeting(req.params.id, req.user.id);
        res.status(200).json({ message: 'Meeting berhasil dihapus' });
    } catch (err) {
        next(err);
    }
};

const addParticipant = async (req, res, next) => {
    try {
        const { user_id } = req.body;
        if (!user_id) throw new Error('USER_ID_REQUIRED'); 

        const participant = await meetingService.addParticipant(req.params.id, req.user.id, user_id);
        res.status(201).json({ message: 'Peserta berhasil ditambahkan', data: participant });
    } catch (err) {
        next(err);
    }
};

const removeParticipant = async (req, res, next) => {
    try {
        await meetingService.removeParticipant(req.params.id, req.user.id, req.params.userId);
        res.status(200).json({ message: 'Peserta berhasil dihapus' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createMeeting,
    getMeetings,
    getMeetingDetail,
    updateMeeting,
    deleteMeeting,
    addParticipant,
    removeParticipant,
};