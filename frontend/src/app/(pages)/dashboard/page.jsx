'use client'

import { useEffect, useState } from 'react'
import { useMeetings } from '@/hooks/useMeetings'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import DashboardBanner from '@/app/components/dashboard/DashboardBanner'
import TodaySchedule from '@/app/components/dashboard/TodaySchedule'
import AllMeetings from '@/app/components/dashboard/AllMeetings'
import RoomSection from '@/app/components/dashboard/RoomSection'
import ActionItemsSection from '@/app/components/dashboard/ActionItemsSection'
import Sidebar from "@/app/components/SideBar";

export default function Dashboard() {
    const { data: meetings = [], isLoading } = useMeetings()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (stored) setUser(JSON.parse(stored))
    }, [])

    if (isLoading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
        </div>
        )
    }
    return(
        <div className="flex flex-col md:flex-row h-screen w-full">
            <Sidebar />
            <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
                {/* Header */}
                <DashboardHeader user={user} />

                {/* Banner */}
                <DashboardBanner meetings={meetings} />

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                    <TodaySchedule meetings={meetings} />
                    <AllMeetings meetings={meetings} />
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                    <RoomSection meetings={meetings} />
                    <ActionItemsSection meetings={meetings} />
                    </div>

                </div>
            </div>
        </div>
    )
}