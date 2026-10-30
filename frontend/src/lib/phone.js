const MOBILE_REGEX = /^628\d{8,11}$/

// Mengembalikan nomor format 62xxxx, atau null kalau bentuknya tidak dikenali
export const normalizeWhatsappPhone = (input) => {
    if (input === undefined || input === null) return null
    const cleaned = String(input).trim().replace(/[\s\-().]/g, '')
    if (!/^\+?\d+$/.test(cleaned)) return null

    const digits = cleaned.replace(/^\+/, '')
    if (digits.startsWith('62')) return digits
    if (digits.startsWith('0')) return `62${digits.slice(1)}`
    if (digits.startsWith('8')) return `62${digits}`
    return null
}

// Mengembalikan pesan error, atau null kalau valid
export const validateWhatsappPhone = (input) => {
    if (input === undefined || input === null || !String(input).trim()) {
        return 'Nomor WhatsApp wajib diisi'
    }
    const normalized = normalizeWhatsappPhone(input)
    if (!normalized || !MOBILE_REGEX.test(normalized)) {
        return 'Nomor WhatsApp tidak valid. Contoh: 081234567890 atau 6281234567890'
    }
    return null
}