'use client'

import { useState } from 'react'
import { usePreviousMeeting } from '@/hooks/useContinuation'
import { ChevronDown, ChevronUp, Link2, Lock } from 'lucide-react'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    })

export default function PreviousMeetingSection({ meetingId, previousMeetingId }) {
    const [expanded, setExpanded] = useState(false)
    const { data, isLoading } = usePreviousMeeting(expanded ? meetingId : null, previousMeetingId)

    if (!previousMeetingId) return null

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between"
            >
                <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Link2 size={14} />
                Meeting Sebelumnya
                </span>
                {expanded ? <ChevronUp size={16} className="text-blue-500" /> : <ChevronDown size={16} className="text-blue-500" />}
            </button>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                {isLoading ? (
                    <div className="animate-pulse h-10 bg-blue-100 rounded" />
                ) : data?.access_level === 'none' ? (
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Lock size={14} />
                    Kamu tidak memiliki akses ke meeting ini
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-blue-800">{data?.meeting?.title}</p>
                        <p className="text-xs text-blue-500">{formatDate(data?.meeting?.scheduled_at)}</p>

                        {data?.access_level === 'summary_only' && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-1">
                            <Lock size={10} />
                            Akses terbatas — summary only
                            </span>
                        )}

                        {data?.access_level === 'full' && data?.meeting?.participants && (
                            <p className="text-xs text-blue-500">
                            {data.meeting.participants.length} peserta
                            </p>
                        )}
                    </div>
                )}
                </div>
            )}
        </div>
    )
}