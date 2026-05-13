'use client'

import { useState } from 'react'
import { useActionItems, useUpdateActionItem, useDeleteActionItem } from '@/hooks/useActionItems'
import { Plus, Trash2, CheckCircle, Circle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export default function ActionItemsSection({ meetingId, canEdit, participants = [], onAdd }) {
    const { data: items = [], isLoading } = useActionItems(meetingId)
    const { mutate: updateItem } = useUpdateActionItem()
    const { mutate: deleteItem } = useDeleteActionItem()
    const [filter, setFilter] = useState('all')

    const filtered = items.filter((item) => {
        if (filter === 'open') return item.status === 'open'
        if (filter === 'done') return item.status === 'done'
        return true
    })

    const toggleStatus = (item) => {
        const newStatus = item.status === 'done' ? 'open' : 'done'
        updateItem(
            { meeting_id: meetingId, item_id: item.id, body: { status: newStatus } }
        )
    }

    const handleDelete = (itemId) => {
        deleteItem(
            { meeting_id: meetingId, item_id: itemId }
        )
    }

    if (isLoading) return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse h-40" />
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Action Items</p>
                {canEdit && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                    <Plus size={12} />
                    Tambah
                </button>
                )}
            </div>

            {/* Filter */}
            <div className="flex gap-1.5 mb-3">
                {['all', 'open', 'done'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    filter === f
                        ? 'bg-yellow-600 text-white border-yellow-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                    {f === 'all' ? 'Semua' : f === 'open' ? 'Open' : 'Selesai'}
                </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Tidak ada action item</p>
            ) : (
                <div className="space-y-1 max-h-28 overflow-y-auto">
                {filtered.map((item) => (
                    <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition group"
                    >
                    {/* Toggle status */}
                    <button
                        onClick={() => canEdit && toggleStatus(item)}
                        disabled={!canEdit}
                        className="mt-0.5 shrink-0 text-gray-300 hover:text-yellow-500 transition disabled:cursor-default"
                    >
                        {item.status === 'done'
                        ? <CheckCircle size={16} className="text-green-500" />
                        : <Circle size={16} />
                        }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.description}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                        {item.assigned_to_name && (
                            <span className="text-xs text-gray-400">{item.assigned_to_name}</span>
                        )}
                        {item.due_date && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(item.due_date)}
                            </span>
                        )}
                        {item.carried_from_id && (
                            <span className="text-xs text-blue-400">↩ Carry-over</span>
                        )}
                        </div>
                    </div>

                    {/* Delete */}
                    {canEdit && (
                        <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition shrink-0"
                        >
                        <Trash2 size={14} />
                        </button>
                    )}
                    </div>
                ))}
                </div>
            )}
        </div>
    )
}