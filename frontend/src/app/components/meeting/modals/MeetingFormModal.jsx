'use client'

import { useState, useEffect } from 'react'
import Modal from '../../ui/Modal'
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeetings'
import { ROOMS } from '@/lib/room'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
    title: '',
    description: '',
    scheduled_at: '',
    end_time: '',
    location: '',
    }

const InputField = ({ label, required, children }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
)

const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"

export default function MeetingFormModal({ isOpen, onClose, meeting = null }) {
    const isEdit = !!meeting
    const { mutate: createMeeting, isPending: creating } = useCreateMeeting()
    const { mutate: updateMeeting, isPending: updating } = useUpdateMeeting()
    const isPending = creating || updating

    const [form, setForm] = useState(INITIAL_FORM)

    // Isi form kalau mode edit
    useEffect(() => {
        if (isEdit && meeting) {
        const toDatetimeLocal = (val) =>
            val ? new Date(val).toISOString().slice(0, 16) : ''

        setForm({
            title: meeting.title ?? '',
            description: meeting.description ?? '',
            scheduled_at: toDatetimeLocal(meeting.scheduled_at),
            end_time: toDatetimeLocal(meeting.end_time),
            location: meeting.location ?? '',
        })
        } else {
        setForm(INITIAL_FORM)
        }
    }, [isOpen, meeting])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const body = {
        title: form.title,
        description: form.description || undefined,
        scheduled_at: form.scheduled_at,
        end_time: form.end_time || undefined,
        location: form.location || undefined,
        }

        if (isEdit) {
        updateMeeting(
            { id: meeting.id, body },
            {
            onSuccess: () => {
                onClose()
            },
            }
        )
        } else {
        createMeeting(body, {
            onSuccess: () => {
            onClose()
            },
        })
        }
    }

    return (
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEdit ? 'Edit Meeting' : 'Buat Meeting Baru'}
        size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">

                <InputField label="Judul Meeting" required>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Sprint Planning Q2..."
                    required
                    className={inputClass}
                />
                </InputField>

                <InputField label="Deskripsi">
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Agenda meeting ini..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                />
                </InputField>

                <div className="grid grid-cols-2 gap-3">
                <InputField label="Mulai" required>
                    <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={form.scheduled_at}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    />
                </InputField>
                <InputField label="Selesai">
                    <input
                    type="datetime-local"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className={inputClass}
                    />
                </InputField>
                </div>

                <InputField label="Lokasi / Ruangan">
                <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="">-- Pilih Ruangan --</option>
                    {ROOMS.map((room) => (
                    <option key={room.id} value={room.name}>
                        {room.name} ({room.capacity} orang)
                    </option>
                    ))}
                    <option value="Online">Online</option>
                </select>
                </InputField>

                {/* Footer */}
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
                    {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Meeting'}
                </button>
                </div>
            </form>
        </Modal>
    )
}