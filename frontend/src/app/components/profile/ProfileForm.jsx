'use client'

import { useState, useEffect } from 'react'
import { useUpdateProfile } from '@/hooks/useUsers'
import toast from 'react-hot-toast'

const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"

export default function ProfileForm({ user, onUpdate }) {
    const { mutate: updateProfile, isPending } = useUpdateProfile()
    const [form, setForm] = useState({ name: '', email: '' })
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (user) {
        setForm({ name: user.name ?? '', email: user.email ?? '' })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setIsDirty(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        updateProfile(
        { name: form.name, email: form.email },
        {
            onSuccess: (data) => {
                setIsDirty(false)
            onUpdate?.(data.data)
            }
        }
        )
    }

    const handleCancel = () => {
        setForm({ name: user?.name ?? '', email: user?.email ?? '' })
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