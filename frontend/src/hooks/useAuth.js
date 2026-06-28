import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { login, register, logout as logoutService } from '@/services/auth'
import toast from 'react-hot-toast'

export const useLogin = () => {
    return useMutation({
        mutationFn: (body) => login(body),
        onSuccess: () => {
            toast.success('Login Berhasil!')
        },
        onError: (err) => {
            toast.error(err?.message || 'Login gagal')
        },
    })
}

export const useRegister = () => {
    return useMutation({
        mutationFn: (body) => register(body),
        onSuccess: () => {
            toast.success("Registrasi berhasil! Silakan login.")
        },
        onError: (err) => {
            toast.error(err?.message)
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useCallback(() => {
        logoutService()
        queryClient.clear()
        router.push('/Login')
    }, [queryClient, router])
}
