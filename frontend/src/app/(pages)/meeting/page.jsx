'use client'

import MeetingFilter from "@/app/components/meeting/MeetingFilter"
import MeetingSearch from "@/app/components/meeting/MeetingSearch"
import MeetingTable from "@/app/components/meeting/MeetingTable"
import MeetingFormModal from "@/app/components/meeting/modals/MeetingFormModal"
import Sidebar from "@/app/components/ui/SideBar"
import { useMeetings } from "@/hooks/useMeetings"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export default function MeetingPage() {
    const { data: meetings = [], isLoading } = useMeetings()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [roomFilter, setRoomFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editMeeting, setEditMeeting] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) setCurrentUser(JSON.parse(stored))
    }, [])

    // Filter & search
    const filtered = useMemo(() => {
        return meetings.filter((m) => {
        const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || m.status === statusFilter
        const matchRoom = roomFilter === 'all' || m.location === roomFilter
        return matchSearch && matchStatus && matchRoom
        })
    }, [meetings, search, statusFilter, roomFilter])

    // Pisah upcoming dan past
    const upcoming = useMemo(() => filtered.filter((m) =>
        ['scheduled', 'ongoing'].includes(m.status)
    ), [filtered])

    const past = useMemo(() => filtered.filter((m) =>
        ['done', 'cancelled'].includes(m.status)
    ), [filtered])
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
        </div>
    )

    return (
        <div className="flex flex-col md:flex-row w-full bg-white min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto p-4 sm:p-5 md:p-6 space-y-4">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-14 lg:mt-0">
                    <div className="flex-1">
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Meeting Saya</h1>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {meetings.length} meeting total
                        </p>
                    </div>
                    <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                    <Plus size={16} />
                    Buat Meeting
                    </button>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                    <MeetingSearch value={search} onChange={setSearch} />
                    </div>
                    <div className="w-full sm:w-auto shrink-0">
                    <MeetingFilter
                    status={statusFilter}
                    room={roomFilter}
                    onStatusChange={setStatusFilter}
                    onRoomChange={setRoomFilter}
                    />
                    </div>
                </div>

                {/* Upcoming */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 sm:mb-4">
                    Upcoming & Ongoing
                    <span className="ml-2 text-gray-300">({upcoming.length})</span>
                    </p>
                    <MeetingTable
                    meetings={upcoming}
                    currentUserId={currentUser?.id}
                    onEdit={(m) => setEditMeeting(m)}
                    />
                </div>

                {/* Past & Cancelled */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 sm:mb-4">
                    Selesai & Dibatalkan
                    <span className="ml-2 text-gray-300">({past.length})</span>
                    </p>
                    <MeetingTable
                    meetings={past}
                    currentUserId={currentUser?.id}
                    onEdit={(m) => setEditMeeting(m)}
                    />
                </div>

                {/* Modals */}
                <MeetingFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />
                <MeetingFormModal
                    isOpen={!!editMeeting}
                    onClose={() => setEditMeeting(null)}
                    meeting={editMeeting}
                />
            </div>
        </div>
    )
}