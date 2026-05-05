import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchUsers, updateProfile, updatePassword } from '@/services/user'
import toast from 'react-hot-toast'

export const useSearchUsers = (keyword) => {
    return useQuery({
        queryKey: ['users-search', keyword],
        queryFn: () => searchUsers(keyword),
        enabled: !!keyword && keyword.length >= 2,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.data,
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body) => updateProfile(body),
        onSuccess: (_, data) => {
            toast.success(_.message);
            // Update data user di localStorage
            const stored = localStorage.getItem('user')
            if (stored) {
                const user = JSON.parse(stored)
                localStorage.setItem('user', JSON.stringify({ ...user, ...data.data }))
            }
            queryClient.invalidateQueries({ queryKey: ['me'] })
            },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui profil');
        },
    })
}

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (body) => updatePassword(body),
        onSuccess: (_) => {
            toast.success(_.message);
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui password')
        },
    })
}