'use client'

import { useState } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import Modal from '../../ui/Modal'
import { useAttachmentUrl, useDownloadAttachment } from '@/hooks/useAttachments'
import { formatFileSize, getFileKind } from '@/lib/attachment_config'

export default function AttachmentPreviewModal({ isOpen, onClose, meetingId, attachment }) {
    const kind = getFileKind(attachment.file_type)
    const Icon = kind.icon
    const isImage = attachment.file_type.startsWith('image/')

    const [imageFailed, setImageFailed] = useState(false)
    const { data, isLoading, isError, refetch } = useAttachmentUrl(
        meetingId, attachment.id, 'preview', isOpen && kind.previewable
    )
    const { mutate: download, isPending: downloading } = useDownloadAttachment()

    const previewUrl = data?.url

    const handleDownload = () => download({ meeting_id: meetingId, attachment_id: attachment.id })

    const renderPreview = () => {
        if (!kind.previewable) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${kind.className}`}>
                        <Icon size={28} />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-gray-800 break-all">{attachment.file_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{kind.label} · {formatFileSize(attachment.file_size)}</p>
                    </div>
                    <p className="text-xs text-gray-400">Tipe file ini tidak bisa dipratinjau, silakan unduh.</p>
                </div>
            )
        }

        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
                </div>
            )
        }

        if (isError || !previewUrl || imageFailed) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <p className="text-sm text-gray-500">Pratinjau tidak dapat dimuat.</p>
                    <button
                        type="button"
                        onClick={() => { setImageFailed(false); refetch() }}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition"
                    >
                        Coba lagi
                    </button>
                </div>
            )
        }

        if (isImage) {
            return (
                // eslint-disable-next-line @next/next/no-img-element -- URL presigned dari MinIO, bukan aset Next.js
                <img
                    src={previewUrl}
                    alt={attachment.file_name}
                    onError={() => setImageFailed(true)}
                    className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain"
                />
            )
        }

        return (
            <iframe
                src={previewUrl}
                title={attachment.file_name}
                className="h-[70vh] w-full rounded-lg border border-gray-200"
            />
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={attachment.file_name} size="xl">
            <div className="space-y-4">
                {renderPreview()}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    {/* Untuk file yang tidak bisa dipratinjau, info sudah tampil di blok tengah */}
                    {kind.previewable ? (
                        <p className="text-xs text-gray-400 truncate">
                            {kind.label} · {formatFileSize(attachment.file_size)}
                        </p>
                    ) : <span />}
                    <div className="flex shrink-0 items-center gap-2">
                        {kind.previewable && previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ExternalLink size={14} />
                                Buka di tab baru
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
                        >
                            <Download size={14} />
                            {downloading ? 'Menyiapkan...' : 'Unduh'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
