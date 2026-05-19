'use client'

import { useRouter } from 'next/navigation'
import MeetingRowMenu from './MeetingRowMenu'
import { STATUS_CONFIG } from '@/lib/status_config'
import { formatTime } from '@/lib/formatTime'
import { useMemo } from 'react'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
})

export default function MeetingTable({ meetings = [], currentUserId, onEdit }) {
    const router = useRouter()
    
    const rows = useMemo(() => meetings.map((meeting) => {
        const participantCount = meeting.participants?.length ?? meeting.participant_count ?? 0
        const myRole = meeting.participants?.find((p) => p.id === currentUserId)?.role ?? meeting.my_role ?? meeting.myRole
        return {
            ...meeting,
            participantCount,
            myRole,
        }
    }), [meetings, currentUserId])
    
    const ParticipantCount = ({ count = 0 }) => (
        <span className="text-sm text-gray-500">
            {count} peserta
        </span>
    )

    if (meetings.length === 0) return (
        <div className="min-h-30 flex items-center justify-center text-sm text-gray-400">
            Tidak ada meeting
        </div>
    )

    return (
        <div className="overflow-x-auto min-h-40 max-h-80">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Judul</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Waktu</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Lokasi</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Peserta</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">Status</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-3">Role</th>
                        <th className="pb-3" />
                    </tr>
                </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((m) => {
                            const status = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.scheduled

                            return (
                            <tr
                                key={m.id}
                                className="hover:bg-gray-50 transition group cursor-pointer"
                                onClick={() => router.push(`/meeting/${m.id}`)}
                            >
                                {/* Judul */}
                                <td className="py-3 pr-4">
                                <p className="font-medium text-gray-800 group-hover:text-yellow-700 transition truncate max-w50">
                                    {m.title}
                                </p>
                                {m.description && (
                                    <p className="text-xs text-gray-400 truncate max-w-50 mt-0.5">
                                    {m.description}
                                    </p>
                                )}
                                </td>

                                {/* Waktu */}
                                <td className="py-3 pr-4 whitespace-nowrap">
                                <p className="text-gray-700">{formatDate(m.scheduled_at)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatTime(m.scheduled_at)}
                                    {m.end_time && ` – ${formatTime(m.end_time)}`}
                                </p>
                                </td>

                                {/* Lokasi */}
                                <td className="py-3 pr-4">
                                <span className="text-gray-600 truncate max-w-30 block">
                                    {m.location ?? <span className="text-gray-300">—</span>}
                                </span>
                                </td>

                                {/* Peserta */}
                                <td className="py-3 pr-4">
                                <ParticipantCount count={m.participantCount} />
                                </td>

                                {/* Status */}
                                <td className="py-3 pr-4">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                                    {status.label}
                                </span>
                                </td>

                                {/* Role */}
                                <td className="py-3 pr-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    m.myRole === 'host'      ? 'bg-yellow-50 text-yellow-700' :
                                    m.myRole === 'secretary' ? 'bg-purple-50 text-purple-700' :
                                                            'bg-gray-100 text-gray-500'
                                }`}>
                                    {m.myRole === 'host' ? 'Host' : m.myRole === 'secretary' ? 'Secretary' : 'Participant'}
                                </span>
                                </td>

                                {/* Menu */}
                                <td
                                className="py-3"
                                onClick={(e) => e.stopPropagation()}
                                >
                                <MeetingRowMenu
                                    meeting={m}
                                    myRole={m.myRole}
                                    onEdit={() => onEdit(m)}
                                />
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
            </table>
        </div>
    )
}