import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNote, createNote, updateNote } from '@/services/note'
import toast from 'react-hot-toast'

export const useNote = (meeting_id) => {
    return useQuery({
        queryKey: ['note', meeting_id],
        queryFn: () => getNote(meeting_id),
        enabled: !!meeting_id,
        refetchInterval: (query) => {
            // Hanya refetch kalau note sudah ada (tidak error 404)
            if (query.state.error) return false
            return 20000
        },
        refetchOnWindowFocus: false, // ← matikan, sering jadi penyebab flicker
        staleTime: 15000,
        select: (data) => data.data,
        retry: false,
    })
}

export const useCreateNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, content }) => createNote(meeting_id, content),
        onSuccess: (data, { meeting_id }) => {
            toast.success(data.message)
            // Pakai setQueryData instead of invalidateQueries
            // agar tidak trigger refetch yang bisa bikin flicker
            queryClient.setQueryData(['note', meeting_id], data)
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal membuat catatan')
        },
    })
}

export const useUpdateNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, content }) => updateNote(meeting_id, content),
        onSuccess: (data, { meeting_id }) => {
            toast.success(data.message)
            // Sama — pakai setQueryData bukan invalidateQueries
            queryClient.setQueryData(['note', meeting_id], data)
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui catatan')
        },
    })
}