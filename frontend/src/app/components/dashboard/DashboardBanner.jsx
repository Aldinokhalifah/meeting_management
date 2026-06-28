'use client'

import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardBanner({ meetings = [] }) {
    const today = new Date().toDateString();

    const todayCount = useMemo(() => {
        return meetings.filter(
            (m) => new Date(m.scheduled_at).toDateString() === today
        )
        .filter((m) => m.status !== 'done').length
    }, [meetings, today]);

    if (todayCount === 0) return (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
            <CalendarDays size={16} />
            Tidak ada meeting hari ini
        </div>
    )

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            Kamu punya <strong className="">{todayCount} meeting</strong> hari ini
        </div>
    )
}