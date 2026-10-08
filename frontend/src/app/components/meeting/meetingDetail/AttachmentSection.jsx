'use client'

import { useRef, useState } from 'react'
import { Download, Eye, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    useAttachments, useUploadAttachment, useDeleteAttachment, useDownloadAttachment,
} from '@/hooks/useAttachments'
import {
    ACCEPT_ATTRIBUTE, MAX_ATTACHMENTS, MAX_FILE_SIZE, UPLOADABLE_STATUSES,
    formatFileSize, getFileKind, validateFile,
} from '@/lib/attachment_config'
import AttachmentPreviewModal from '../modals/AttachmentPreviewModal'

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AttachmentSection({ meetingId, canEdit, meetingStatus }) {
    const { data: attachments = [], isLoading } = useAttachments(meetingId)
    const { mutateAsync: uploadAttachment } = useUploadAttachment()
    const { mutate: deleteAttachment } = useDeleteAttachment()
    const { mutate: downloadAttachment } = useDownloadAttachment()

    const inputRef = useRef(null)
    const [uploads, setUploads] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [selected, setSelected] = useState(null)

    const statusAllowsUpload = UPLOADABLE_STATUSES.includes(meetingStatus)
    const remainingSlots = MAX_ATTACHMENTS - attachments.length - uploads.length
    const canUpload = canEdit && statusAllowsUpload && remainingSlots > 0

    const updateProgress = (key, progress) =>
        setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, progress } : u)))

    const handleFiles = async (fileList) => {
        if (!canUpload) return

        const accepted = []
        const errors = []

        for (const file of Array.from(fileList)) {
            const error = validateFile(file)
            if (error) errors.push(error)
            else if (accepted.length >= remainingSlots) errors.push(`"${file.name}": batas ${MAX_ATTACHMENTS} dokumen per meeting`)
            else accepted.push(file)
        }

        errors.forEach((message) => toast.error(message))

        // Diunggah satu per satu supaya progress jelas dan batas jumlah file tidak terlampaui
        for (const file of accepted) {
            const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
            setUploads((prev) => [...prev, { key, name: file.name, progress: 0 }])

            try {
                await uploadAttachment({
                    meeting_id: meetingId,
                    file,
                    onProgress: (progress) => updateProgress(key, progress),
                })
            } catch {
                // Pesan error sudah ditampilkan oleh hook
            } finally {
                setUploads((prev) => prev.filter((u) => u.key !== key))
            }
        }
    }

    const handleInputChange = (e) => {
        handleFiles(e.target.files)
        e.target.value = '' // izinkan memilih file yang sama lagi
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleDelete = (attachment) => {
        if (!confirm(`Yakin ingin menghapus "${attachment.file_name}"?`)) return
        deleteAttachment({ meeting_id: meetingId, attachment_id: attachment.id })
    }

    if (isLoading) return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse h-32" />
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Dokumen Pendukung</p>
                    <span className="text-xs text-gray-300">{attachments.length}/{MAX_ATTACHMENTS}</span>
                </div>
                {canUpload && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        <Upload size={12} />
                        Unggah
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTRIBUTE}
                onChange={handleInputChange}
                className="hidden"
                data-testid="attachment-input"
            />

            {/* Dropzone */}
            {canUpload && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`mb-3 cursor-pointer rounded-lg border border-dashed px-4 py-4 text-center transition ${
                        isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <p className="text-sm text-gray-500">Tarik file ke sini atau klik untuk memilih</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        JPG, PNG, WEBP, PDF, Word, Excel · maks. {formatFileSize(MAX_FILE_SIZE)} per file
                    </p>
                </div>
            )}

            {canEdit && !statusAllowsUpload && (
                <p className="mb-3 text-xs text-gray-400">
                    Dokumen hanya dapat diunggah saat meeting sedang berlangsung atau sudah selesai.
                </p>
            )}
            {canEdit && statusAllowsUpload && remainingSlots <= 0 && (
                <p className="mb-3 text-xs text-gray-400">
                    Batas {MAX_ATTACHMENTS} dokumen per meeting sudah tercapai. Hapus dokumen untuk menambah yang baru.
                </p>
            )}

            {/* Upload yang sedang berjalan */}
            {uploads.length > 0 && (
                <div className="mb-3 space-y-2">
                    {uploads.map((upload) => (
                        <div key={upload.key} className="rounded-lg bg-gray-50 px-3 py-2">
                            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                                <span className="truncate">{upload.name}</span>
                                <span className="shrink-0">{upload.progress}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-yellow-500 transition-all"
                                    style={{ width: `${upload.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List */}
            {attachments.length === 0 && uploads.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada dokumen pendukung</p>
            ) : (
                <div className="space-y-1">
                    {attachments.map((attachment) => {
                        const kind = getFileKind(attachment.file_type)
                        const Icon = kind.icon

                        return (
                            <div
                                key={attachment.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelected(attachment)}
                                    className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer"
                                >
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${kind.className}`}>
                                        <Icon size={16} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm text-gray-800">{attachment.file_name}</span>
                                        <span className="block truncate text-xs text-gray-400">
                                            {formatFileSize(attachment.file_size)}
                                            {attachment.uploaded_by_name && ` · ${attachment.uploaded_by_name}`}
                                            {` · ${formatDate(attachment.created_at)}`}
                                        </span>
                                    </span>
                                </button>

                                <div className="flex shrink-0 items-center gap-1 text-gray-300">
                                    <button
                                        type="button"
                                        title="Lihat"
                                        aria-label={`Lihat ${attachment.file_name}`}
                                        onClick={() => setSelected(attachment)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Unduh"
                                        aria-label={`Unduh ${attachment.file_name}`}
                                        onClick={() => downloadAttachment({ meeting_id: meetingId, attachment_id: attachment.id })}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition"
                                    >
                                        <Download size={14} />
                                    </button>
                                    {canEdit && (
                                        <button
                                            type="button"
                                            title="Hapus"
                                            aria-label={`Hapus ${attachment.file_name}`}
                                            onClick={() => handleDelete(attachment)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-400 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selected && (
                <AttachmentPreviewModal
                    isOpen={!!selected}
                    onClose={() => setSelected(null)}
                    meetingId={meetingId}
                    attachment={selected}
                />
            )}
        </div>
    )
}
