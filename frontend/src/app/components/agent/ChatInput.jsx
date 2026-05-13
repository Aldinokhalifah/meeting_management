'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, isLoading }) {
    const [input, setInput] = useState('')

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        onSend(input.trim())
        setInput('')
    }

    const handleKeyDown = (e) => {
        // Enter kirim, Shift+Enter newline
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
        }
    }

    return (
        <div className="flex items-end gap-2 p-3 border-t border-gray-100">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan... (Enter untuk kirim)"
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition disabled:opacity-50 max-h-24 overflow-y-auto"
                style={{ minHeight: '38px' }}
            />
            <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-yellow-600 hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition flex-shrink-0"
            >
                <Send size={15} />
            </button>
        </div>
    )
}