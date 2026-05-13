const agentService = require('../services/agentService');

const chat = async (req, res, next) => {
    try {
        const { message, conversation_history } = req.body


        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Pesan tidak boleh kosong' })
        }

        const result = await agentService.agentChat({
            message: message,
            userId: req.user.id,
            conversationHistory: conversation_history
        });

        res.status(200).json({
            message: "Data berhasil dikirm",
            data: result
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {chat}