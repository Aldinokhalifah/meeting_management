'use client'

import { useState } from 'react'
import Modal from '../../ui/Modal'
import { useSearchUsers } from '@/hooks/useUsers'
import { useAddParticipant } from '@/hooks/useMeetings'
import { Search, UserPlus, Loader } from 'lucide-react'

export default function AddParticipantModal({ isOpen, onClose, meetingId, existingParticipants = [] }) {
    const [keyword, setKeyword] = useState('')
    const { data: results = [], isLoading } = useSearchUsers(keyword)
    const { mutate: addParticipant, isPending } = useAddParticipant()

    const existingIds = existingParticipants.map((p) => p.id)

    const handleAdd = (userId) => {
        addParticipant(
        { meeting_id: meetingId, user_id: userId },
        {
            onSuccess: () => {
            setKeyword('')
            onClose()
            },
        }
        )
    }

    const handleClose = () => {
        setKeyword('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Peserta" size="sm">
            <div className="space-y-4">

                {/* Search Input */}
                <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                />
                </div>

                {/* Results */}
                <div className="space-y-1 min-h-30">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                    <Loader size={16} className="animate-spin text-gray-400" />
                    </div>
                )}

                {!isLoading && keyword.length >= 2 && results.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                    User tidak ditemukan
                    </p>
                )}

                {!isLoading && keyword.length < 2 && (
                    <p className="text-sm text-gray-400 text-center py-8">
                    Ketik minimal 2 karakter untuk mencari
                    </p>
                )}

                {results.map((user) => {
                    const isAlready = existingIds.includes(user.id)
                    return (
                    <div
                        key={user.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-yellow-700">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>

                        {/* Action */}
                        {isAlready ? (
                        <span className="text-xs text-gray-400 shrink-0">Sudah ada</span>
                        ) : (
                        <button
                            onClick={() => handleAdd(user.id)}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 transition shrink-0"
                        >
                            <UserPlus size={12} />
                            Tambah
                        </button>
                        )}
                    </div>
                    )
                })}
                </div>
            </div>
        </Modal>
    )
}