import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting, addParticipant, removeParticipant, updateParticipantRole, } from '@/services/meeting'
import toast from 'react-hot-toast'

export const useMeetings = () => {
    return useQuery({
        queryKey: ['meetings'],
        queryFn: getMeetings,
        refetchInterval: 30000,
        select: (data) => data.data,
    })
}

export const useMeeting = (id) => {
    return useQuery({
        queryKey: ['meeting', id],
        queryFn: () => getMeetingById(id),
        enabled: !!id,
        refetchInterval: 15000,
        select: (data) => data.data,
    })
}

export const useCreateMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => createMeeting(body),
        onSuccess: (_) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal membuat meeting");
        }
    })
}

export const useUpdateMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }) => updateMeeting(id, body),
        onSuccess: (_, { id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            queryClient.invalidateQueries({ queryKey: ['meeting', id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal update meeting");
        }
    })
}

export const useDeleteMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteMeeting(id),
        onSuccess: (_) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal menghapus meeting");
        }
    })
}

export const useAddParticipant = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, user_id }) => addParticipant(meeting_id, user_id),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meeting', meeting_id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal menambahkan peserta");
        }
    })
}

export const useRemoveParticipant = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ meeting_id, user_id }) => removeParticipant(meeting_id, user_id),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meeting', meeting_id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal menghapus peserta");
        }
    })
}

export const useUpdateParticipantRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, user_id, role }) => updateParticipantRole(meeting_id, user_id, role),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['meeting', meeting_id] });
        },
        onError: (err) => {
            toast.error(err.message || "Gagal memperbarui peserta");
        }
    })
}