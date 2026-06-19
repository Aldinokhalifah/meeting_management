'use client'

import { useRoomsStatus } from '@/hooks/useMeetings'

export default function RoomSection() {
    const { data: rooms = [] } = useRoomsStatus()

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Ruangan
        </p>
        <div className="grid grid-cols-3 gap-2">
            {rooms.map((room) => {
            const isOccupied = room.status === 'occupied'
            return (
                <div key={room.id} className={`bg-gray-50 border ${isOccupied ? 'border-red-200' : 'border-green-200'} rounded-lg p-3`}>
                <p className="text-xs font-bold text-gray-700">{room.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{room.capacity} orang</p>
                <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-md ${isOccupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {isOccupied ? 'Occupied' : 'Available'}
                </span>
                </div>
            )
            })}
        </div>
        </div>
    )
}