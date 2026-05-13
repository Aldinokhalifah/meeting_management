'use client'

import { useState } from 'react'
import { Bot, X } from 'lucide-react'
import ChatWindow from './ChatWindow'
import { useAgent } from '@/hooks/useAgents'

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false)
    const { messages, isLoading, sendMessage, clearMessages } = useAgent()

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {/* Chat Window */}
            {isOpen && (
                <ChatWindow
                messages={messages}
                isLoading={isLoading}
                onSend={sendMessage}
                onClose={() => setIsOpen(false)}
                onClear={clearMessages}
                />
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
                isOpen
                    ? 'bg-gray-600 hover:bg-gray-700 rotate-0'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
                style={{ width: '52px', height: '52px' }}
                title="Meeting Assistant"
            >
                {isOpen ? (
                <X size={20} className="text-white" />
                ) : (
                <Bot size={22} className="text-white" />
                )}
            </button>
        </div>
    )
}