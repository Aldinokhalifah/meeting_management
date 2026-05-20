'use client'

import { useState, useEffect } from 'react'
import {
    useSetWhatsappPhone,
    useUpdateWhatsappPhone,
    useDeleteWhatsappPhone,
} from '@/hooks/useUsers'
import toast from 'react-hot-toast'

const inputClass =
    'w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition'

export default function WhatsappForm({ user, onUpdate }) {
    const hasPhone = Boolean(user?.whatsapp_phone)
    const [phone, setPhone] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const { mutate: setWhatsapp, isPending: isSetting } = useSetWhatsappPhone()
    const { mutate: updateWhatsapp, isPending: isUpdating } = useUpdateWhatsappPhone()
    const { mutate: deleteWhatsapp, isPending: isDeleting } = useDeleteWhatsappPhone()

    const isPending = isSetting || isUpdating || isDeleting

    useEffect(() => {
        setPhone(user?.whatsapp_phone ?? '')
        setIsDirty(false)
    }, [user?.whatsapp_phone])

    const handleChange = (e) => {
        setPhone(e.target.value)
        setIsDirty(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = phone.trim()
        if (!trimmed) {
            toast.error('Nomor WhatsApp wajib diisi')
            return
        }

        const payload = { whatsapp_phone: trimmed }
        const options = {
            onSuccess: (res) => {
                setIsDirty(false)
                onUpdate?.(res.data)
            },
        }

        if (hasPhone) {
            updateWhatsapp(payload, options)
        } else {
            setWhatsapp(payload, options)
        }
    }

    const handleDelete = () => {
        confirm('Yakin menghapus Nomor anda?Tindakan ini bisa dibatalkan');
        deleteWhatsapp(undefined, {
            onSuccess: (res) => {
                setPhone('')
                setIsDirty(false)
                onUpdate?.(res.data)
            },
        })
    }

    const handleCancel = () => {
        setPhone(user?.whatsapp_phone ?? '')
        setIsDirty(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label htmlFor="whatsapp_phone" className="text-sm font-medium text-gray-700">
                    Nomor WhatsApp
                </label>
                <input
                    id="whatsapp_phone"
                    type="tel"
                    value={phone}
                    onChange={handleChange}
                    placeholder="6281234567890"
                    className={inputClass}
                />
                <p className="text-xs text-gray-400">
                    Format tanpa +, contoh: 6281234567890
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {(isDirty || !hasPhone) && (
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
                    >
                        {isPending
                            ? 'Menyimpan...'
                            : hasPhone
                              ? 'Simpan Perubahan'
                              : 'Tambah Nomor'}
                    </button>
                )}

                {isDirty && hasPhone && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        Batal
                    </button>
                )}

                {hasPhone && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition"
                    >
                        {isDeleting ? 'Menghapus...' : 'Hapus Nomor'}
                    </button>
                )}
            </div>
        </form>
    )
}
