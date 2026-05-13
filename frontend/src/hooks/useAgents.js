import { useState, useCallback } from 'react'
import { sendChatMessage } from '@/services/agent'
import toast from 'react-hot-toast'

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: 'Halo! Aku asisten meeting kamu 👋\n\nAku bisa membantu:\n• Buat & cari meeting\n• Tambah peserta\n• Kelola action items\n• Cek jadwal hari ini\n• Info ruangan',
}

export const useAgent = () => {
    const [messages, setMessages] = useState([WELCOME_MESSAGE])
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = useCallback(async (message) => {
        if (!message.trim() || isLoading) return

        const userMessage = { role: 'user', content: message }

        // Simpan current messages SEBELUM setState
        // Pakai functional update untuk dapat nilai terbaru
        let currentMessages = []

        setMessages((prev) => {
        currentMessages = [...prev, userMessage]
        return currentMessages
        })

        setIsLoading(true)

        try {
        // Beri sedikit delay agar setState selesai
        await new Promise((resolve) => setTimeout(resolve, 0))

        // Build history dari currentMessages — skip welcome message
        const history = currentMessages
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content }))

        console.log('[useAgent] Sending history:', history.length, 'messages')

        const result = await sendChatMessage({
            message,
            conversation_history: history,
        })

        const assistantMessage = {
            role: 'assistant',
            content: result.data.response,
        }

        setMessages((prev) => [...prev, assistantMessage])

        } catch (err) {
        toast.error('AI Agent tidak tersedia, coba lagi nanti')
        setMessages((prev) => prev.slice(0, -1))
        } finally {
        setIsLoading(false)
        }
    }, [isLoading])

    const clearMessages = useCallback(() => {
        setMessages([WELCOME_MESSAGE])
    }, [])

    return { messages, isLoading, sendMessage, clearMessages }
}