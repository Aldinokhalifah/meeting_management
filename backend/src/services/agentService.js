const agentChat = async ({ message, userId, conversationHistory = [] }) => {
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
            const body = await response.json().catch(() => ({}))
            const detail = body.detail
            const text =
                typeof detail === 'string'
                    ? detail
                    : detail?.error || 'AI Agent error'

            const err = new Error(text)
            err.status = response.status
            err.agentDetail = detail
            throw err
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