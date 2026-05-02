import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createContinuation, getPreviousMeeting } from '@/services/continuation'
import toast from 'react-hot-toast'

export const usePreviousMeeting = (meeting_id) => {
    return useQuery({
        queryKey: ['previous-meeting', meeting_id],
        queryFn: () => getPreviousMeeting(meeting_id),
        enabled: !!meeting_id,
        select: (data) => data.data,
    })
}

export const useCreateContinuation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, body }) => createContinuation(meeting_id, body),
        onSuccess: () => {
            toast.success('Berhasil meneruskan meeting')
            queryClient.invalidateQueries({ queryKey: ['meetings'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal meneruskan rapat')
        }
    })
}