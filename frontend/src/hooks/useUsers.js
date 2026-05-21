import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    searchUsers,
    updateProfile,
    updatePassword,
    setWhatsappPhone,
    updateWhatsappPhone,
    deleteWhatsappPhone,
} from '@/services/user'
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

const syncWhatsappToLocalStorage = (data) => {
    const stored = localStorage.getItem('user')
    if (stored && data?.data) {
        const user = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...user, ...data.data }))
    }
}

export const useSetWhatsappPhone = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body) => setWhatsappPhone(body),
        onSuccess: (res) => {
            toast.success(res.message)
            syncWhatsappToLocalStorage(res)
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal menambahkan nomor WhatsApp')
        },
    })
}

export const useUpdateWhatsappPhone = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body) => updateWhatsappPhone(body),
        onSuccess: (res) => {
            toast.success(res.message)
            syncWhatsappToLocalStorage(res)
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal memperbarui nomor WhatsApp')
        },
    })
}

export const useDeleteWhatsappPhone = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => deleteWhatsappPhone(),
        onSuccess: (res) => {
            toast.success(res.message)
            syncWhatsappToLocalStorage(res)
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Gagal menghapus nomor WhatsApp')
        },
    })
}