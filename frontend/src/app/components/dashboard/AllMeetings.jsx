'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { STATUS_STYLE } from '@/lib/status_style'
import { formatTime } from '@/lib/formatTime'

const TABS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'done',     label: 'Selesai' },
    { key: 'all',      label: 'Semua' },
]

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })

export default function AllMeetings({ meetings = [] }) {
    const [activeTab, setActiveTab] = useState('upcoming')

    const filtered = useMemo(() => {
            return meetings.filter((m) => {
                if (activeTab === 'upcoming') return ['scheduled', 'ongoing'].includes(m.status)
                if (activeTab === 'done') return ['done', 'cancelled'].includes(m.status)
                return true
        })
    }, [meetings, activeTab])

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Semua Meeting
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
                {TABS.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    activeTab === tab.key
                        ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                Tidak ada meeting
                </div>
            ) : (
                <div className="space-y-1 overflow-y-auto h-48">
                {filtered.map((m) => {
                    const status = STATUS_STYLE[m.status] ?? STATUS_STYLE.scheduled
                    return (
                    <Link
                        key={m.id}
                        href={`/meeting/${m.id}`}
                        className="flex items-center border border-gray-100 justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-yellow-700 transition flex ">
                                <span className={`font-semibold mr-1 ${status.className.split(' ')[1]}`}>|</span> {m.title}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(m.scheduled_at)} · {formatTime(m.scheduled_at)}
                                </span>
                                {m.location && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <MapPin size={10} />
                                    {m.location}
                                </span>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ml-3 ${status.className}`}>
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