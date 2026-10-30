'use client'

import { useState, useEffect } from 'react'
import { useUpdateWhatsappPhone } from '@/hooks/useUsers'
import { normalizeWhatsappPhone, validateWhatsappPhone } from '@/lib/phone'
import toast from 'react-hot-toast'

const inputClass =
    'w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition'

export default function WhatsappForm({ user, onUpdate }) {
    const hasPhone = Boolean(user?.whatsapp_phone)
    const [phone, setPhone] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const { mutate: updateWhatsapp, isPending } = useUpdateWhatsappPhone()

    useEffect(() => {
        setPhone(user?.whatsapp_phone ?? '')
        setCurrentPassword('')
        setIsDirty(false)
    }, [user?.whatsapp_phone])

    const trimmed = phone.trim()

    // Berubah = hasil normalisasi berbeda dari nomor tersimpan (termasuk pengisian pertama kali)
    const phoneChanged =
        trimmed !== '' &&
        normalizeWhatsappPhone(trimmed) !== (user?.whatsapp_phone ?? null)

    const handleChange = (e) => {
        setPhone(e.target.value)
        setIsDirty(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const phoneError = validateWhatsappPhone(trimmed)
        if (phoneError) {
            toast.error(phoneError)
            return
        }

        // Nomor sama setelah normalisasi (mis. 08xx vs 62xx): tidak ada yang perlu disimpan
        if (!phoneChanged) {
            setPhone(user?.whatsapp_phone ?? '')
            setIsDirty(false)
            return
        }

        updateWhatsapp(
            { whatsapp_phone: trimmed, current_password: currentPassword },
            {
                onSuccess: (res) => {
                    setIsDirty(false)
                    setCurrentPassword('')
                    onUpdate?.(res.data)
                },
                // Toast error sudah ditangani hook; di sini cukup kosongkan password
                onError: () => {
                    setCurrentPassword('')
                },
            }
        )
    }

    const handleCancel = () => {
        setPhone(user?.whatsapp_phone ?? '')
        setCurrentPassword('')
        setIsDirty(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label htmlFor="whatsapp_phone" className="text-sm font-medium text-gray-700">
                    Nomor WhatsApp <span className="text-red-400">*</span>
                </label>
                <input
                    id="whatsapp_phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className={inputClass}
                />
                <p className="text-xs text-gray-400">
                    Contoh: 081234567890 atau 6281234567890. Nomor ini dipakai untuk notifikasi meeting
                    dan pemulihan password.
                </p>
            </div>

            {phoneChanged && (
                <div className="space-y-1.5">
                    <label htmlFor="whatsapp_current_password" className="text-sm font-medium text-gray-700">
                        Password Saat Ini <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="whatsapp_current_password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        className={inputClass}
                    />
                    <p className="text-xs text-gray-400">
                        Diperlukan untuk mengubah nomor WhatsApp.
                    </p>
                </div>
            )}

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
            </div>
        </form>
    )
}