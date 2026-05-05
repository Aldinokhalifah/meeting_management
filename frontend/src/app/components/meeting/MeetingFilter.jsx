'use client'

import { ROOMS } from "@/lib/room"
import { STATUS_OPTIONS } from "@/lib/status_options"

const selectClass = "h-9 pl-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white transition"

export default function MeetingFilter({ status, room, onStatusChange, onRoomChange }) {
    return (
        <div className="flex items-center gap-2 flex-wrap w-full">
            {/* Filter Status */}
            <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={selectClass}
            >
                {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Filter Room */}
            <select
                value={room}
                onChange={(e) => onRoomChange(e.target.value)}
                className={selectClass}
            >
                <option value="all">Semua Ruangan</option>
                {ROOMS.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
                ))}
                <option value="Online">Online</option>
            </select>
        </div>
    )
}