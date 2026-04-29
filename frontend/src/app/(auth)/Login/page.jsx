'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/services/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login({ email, password });
            toast.success('Login berhasil!');
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError(err.message || 'Login gagal');
            toast.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/probesco.webp"
                        width={40}
                        height={40}
                        alt="Probesco logo"
                        className="rounded-md shadow-md"
                    />
                    <span className="font-bold text-sm md:text-lg text-gray-900">
                        Probesco - Meeting Management
                    </span>
                    </Link>
                </div>

                {/* Heading */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
                    <p className="text-sm text-gray-500 mt-1">Masuk ke meeting management</p>
                </div>

                {/* Error alert */}
                {/* {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                    </div>
                )} */}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="nama@perusahaan.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    </div>

                    <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Kata Sandi</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors mt-2"
                    >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Memproses...
                        </span>
                    ) : 'Masuk'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href="/Register" className="text-yellow-600 hover:underline font-medium">
                        Daftar di sini
                    </Link>
                    </p>
                </div>
                </div>
            </div>
        </div>
    )
}