const agentChat = async ({ message, userId, conversationHistory = [] }) => {
    console.log('[agentService] Forwarding to Python:', {
        message,
        user_id: userId,
        conversation_history_count: conversationHistory.length,
    })
    try {
        const response = await fetch(`${process.env.AGENT_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                user_id: userId,
                conversation_history: conversationHistory,
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'AI Agent error')
        }

        return await response.json()
    } catch (err) {
        // Kalau Python agent tidak jalan
        if (err.name === 'TimeoutError' || err.code === 'ECONNREFUSED') {
            throw new Error('AI_AGENT_ERROR')
        }
        throw err
    }
}

module.exports = { agentChat }