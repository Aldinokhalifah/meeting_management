'use client'

import { useState } from 'react'
import { useUpdatePassword } from '@/hooks/useUsers'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import PasswordInput from './PasswordInput'

const INITIAL_FORM = {
    current_password: '',
    new_password: '',
    confirm_password: '',
}

export default function PasswordForm() {
    const { mutate: updatePassword, isPending } = useUpdatePassword()
    const [form, setForm] = useState(INITIAL_FORM)
    const [show, setShow] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const toggleShow = (field) => {
        setShow((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (form.new_password.length < 6) {
            toast.error('Password baru minimal 6 karakter')
            return
        }
        if (form.new_password !== form.confirm_password) {
            toast.error('Konfirmasi password tidak cocok')
            return
        }
        if (form.current_password === form.new_password) {
            toast.error('Password baru tidak boleh sama dengan password lama')
            return
        }

        updatePassword(
        {
            current_password: form.current_password,
            new_password: form.new_password,
        },
        {
            onSuccess: () => {
                setForm(INITIAL_FORM)
            },
            onError: (err) => {
            },
        }
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
            Password Saat Ini <span className="text-red-400">*</span>
            </label>
            <PasswordInput
            name="current_password"
            placeholder="••••••••"
            showKey="current"
            show={show}
            form={form}
            onChangeForm={setForm}
            onToggleShow={setShow}
            />
        </div>

        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
            Password Baru <span className="text-sm font-normal text-gray-400">*</span>
            </label>
            <PasswordInput
            name="new_password"
            placeholder="••••••••"
            showKey="new"
            show={show}
            form={form}
            onChangeForm={setForm}
            onToggleShow={setShow}
            />
            <p className="text-xs text-gray-400">Minimal 6 karakter</p>
        </div>

        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
            Konfirmasi Password Baru <span className="text-red-400">*</span>
            </label>
            <PasswordInput
            name="confirm_password"
            placeholder="••••••••"
            showKey="confirm"
            show={show}
            form={form}
            onChangeForm={setForm}
            onToggleShow={setShow}
            />
        </div>

        {/* Password match indicator */}
        {form.new_password && form.confirm_password && (
            <p className={`text-xs ${
            form.new_password === form.confirm_password
                ? 'text-green-500'
                : 'text-red-400'
            }`}>
            {form.new_password === form.confirm_password
                ? '✓ Password cocok'
                : '✗ Password tidak cocok'
            }
            </p>
        )}

        <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition"
        >
            {isPending ? 'Memperbarui...' : 'Update Password'}
        </button>
        </form>
    )
}