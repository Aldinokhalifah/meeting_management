'use client'

import { useState, useEffect } from 'react'
import ProfileAvatar from '@/app/components/profile/ProfileAvatar'
import ProfileForm from '@/app/components/profile/ProfileForm'
import PasswordForm from '@/app/components/profile/PasswordForm'
import Sidebar from '@/app/components/ui/SideBar'

export default function ProfilePage() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) setUser(JSON.parse(stored))
    }, [])

    const handleUpdate = (updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }))
    }

    return (
        <div className="flex flex-col md:flex-row w-full bg-white">
            <Sidebar />
            <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className='mt-12 lg:mt-0'>
                    <h1 className="text-xl font-semibold text-gray-900">Pengaturan Profil</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Kelola informasi akun kamu</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kolom Kiri — Account Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Informasi Akun
                    </p>

                    {/* Avatar */}
                    <ProfileAvatar name={user?.name} />

                    <div className="border-t border-gray-100 pt-4">
                        <ProfileForm user={user} onUpdate={handleUpdate} />
                    </div>
                    </div>

                    {/* Kolom Kanan — Password */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Password & Keamanan
                    </p>
                    <PasswordForm />
                    </div>
                </div>

            </div>
        </div>
    )
}