'use client'

import { useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import { TypingIndicator } from '@/lib/TypingIndicator'

export default function ChatWindow({ onClose, messages, isLoading, onSend, onClear }) {
    const bottomRef = useRef(null)

    // Auto scroll ke bawah saat pesan baru
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    return (
        <div className="flex flex-col w-[min(90vw,360px)] max-w-[90vw] h-[min(80vh,600px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-yellow-600">
                <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-yellow-500 border-2 border-yellow-400 flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                </div>
                <div>
                    <p className="text-white text-sm font-medium leading-none">Meeting Assistant</p>
                </div>
                </div>
                <div className="flex items-center gap-1">
                <button
                    onClick={onClear}
                    title="Hapus riwayat chat"
                    className="p-1.5 rounded-lg text-yellow-200 hover:text-white hover:bg-yellow-700 transition"
                >
                    <Trash2 size={14} />
                </button>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-yellow-200 hover:text-white hover:bg-yellow-700 transition"
                >
                    <X size={16} />
                </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg, i) => (
                    <ChatBubble key={i} message={msg} />
                ))}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={onSend} isLoading={isLoading} />
        </div>
    )
}