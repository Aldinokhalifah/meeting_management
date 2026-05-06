'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AiSummarySection({ meeting }) {
    if (!meeting?.ai_summary) {
        return null
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI Summary
            </h2>
            <div className="prose prose-sm max-w-none prose-table:table-auto prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-gray-200 prose-th:border prose-th:border-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {meeting.ai_summary}
                </ReactMarkdown>
            </div>
        </div>
    )
}