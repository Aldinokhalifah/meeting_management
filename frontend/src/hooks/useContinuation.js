import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createContinuation, getPreviousMeeting } from '@/services/continuation'
import toast from 'react-hot-toast'

export const usePreviousMeeting = (meeting_id, previous_meeting_id) => {
    return useQuery({
        queryKey: ['previous-meeting', meeting_id, previous_meeting_id],
        queryFn: () => getPreviousMeeting(meeting_id, previous_meeting_id),
        enabled: !!meeting_id && !!previous_meeting_id,
        select: (data) => data.data,
        staleTime: 1000 * 60 * 10,
        retry: false,
    })
}

export const useCreateContinuation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, body }) => createContinuation(meeting_id, body),
        onSuccess: (_) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meetings'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal meneruskan rapat')
        }
    })
}