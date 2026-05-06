'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMeeting, useDeleteMeeting } from '@/hooks/useMeetings'
import MeetingHeader from '@/app/components/meeting/meetingDetail/MeetingHeader'
import NotesSection from '@/app/components/meeting/meetingDetail/NoteSection'
import AiSummarySection from '@/app/components/meeting/meetingDetail/AiSummarySection'
import ActionItemsSection from '@/app/components/meeting/meetingDetail/ActionItemsSection'
import ParticipantsSection from '@/app/components/meeting/meetingDetail/ParticipantsSection'
import PreviousMeetingSection from '@/app/components/meeting/meetingDetail/PreviousMeetingSection'
import MeetingFormModal from '@/app/components/meeting/modals/MeetingFormModal'
import AddParticipantModal from '@/app/components/meeting/modals/AddParticipants'
import AddActionItemModal from '@/app/components/meeting/modals/AddActionItemModal'
import ContinueMeetingModal from '@/app/components/meeting/modals/ContinueMeetingModal'
import Sidebar from "@/app/components/ui/SideBar";

export default function MeetingDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: meeting, isLoading } = useMeeting(id)
    const { mutate: deleteMeeting } = useDeleteMeeting()

    const [showEditModal, setShowEditModal] = useState(false)
    const [showContinueModal, setShowContinueModal] = useState(false)
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)
    const [showAddActionItemModal, setShowAddActionItemModal] = useState(false)
    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setCurrentUser(user)
    }, [])

    const myRole = meeting?.participants?.find(
        (p) => p.id === currentUser?.id
    )?.role

    const canEdit = ['host', 'secretary'].includes(myRole)
    const isHost = myRole === 'host'

    const handleDelete = () => {
        if (!confirm('Yakin ingin menghapus meeting ini?')) return
        deleteMeeting(id, {
        onSuccess: () => {
            router.push('/dashboard')
        },
        })
    }

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
        </div>
    )

    if (!meeting) return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
        Meeting tidak ditemukan
        </div>
    )

    return(
        <div className="flex flex-col md:flex-row w-full bg-white">
            <Sidebar />
            <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
                {/* Header */}
                <MeetingHeader
                    meeting={meeting}
                    myRole={myRole}
                    onEdit={() => setShowEditModal(true)}
                    onContinue={() => setShowContinueModal(true)}
                    onDelete={handleDelete}
                />

                {/* Previous Meeting */}
                <PreviousMeetingSection
                    meetingId={id}
                    previousMeetingId={meeting?.previous_meeting_id}
                />

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Kolom Kiri - ActionItems */}
                    <ActionItemsSection
                        meetingId={id}
                        canEdit={canEdit}
                        participants={meeting?.participants ?? []}
                        onAdd={() => setShowAddActionItemModal(true)}
                    />

                    {/* Kolom Kanan - Participants */}
                    <ParticipantsSection
                        meetingId={id}
                        participants={meeting?.participants ?? []}
                        isHost={isHost}
                        currentUserId={currentUser?.id}
                        onAddParticipant={() => setShowAddParticipantModal(true)}
                    />
                </div>

                {/* Notes Section - Full Width Below */}
                <NotesSection meetingId={id} canEdit={canEdit} />

                {/* AI Summary Section */}
                <AiSummarySection meeting={meeting} />

                {/* Modals */}
                {showEditModal && (
                    <MeetingFormModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        meeting={meeting}
                    />
                )}
                {showContinueModal && (
                    <ContinueMeetingModal
                        isOpen={showContinueModal}
                        onClose={() => setShowContinueModal(false)}
                        meetingId={id}
                        participants={meeting?.participants ?? []}
                    />
                )}
                {showAddParticipantModal && (
                    <AddParticipantModal
                        isOpen={showAddParticipantModal}
                        onClose={() => setShowAddParticipantModal(false)}
                        meetingId={id}
                        existingParticipants={meeting?.participants ?? []}
                    />
                )}
                {showAddActionItemModal && (
                    <AddActionItemModal
                        isOpen={showAddActionItemModal}
                        onClose={() => setShowAddActionItemModal(false)}
                        meetingId={id}
                        participants={meeting?.participants ?? []}
                    />
                )}
            </div>
        </div>
    )
}