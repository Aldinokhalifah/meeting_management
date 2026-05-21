import { useMutation } from '@tanstack/react-query'
import { login, register } from '@/services/auth'
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
