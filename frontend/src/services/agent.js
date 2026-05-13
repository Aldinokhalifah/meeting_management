import fetchClient from '@/lib/fetchClient'

export const sendChatMessage = async ({ message, conversation_history = [] }) => {
    return await fetchClient('/agent/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversation_history }),
    })
}