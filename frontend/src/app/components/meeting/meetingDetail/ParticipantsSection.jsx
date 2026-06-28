'use client'

import { useRemoveParticipant, useUpdateParticipantRole } from '@/hooks/useMeetings'
import { UserPlus, X } from 'lucide-react'
import { ROLE_CONFIG } from '@/lib/role_config'

export default function ParticipantsSection({ meetingId, participants = [], isHost, currentUserId, onAddParticipant }) {
    const { mutate: removeParticipant } = useRemoveParticipant()
    const { mutate: updateRole } = useUpdateParticipantRole()

    const handleRemove = (userId) => {
        removeParticipant(
            { meeting_id: meetingId, user_id: userId }
        )
    }

    const handleRoleChange = (userId, role) => {
        updateRole(
            { meeting_id: meetingId, user_id: userId, role }
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Peserta ({participants.length})
                </p>
                {isHost && (
                <button
                    onClick={onAddParticipant}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                    <UserPlus size={12} />
                    Tambah
                </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-1 max-h-28 overflow-y-auto">
                {participants.map((p) => {
                const roleConf = ROLE_CONFIG[p.role] ?? ROLE_CONFIG.participant
                const RoleIcon = roleConf.icon
                const isSelf = p.id === currentUserId
                const isParticipantHost = p.role === 'host'
                const initials = p.name
                ? p.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : '?'

                return (
                    <div
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition group"
                    >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-yellow-700">
                        {initials}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name} {isSelf && <span className="text-xs text-gray-400">(Kamu)</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    </div>

                    {/* Role — host bisa ubah role peserta lain */}
                    {isHost && !isParticipantHost && !isSelf ? (
                        <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        >
                        <option value="participant">Participant</option>
                        <option value="secretary">Secretary</option>
                        </select>
                    ) : (
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleConf.className}`}>
                        <RoleIcon size={10} />
                        {roleConf.label}
                        </span>
                    )}

                    {/* Remove */}
                    {isHost && !isParticipantHost && (
                        <button
                        onClick={() => handleRemove(p.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition"
                        >
                        <X size={14} />
                        </button>
                    )}
                    </div>
                )
                })}
            </div>
        </div>
    )
}