'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useActionItemsQueries } from '@/hooks/useActionItems'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export default function ActionItemsSection({ meetings = [], currentUserId }) {
    const meetingIds = meetings.map((m) => m.id).filter(Boolean)

    const queries = useActionItemsQueries(meetingIds, 'open')

    const myActionItems = useMemo(() => {
        return queries
        .flatMap((q) => q.data ?? [])
        // ← filter hanya yang di-assign ke current user
        .filter((item) => item.assigned_to === currentUserId)
        .slice(0, 5)
    }, [queries, currentUserId])

    if (myActionItems.length === 0) return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Action Items Saya
            </p>
            <div className="py-6 text-center text-sm text-gray-400">
                Tidak ada action item untukmu
            </div>
        </div>
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Action Items Saya
            </p>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {myActionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-yellow-700">
                        {item.assigned_to_name?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{item.description}</p>
                    {item.due_date && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {formatDate(item.due_date)}
                        </span>
                    )}
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}