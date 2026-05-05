'use client'

import { Search } from 'lucide-react'

export default function MeetingSearch({ value, onChange }) {
    return (
        <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Cari judul meeting..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            />
        </div>
    )
}