import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getActionItems, createActionItem, updateActionItem, deleteActionItem, } from '@/services/actionItem'
import toast from 'react-hot-toast'

export const useActionItems = (meeting_id, status = null) => {
    return useQuery({
        queryKey: ['action-items', meeting_id, status],
        queryFn: () => getActionItems(meeting_id, status),
        enabled: !!meeting_id,
        refetchInterval: 10000,
        select: (data) => data.data,
    })
}

export const useActionItemsQueries = (meetingIds = [], status = null) => {
    const ids = meetingIds.filter(Boolean)

    return useQueries({
        queries: ids.map((id) => ({
            queryKey: ['action-items', id, status],
            queryFn: () => getActionItems(id, status),
            enabled: !!id,
            refetchInterval: 10000,
            select: (data) => data?.data ?? [],
        })),
    })
}

export const useCreateActionItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, body }) => createActionItem(meeting_id, body),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['action-items', meeting_id] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal membuat action item');
        }
    })
}

export const useUpdateActionItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, item_id, body }) => updateActionItem(meeting_id, item_id, body),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['action-items', meeting_id] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui action item');
        }
    })
}

export const useDeleteActionItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ meeting_id, item_id }) => deleteActionItem(meeting_id, item_id),
        onSuccess: (_, { meeting_id }) => {
            toast.success(_.message);
            queryClient.invalidateQueries({ queryKey: ['action-items', meeting_id] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal menghapus action item');
        }
    })
}