'use client'

import { useActionItemsQueries } from '@/hooks/useActionItems'
import { Clock } from 'lucide-react'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export default function ActionItemsSection({ meetings = [] }) {
    const meetingIds = meetings.map((m) => m.id).filter(Boolean)

    const queries = useActionItemsQueries(meetingIds, 'open')

    const allOpenItems = queries.flatMap((query) => query.data ?? []).slice(0, 5)

    if (allOpenItems.length === 0) return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Action Items
            </p>
            <div className="py-6 text-center text-sm text-gray-400">
                Tidak ada action item terbuka
            </div>
        </div>
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Action Items
            </p>
            <div className="space-y-1">
                {allOpenItems.map((item) => (
                <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-yellow-700">
                        {item.assigned_to_name?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{item.assigned_to_name}</span>
                        {item.due_date && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(item.due_date)}
                        </span>
                        )}
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}