'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, MapPin, Link2 } from 'lucide-react'
import { formatTime } from '@/lib/formatTime'
import { STATUS_CONFIG } from '@/lib/status_config'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

export default function MeetingHeader({ meeting, myRole, onEdit, onContinue, onDelete }) {
    const router = useRouter();
    const status = STATUS_CONFIG[meeting?.status] ?? STATUS_CONFIG.scheduled;
    const isHost = myRole === 'host'

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 mt-12 lg:mt-0">
            {/* Back + Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                <ArrowLeft size={16} />
                    Kembali
                </button>

                {isHost && (
                <div className="flex items-center gap-2">
                    <button
                    onClick={onContinue}
                    className="text-sm px-3 py-1.5 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition"
                    >
                        Lanjutkan Meeting
                    </button>
                    <button
                    onClick={onEdit}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        Edit
                    </button>
                    <button
                    onClick={onDelete}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                    >
                        Hapus
                    </button>
                </div>
                )}
            </div>

            {/* Title + Badge */}
            <div className="flex items-start gap-3">
                <h1 className="text-xl font-semibold text-gray-900 flex-1">{meeting?.title}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${status.className}`}>
                {status.label}
                </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDate(meeting?.scheduled_at)}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatTime(meeting?.scheduled_at)}
                    {meeting?.end_time && ` – ${formatTime(meeting?.end_time)}`}
                </span>
                {meeting?.location && (
                <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {meeting?.location}
                </span>
                )}
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Role kamu:</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    myRole === 'host'      ? 'bg-yellow-50 text-yellow-700' :
                    myRole === 'secretary' ? 'bg-purple-50 text-purple-700' :
                                            'bg-gray-100 text-gray-500'
                    }`}>
                    {myRole === 'host' ? 'Host' : myRole === 'secretary' ? 'Secretary' : 'Participant'}
                </span>

                {meeting?.previous_meeting_id && (
                <span className="flex items-center gap-1 text-xs text-blue-500 ml-2">
                    <Link2 size={12} />
                    Ada meeting sebelumnya
                </span>
                )}
            </div>
        </div>
    )
}