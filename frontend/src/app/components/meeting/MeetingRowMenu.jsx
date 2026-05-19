'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Eye, Pencil, XCircle, Trash2 } from 'lucide-react'
import { useUpdateMeeting, useDeleteMeeting } from '@/hooks/useMeetings'
import toast from 'react-hot-toast'

export default function MeetingRowMenu({ meeting, myRole, onEdit }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const ref = useRef(null)
    const { mutate: updateMeeting } = useUpdateMeeting()
    const { mutate: deleteMeeting } = useDeleteMeeting()
    const isHost = myRole === 'host'

    // Calculate menu position for fixed positioning
    useEffect(() => {
        if (open && ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 8,
                left: rect.right - 176, // w-44 = 11rem = 176px
            })
        }
    }, [open])

    // Close kalau klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
            }
            document.addEventListener('mousedown', handler)
            return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleCancel = () => {
        if (!confirm('Yakin ingin membatalkan meeting ini?')) return
            updateMeeting(
            { id: meeting.id, body: { status: 'cancelled' } },
            { onSuccess: () => { toast.success('Meeting dibatalkan'); setOpen(false) } }
        )
    }

    const handleDelete = () => {
        if (!confirm('Yakin ingin menghapus meeting ini? Tindakan ini tidak bisa dibatalkan.')) return
            deleteMeeting(meeting.id, {
            onSuccess: () => { setOpen(false) }
        })
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
                <MoreVertical size={15} />
            </button>

            {open && (
                <div className="fixed z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden" style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                }}>

                <button
                    onClick={() => { router.push(`/meeting/${meeting.id}`); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                    <Eye size={14} className="text-gray-400" />
                    Lihat Detail
                </button>

                {isHost && meeting.status !== 'done' && meeting.status !== 'cancelled' && (
                    <button
                    onClick={() => { onEdit(); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                    <Pencil size={14} className="text-gray-400" />
                    Edit Meeting
                    </button>
                )}

                {isHost && (meeting.status === 'scheduled' || meeting.status === 'ongoing') && (
                    <button
                    onClick={handleCancel}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition"
                    >
                    <XCircle size={14} />
                    Batalkan Meeting
                    </button>
                )}

                {isHost && (
                    <>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                        <Trash2 size={14} />
                        Hapus Meeting
                    </button>
                    </>
                )}
                </div>
            )}
        </div>
    )
}