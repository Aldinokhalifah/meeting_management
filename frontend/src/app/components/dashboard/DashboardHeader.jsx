'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getDate } from '@/lib/getDate'
import { getGreeting } from '@/lib/getGreeting'

export default function DashboardHeader({ user }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {getGreeting()},{' '}
                    <span className="text-yellow-600">{user?.name ?? 'Pengguna'}</span> 👋
                    </h1>
                <p className="text-sm text-gray-500 mt-0.5">{getDate()}</p>
            </div>
            <Link
                href="/meeting/new"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                <Plus size={16} />
                Buat Meeting
            </Link>
        </div>
    )
}