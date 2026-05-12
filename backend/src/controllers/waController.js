const waService = require('../services/waService')

const sendInvitation = async (req, res, next) => {
    try {
        const { participant_user_id } = req.body || {}
        const data = await waService.sendInvitationWhatsAppByMeeting(req.params.id, req.user.id, {
            participant_user_id,
        })
        res.status(200).json({ message: 'Permintaan kirim undangan WA diproses', data })
    } catch (err) {
        next(err)
    }
}

const sendMeetingSummary = async (req, res, next) => {
    try {
        const data = await waService.sendMeetingSummaryWhatsAppByMeeting(req.params.id, req.user.id)
        res.status(200).json({ message: 'Permintaan kirim ringkasan meeting lewat WA diproses', data })
    } catch (err) {
        next(err)
    }
}

module.exports = { sendInvitation, sendMeetingSummary }
