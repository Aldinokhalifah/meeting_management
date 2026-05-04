import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNote, createNote, updateNote } from '@/services/note'
import toast from 'react-hot-toast'

export const useNote = (meeting_id) => {
    return useQuery({
        queryKey: ['note', meeting_id],
        queryFn: () => getNote(meeting_id),
        enabled: !!meeting_id,
        refetchInterval: 20000,
        refetchOnWindowFocus: true,
        staleTime: 15000,         
        select: (data) => data.data,
        retry: false,             // ← jangan retry kalau 404 (belum ada notulen)
    })
}

export const useCreateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, content }) => createNote(meeting_id, content),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['note', meeting_id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal membuat catatan");
        }
    })
}

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, content }) => updateNote(meeting_id, content),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['note', meeting_id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal memperbarui catatan");
        }
    })
}