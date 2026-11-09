import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
    login,
    register,
    logout as logoutService,
    forgotPassword,
    validateResetToken,
    resetPassword,
} from '@/services/auth'
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

// --- Lupa password via WhatsApp ---
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (body) => forgotPassword(body),
        onError: (err) => {
            toast.error(err?.message || 'Gagal memproses permintaan')
        },
    })
}

export const useValidateResetToken = () => {
    return useMutation({
        mutationFn: (body) => validateResetToken(body),
        onError: (err) => {
            toast.error(err?.message || 'Link reset password tidak valid')
        },
    })
}

export const useResetPassword = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body) => resetPassword(body),
        onSuccess: (res) => {
            // Sesi lama (kalau ada) tidak berlaku lagi: bersihkan localStorage + cookie + cache
            logoutService()
            queryClient.clear()
            toast.success(res?.message || 'Password berhasil diubah')
        },
        onError: (err) => {
            toast.error(err?.message || 'Gagal mengubah password')
        },
    })
}