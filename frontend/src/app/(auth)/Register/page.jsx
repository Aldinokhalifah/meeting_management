'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/services/auth'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp_phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Kata sandi tidak cocok');
            toast.error(error);
            return;
        }
        if (formData.password.length < 6) {
            setError('Kata sandi minimal 6 karakter');
            toast.error(error);
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                whatsapp_phone: formData.whatsapp_phone.trim() || undefined,
            });
            toast.success('Registrasi berhasil! Silakan login.');
            router.push('/Login');
        } catch (err) {
            setError(err.message || 'Registrasi gagal');
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
                {/* <div className="flex items-center gap-2 mb-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-lg text-gray-900">
                        Regsiter
                    </span>
                    </Link>
                </div> */}

                {/* Heading */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
                    <p className="text-sm text-gray-500 mt-1">Daftar untuk memulai meeting</p>
                </div>

                {/* Error alert */}
                {/* {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                    </div>
                )} */}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    </div>

                    <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="nama@perusahaan.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    </div>

                    <div className="space-y-1.5">
                    <label htmlFor="whatsapp_phone" className="text-sm font-medium text-gray-700">
                        Nomor WhatsApp
                        <span className="text-gray-400 font-normal"> (opsional)</span>
                    </label>
                    <input
                        id="whatsapp_phone"
                        type="tel"
                        placeholder="6281234567890"
                        name="whatsapp_phone"
                        value={formData.whatsapp_phone}
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500">Format tanpa +, contoh: 6281234567890</p>
                    </div>

                    <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Kata Sandi</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    />
                    </div>

                    <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                    ) : 'Daftar'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-center text-sm text-gray-500">
                    Sudah punya akun?{' '}
                    <Link href="/Login" className="text-yellow-600 hover:underline font-medium">
                        Masuk di sini
                    </Link>
                    </p>
                </div>
                </div>
            </div>
        </div>
    )
}