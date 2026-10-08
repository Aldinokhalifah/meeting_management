import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    getAttachments, presignAttachment, uploadToStorage, confirmAttachment,
    getAttachmentUrl, deleteAttachment,
} from '@/services/attachment'
import toast from 'react-hot-toast'

export const useAttachments = (meeting_id) => {
    return useQuery({
        queryKey: ['attachments', meeting_id],
        queryFn: () => getAttachments(meeting_id),
        enabled: !!meeting_id,
        staleTime: 10000,
        refetchInterval: 15000,
        select: (data) => data.data,
    })
}

// 3 langkah: presign -> upload langsung ke MinIO -> confirm
export const useUploadAttachment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ meeting_id, file, onProgress }) => {
            const presigned = await presignAttachment(meeting_id, {
                file_name: file.name,
                file_size: file.size,
            })
            const { attachment_id, upload_url, fields } = presigned.data

            try {
                await uploadToStorage({ upload_url, fields, file, onProgress })
                return await confirmAttachment(meeting_id, attachment_id)
            } catch (err) {
                // Bersihkan record 'pending' supaya tidak menggantung (jika sudah dibuang backend, errornya diabaikan)
                deleteAttachment(meeting_id, attachment_id).catch(() => {})
                throw err
            }
        },
        onSuccess: (_, { meeting_id, file }) => {
            toast.success(`${file.name} berhasil diunggah`)
            queryClient.invalidateQueries({ queryKey: ['attachments', meeting_id] })
        },
        onError: (err, { file }) => {
            toast.error(`${file.name}: ${err.message || 'Gagal mengunggah dokumen'}`)
        },
    })
}

export const useDeleteAttachment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, attachment_id }) => deleteAttachment(meeting_id, attachment_id),
        onSuccess: (data, { meeting_id }) => {
            toast.success(data.message)
            queryClient.invalidateQueries({ queryKey: ['attachments', meeting_id] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal menghapus dokumen')
        },
    })
}

// URL untuk preview di modal. Dibuat setiap modal dibuka dan tidak di-refetch saat window
// kembali fokus, supaya iframe/gambar tidak reload sendiri. URL berlaku 10 menit.
export const useAttachmentUrl = (meeting_id, attachment_id, mode, enabled = true) => {
    return useQuery({
        queryKey: ['attachment-url', meeting_id, attachment_id, mode],
        queryFn: () => getAttachmentUrl(meeting_id, attachment_id, mode),
        enabled: enabled && !!meeting_id && !!attachment_id,
        staleTime: Infinity,
        gcTime: 0,
        refetchOnWindowFocus: false,
        retry: false,
        select: (data) => data.data,
    })
}

// Content-Disposition: attachment dari MinIO membuat browser mengunduh tanpa meninggalkan halaman
const startDownload = (url) => {
    const link = document.createElement('a')
    link.href = url
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export const useDownloadAttachment = () => {
    return useMutation({
        mutationFn: async ({ meeting_id, attachment_id }) => {
            const res = await getAttachmentUrl(meeting_id, attachment_id, 'download')
            startDownload(res.data.url)
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal mengunduh dokumen')
        },
    })
}
