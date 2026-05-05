'use client'

import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { STATUS_STYLE } from '@/lib/status_style'
import { formatTime } from '@/lib/formatTime'

export default function TodaySchedule({ meetings = [] }) {
    const today = new Date().toDateString()

    const todayMeetings = useMemo(() => {
        return meetings
            .filter((m) => new Date(m.scheduled_at).toDateString() === today)
            .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    }, [meetings, today]);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Jadwal Hari Ini
            </p>

            {todayMeetings.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                Tidak ada meeting hari ini
                </div>
            ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                {todayMeetings.map((m) => {
                    const status = STATUS_STYLE[m.status] ?? STATUS_STYLE.scheduled
                    return (
                    <Link
                        key={m.id}
                        href={`/meeting/${m.id}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                    >
                        {/* Waktu */}
                        <div className="text-xs text-gray-400 min-w-13 leading-relaxed pt-0.5">
                        <div className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime(m.scheduled_at)}
                        </div>
                        {m.end_time && (
                            <div className="ml-3">{formatTime(m.end_time)}</div>
                        )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-yellow-700 transition">
                            {m.title}
                        </p>
                        {m.location && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {m.location}
                            </p>
                        )}
                        </div>

                        {/* Badge */}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.className}`}>
                        {status.label}
                        </span>
                    </Link>
                    )
                })}
                </div>
            )}
        </div>
    )
}