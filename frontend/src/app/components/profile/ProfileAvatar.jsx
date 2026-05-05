'use client'

export default function ProfileAvatar({ name }) {
    const initials = name
        ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                <span className="text-3xl font-semibold text-white">{initials}</span>
            </div>
            <p className="text-xs text-gray-400">Foto profil dari inisial nama</p>
        </div>
    )
}