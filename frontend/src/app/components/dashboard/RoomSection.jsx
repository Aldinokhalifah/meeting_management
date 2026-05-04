'use client'

import { ROOMS } from '@/lib/room'
import { useMemo } from 'react'

export default function RoomSection({ meetings = [] }) {

    const getRoomStatus = useMemo(() => {
        return (roomName) => {
            const now = new Date()

            const activeMeeting = meetings.find((m) => {
                if (m.location !== roomName) return false

                if (m.status === 'ongoing') return true

                if (m.status === 'scheduled' && m.end_time) {
                    const start = new Date(m.scheduled_at)
                    const end = new Date(m.end_time)
                    return now >= start && now <= end
                }

                return false
            })

            return activeMeeting ?? null
        }
    }, [meetings])

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Ruangan
            </p>
            <div className="grid grid-cols-3 gap-2">
                {ROOMS.map((room) => {
                const activeMeeting = getRoomStatus(room.name)
                const isOccupied = !!activeMeeting

                return (
                    <div
                    key={room.id}
                    className={`bg-gray-50 border ${isOccupied ? 'border-red-200' : 'border-green-200'} rounded-lg p-3`}
                    >
                    <p className="text-xs font-bold text-gray-700">{room.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{room.capacity} orang</p>

                    <span
                        className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-md ${
                        isOccupied
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {isOccupied ? 'Occupied' : 'Available'}
                    </span>

                    {isOccupied && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                        {activeMeeting.title}
                        </p>
                    )}
                    </div>
                )
                })}
            </div>
        </div>
    )
}