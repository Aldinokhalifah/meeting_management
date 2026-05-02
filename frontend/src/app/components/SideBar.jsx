'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { logout } from '@/services/auth'

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Meeting', href: '/meeting', icon: CalendarDays },
    { label: 'Profil', href: '/profile', icon: User },
]   

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, [])

    const handleLogout = () => {
        logout();
        router.push('/Login');
    }

    const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

    return (
        <>
        {/* ── Mobile top bar ── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 h-14 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2">
                    <img
                        src="/probesco.webp"
                        alt="Probesco logo"
                        className="rounded-md shadow-md w-10 h-10"
                    />
                    <span className="font-bold text-sm lg:text-lg text-gray-900">
                        Meeting Management
                    </span>
                    </Link>
            </div>
            <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
            <Menu size={20} className="text-gray-600" />
            </button>
        </div>

        {/* ── Mobile overlay ── */}
        {mobileOpen && (
            <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
            />
        )}

        {/* ── Mobile drawer ── */}
        <aside
            className={`
            lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
            flex flex-col transition-transform duration-300
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* Header drawer */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <img
                        src="/probesco.webp"
                        alt="Probesco logo"
                        className="rounded-md shadow-md w-10 h-10"
                    />
                    <span className="font-bold text-sm lg:text-lg text-gray-900">
                        Meeting Management
                    </span>
                </Link>
            </div>
            <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
                <X size={18} className="text-gray-500" />
            </button>
            </div>

            {/* Nav mobile */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                    ${isActive(href)
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                <Icon size={18} />
                {label}
                </Link>
            ))}
            </nav>

            {/* User + logout mobile */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-1">
            {user && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                </div>
            )}
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
                <LogOut size={18} />
                Keluar
            </button>
            </div>
        </aside>

        {/* ── Desktop sidebar ── */}
        <aside
            className={`
            hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-200
            transition-all duration-300 z-30
            ${collapsed ? 'w-16' : 'w-56'}
            `}
        >
            {/* Logo */}
            <div className={`flex items-center h-14 border-b border-gray-100 px-3 ${collapsed ? 'justify-center' : 'gap-2'}`}>
                <Link href="/dashboard" className="flex items-center gap-2">
                    <img
                        src="/probesco.webp"
                        alt="Probesco logo"
                        className="rounded-md shadow-md w-10 h-10"
                    />
                </Link>
            {!collapsed && (
                <span className="font-semibold text-sm text-gray-800 truncate">Meeting Management</span>
            )}
            </div>

            {/* Nav desktop */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive(href)
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                <Icon size={18} className="shrink-0" />
                {!collapsed && label}
                </Link>
            ))}
            </nav>

            {/* User + logout desktop */}
            <div className="px-2 py-4 border-t border-gray-100 space-y-1">
            {user && !collapsed && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 mb-1">
                <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                </div>
            )}

            <button
                onClick={handleLogout}
                title={collapsed ? 'Keluar' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition cursor-pointer
                ${collapsed ? 'justify-center' : ''}`}
            >
                <LogOut size={18} className="shrink-0" />
                {!collapsed && 'Keluar'}
            </button>

            {/* Toggle collapse */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 transition
                ${collapsed ? 'justify-center' : ''}`}
            >
                <ChevronRight
                size={18}
                className={`shrink-0 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
                />
                {!collapsed && <span className="text-xs">Sembunyikan</span>}
            </button>
            </div>
        </aside>

        {/* ── Spacer agar konten tidak tertutup sidebar ── */}
        <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`} />
        </>
    )
}