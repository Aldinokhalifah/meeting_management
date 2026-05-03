'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getDate } from '@/lib/getDate'
import { getGreeting } from '@/lib/getGreeting'

export default function DashboardHeader({ user, onCreateMeeting }) {
    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-12 lg:mt-0">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {getGreeting()},{' '}
                    <span className="text-yellow-600">{user?.name ?? 'Pengguna'}</span> 👋
                    </h1>
                <p className="text-sm text-gray-500 mt-0.5">{getDate()}</p>
            </div>
            <button
                onClick={onCreateMeeting}
                href="/meeting/new"
                className="flex items-center mt-2 justify-center gap-2 px-4 w-full lg:w-fit py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                <Plus size={16} />
                Buat Meeting
            </button>
        </div>
    )
}