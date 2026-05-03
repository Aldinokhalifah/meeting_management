'use client'

import { useState, useEffect } from 'react'
import Modal from '../../ui/Modal'
import { useCreateContinuation } from '@/hooks/useContinuation'
import { ROOMS } from '@/lib/room'
import { Info } from 'lucide-react'
import toast from 'react-hot-toast'

const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"

const INITIAL_FORM = {
    title: '',
    description: '',
    scheduled_at: '',
    end_time: '',
    location: '',
}

const ACCESS_LABELS = {
    full: 'Full — lihat semua detail meeting ini',
    summary_only: 'Summary Only — hanya judul & jadwal',
    none: 'Tidak ada akses',
}

export default function ContinueMeetingModal({ isOpen, onClose, meetingId, participants = [] }) {
    const { mutate: createContinuation, isPending } = useCreateContinuation()
    const [form, setForm] = useState(INITIAL_FORM)
    const [participantAccess, setParticipantAccess] = useState({})

    // Set default access untuk semua peserta
    useEffect(() => {
        if (isOpen) {
        const defaults = {}
        participants.forEach((p) => {
            defaults[p.id] = { include: true, role: 'participant', access_level: 'full' }
        })
        setParticipantAccess(defaults)
        setForm(INITIAL_FORM)
        }
    }, [isOpen, participants])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleParticipantChange = (userId, field, value) => {
        setParticipantAccess((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], [field]: value },
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const participant_ids = Object.entries(participantAccess)
        .filter(([, val]) => val.include)
        .map(([user_id, val]) => ({
            user_id,
            role: val.role,
            access_level: val.access_level,
        }))

        createContinuation(
        {
            meeting_id: meetingId,
            body: {
            title: form.title,
            description: form.description || undefined,
            scheduled_at: form.scheduled_at,
            end_time: form.end_time || undefined,
            location: form.location || undefined,
            participant_ids,
            },
        },
        {
            onSuccess: () => {
            onClose()
            },
        }
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Meeting Lanjutan" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Info banner */}
                <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">
                    Action items yang masih <strong>open</strong> dari meeting ini akan otomatis di-carry over ke meeting baru.
                </p>
                </div>

                {/* Form meeting baru */}
                <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                    Judul <span className="text-red-400">*</span>
                    </label>
                    <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Sprint Planning Lanjutan..."
                    required
                    className={inputClass}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Agenda meeting lanjutan..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Mulai <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="scheduled_at"
                        value={form.scheduled_at}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Selesai</label>
                    <input
                        type="datetime-local"
                        name="end_time"
                        value={form.end_time}
                        onChange={handleChange}
                        className={inputClass}
                    />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Lokasi / Ruangan</label>
                    <select name="location" value={form.location} onChange={handleChange} className={inputClass}>
                    <option value="">-- Pilih Ruangan --</option>
                    {ROOMS.map((room) => (
                        <option key={room.id} value={room.name}>
                        {room.name} ({room.capacity} orang)
                        </option>
                    ))}
                    <option value="Online">Online</option>
                    </select>
                </div>
                </div>

                {/* Peserta & akses */}
                <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Peserta & Akses ke Meeting Ini</p>
                <p className="text-xs text-gray-400">
                    Atur siapa yang ikut meeting lanjutan dan seberapa besar akses mereka ke notulen meeting ini.
                </p>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    {participants.map((p, i) => {
                    const access = participantAccess[p.id] ?? { include: true, role: 'participant', access_level: 'full' }
                    const isHost = p.role === 'host'

                    return (
                        <div
                        key={p.id}
                        className={`flex items-center gap-3 p-3 ${i !== 0 ? 'border-t border-gray-100' : ''} ${!access.include ? 'opacity-50' : ''}`}
                        >
                        {/* Checkbox include */}
                        <input
                            type="checkbox"
                            checked={isHost || access.include}
                            disabled={isHost}
                            onChange={(e) => handleParticipantChange(p.id, 'include', e.target.checked)}
                            className="accent-yellow-500"
                        />

                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-yellow-700">
                            {p.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Nama */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                            {p.name} {isHost && <span className="text-xs text-gray-400">(Host)</span>}
                            </p>
                        </div>

                        {/* Role */}
                        {!isHost && access.include && (
                            <select
                            value={access.role}
                            onChange={(e) => handleParticipantChange(p.id, 'role', e.target.value)}
                            className="text-xs border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            >
                            <option value="participant">Participant</option>
                            <option value="secretary">Secretary</option>
                            </select>
                        )}

                        {/* Access level */}
                        {access.include && (
                            <select
                            value={access.access_level}
                            onChange={(e) => handleParticipantChange(p.id, 'access_level', e.target.value)}
                            className="text-xs border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            >
                            {Object.entries(ACCESS_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                            </select>
                        )}
                        </div>
                    )
                    })}
                </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
                >
                    {isPending ? 'Membuat...' : 'Buat Meeting Lanjutan'}
                </button>
                </div>
            </form>
        </Modal>
    )
}