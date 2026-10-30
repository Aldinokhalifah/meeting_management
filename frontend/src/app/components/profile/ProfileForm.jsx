'use client'

import { useState, useEffect } from 'react'
import { useUpdateProfile } from '@/hooks/useUsers'

const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"

export default function ProfileForm({ user, onUpdate }) {
    const { mutate: updateProfile, isPending } = useUpdateProfile()
    const [form, setForm] = useState({ name: '', email: '', current_password: '' })
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (user) {
        setForm({ name: user.name ?? '', email: user.email ?? '', current_password: '' })
        }
    }, [user])

    // Backend mewajibkan password saat email berubah (perbandingan persis)
    const emailChanged = form.email !== (user?.email ?? '')

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setIsDirty(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const body = { name: form.name, email: form.email }
        if (emailChanged) body.current_password = form.current_password

        updateProfile(body, {
        onSuccess: (data) => {
            setIsDirty(false)
            onUpdate?.(data.data)
        },
        // Toast error sudah ditangani hook; di sini cukup kosongkan password
        onError: () => {
            setForm((prev) => ({ ...prev, current_password: '' }))
        },
        })
    }

    const handleCancel = () => {
        setForm({ name: user?.name ?? '', email: user?.email ?? '', current_password: '' })
        setIsDirty(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
            Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama lengkap kamu"
            required
            className={inputClass}
            />
        </div>

        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
            Email <span className="text-red-400">*</span>
            </label>
            <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@perusahaan.com"
            required
            className={inputClass}
            />
        </div>

        {emailChanged && (
            <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
                Password Saat Ini <span className="text-red-400">*</span>
            </label>
            <input
                name="current_password"
                type="password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={inputClass}
            />
            <p className="text-xs text-gray-400">
                Diperlukan untuk mengubah email.
            </p>
            </div>
        )}

        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Bergabung Sejak</label>
            <input
            value={user?.created_at
                ? new Date(user.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                })
                : '-'
            }
            disabled
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
        </div>

        {isDirty && (
            <div className="flex items-center gap-2 pt-1">
            <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
            >
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
                Batal
            </button>
            </div>
        )}
        </form>
    )
}