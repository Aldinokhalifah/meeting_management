import { FileText, Crown, User } from 'lucide-react'

export const ROLE_CONFIG = {
    host:        { label: 'Host',        icon: Crown,    className: 'bg-yellow-50 text-yellow-700' },
    secretary:   { label: 'Secretary',   icon: FileText, className: 'bg-purple-50 text-purple-700' },
    participant: { label: 'Participant', icon: User,     className: 'bg-gray-100 text-gray-500' },
}