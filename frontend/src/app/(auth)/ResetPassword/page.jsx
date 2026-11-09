'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useValidateResetToken, useResetPassword } from '@/hooks/useAuth'

const inputClass =
    'w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition'

export default function ResetPasswordPage() {
    const router = useRouter()
    const startedRef = useRef(false)
    const [token, setToken] = useState('')
    const [missingToken, setMissingToken] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const { mutate: validateMutate, isSuccess, isError } = useValidateResetToken()
    const { mutate: resetMutate, isPending } = useResetPassword()

    useEffect(() => {
        // StrictMode (dev) menjalankan efek dua kali, sedangkan hash sudah dihapus di putaran pertama
        if (startedRef.current) return
        startedRef.current = true

        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const tokenFromHash = params.get('token')

        // Hapus token dari URL secepatnya (riwayat browser, bookmark, tangkapan layar)
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }

        if (!tokenFromHash) {
            setMissingToken(true)
            return
        }

        setToken(tokenFromHash)
        validateMutate({ token: tokenFromHash })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const status = missingToken || isError ? 'invalid' : isSuccess ? 'valid' : 'checking'

    const handleSubmit = (e) => {
        e.preventDefault()

        if (newPassword.length < 6) {
            toast.error('Kata sandi minimal 6 karakter')
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('Kata sandi tidak cocok')
            return
        }

        resetMutate(
            { token, new_password: newPassword },
            {
                onSuccess: () => {
                    router.replace('/Login')
                    router.refresh()
                },
            }
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    {status === 'checking' && (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Memeriksa link...
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Link Tidak Valid</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Link reset password ini tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
                                </p>
                            </div>
                            <Link
                                href="/ForgotPassword"
                                className="flex items-center justify-center w-full h-10 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                Minta Link Baru
                            </Link>
                        </div>
                    )}

                    {status === 'valid' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Buat Password Baru</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Masukkan password baru untuk akun kamu.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="new_password" className="text-sm font-medium text-gray-700">Kata Sandi Baru</label>{' '}
                                    <span className="text-red-400">*</span>
                                    <input
                                        id="new_password"
                                        type="password"
                                        placeholder="Minimal 6 karakter"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>{' '}
                                    <span className="text-red-400">*</span>
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        placeholder="Ulangi kata sandi baru"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-10 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors mt-2"
                                >
                                    {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-center text-sm text-gray-500">
                                    Link bermasalah?{' '}
                                    <Link href="/ForgotPassword" className="text-yellow-600 hover:underline font-medium">
                                        Minta link baru
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}