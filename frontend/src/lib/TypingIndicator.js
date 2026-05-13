export const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-1 mr-2">
        <span className="text-white text-xs">🤖</span>
        </div>
        <div className="bg-gray-100 px-3 py-2.5 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        </div>
    </div>
)
