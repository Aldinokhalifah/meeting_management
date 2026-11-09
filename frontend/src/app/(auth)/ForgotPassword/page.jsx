'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForgotPassword } from '@/hooks/useAuth'

const inputClass =
    'w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const { mutate: forgotMutate, isPending } = useForgotPassword()

    const handleSubmit = (e) => {
        e.preventDefault()
        forgotMutate(
            { email: email.trim() },
            { onSuccess: () => setSent(true) }
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Masukkan email akun kamu. Link reset password akan dikirim ke nomor
                            WhatsApp yang terdaftar di akun tersebut.
                        </p>
                    </div>

                    {sent ? (
                        <div className="space-y-4">
                            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                                Jika email tersebut terdaftar dan memiliki nomor WhatsApp, link reset
                                password sudah dikirim. Link berlaku 30 menit dan hanya bisa dipakai sekali.
                            </div>
                            <button
                                type="button"
                                onClick={() => setSent(false)}
                                className="w-full h-10 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            >
                                Coba dengan email lain
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>{' '}
                                <span className="text-red-400">*</span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="nama@perusahaan.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-10 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors mt-2"
                            >
                                {isPending ? 'Memproses...' : 'Kirim Link Reset'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                        <p className="text-center text-sm text-gray-500">
                            Tidak menerima pesan? Hubungi Tim IT.
                        </p>
                        <p className="text-center text-sm text-gray-500">
                            <Link href="/Login" className="text-yellow-600 hover:underline font-medium">
                                Kembali ke halaman masuk
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}