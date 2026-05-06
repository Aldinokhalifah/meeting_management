const aiService = require('../services/aiService')

const generateSummary = async (req, res, next) => {
    try {
        const summary = await aiService.generateMeetingSummary(req.params.id, req.user.id)
        res.status(201).json({ message: 'AI summary berhasil dibuat', data: { summary } })
    } catch (err) {
        next(err)
    }
}

const getSummary = async (req, res, next) => {
    try {
        const summary = await aiService.getAiSummary(req.params.id, req.user.id)
        res.status(200).json({ message: 'Berhasil mengambil AI summary', data: { summary } })
    } catch (err) {
        next(err)
    }
}

module.exports = { generateSummary, getSummary }