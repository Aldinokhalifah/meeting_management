'use client'

import { useState } from 'react'
import Modal from '../../ui/Modal'
import { useCreateActionItem } from '@/hooks/useActionItems'
import toast from 'react-hot-toast'

const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"

const INITIAL_FORM = { description: '', assigned_to: '', due_date: '' }

export default function AddActionItemModal({ isOpen, onClose, meetingId, participants = [] }) {
    const [form, setForm] = useState(INITIAL_FORM)
    const { mutate: createActionItem, isPending } = useCreateActionItem()

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        createActionItem(
        {
            meeting_id: meetingId,
            body: {
            description: form.description,
            assigned_to: form.assigned_to || undefined,
            due_date: form.due_date || undefined,
            },
        },
        {
            onSuccess: () => {
            setForm(INITIAL_FORM)
            onClose()
            },
        }
        )
    }

    const handleClose = () => {
        setForm(INITIAL_FORM)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Action Item" size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                    Deskripsi <span className="text-red-400">*</span>
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Buat desain landing page..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                />
                </div>

                <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                <select
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="">-- Pilih Peserta --</option>
                    {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                    ))}
                </select>
                </div>

                <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    className={inputClass}
                />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
                >
                    {isPending ? 'Menyimpan...' : 'Tambah'}
                </button>
                </div>
            </form>
        </Modal>
    )
}