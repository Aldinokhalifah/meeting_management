/**
 * Kirim pesan teks WhatsApp lewat HTTP (default: Fonnte).
 * Override dengan WHATSAPP_API_URL jika memakai provider lain yang kompatibel (POST form-urlencoded: target, message).
 */
const sendWhatsAppText = async ({ to, message }) => {
    const token = process.env.WHATSAPP_API_TOKEN
    if (!token) {
        throw new Error('WHATSAPP_API_TOKEN tidak dikonfigurasi di .env')
    }
    const url = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send'

    const body = new URLSearchParams()
    body.set('target', to)
    body.set('message', message)

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: token,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })

    const text = await res.text()
    let parsed = null
    try {
        parsed = JSON.parse(text)
    } catch {
        parsed = { raw: text }
    }

    // 1. Cek HTTP status code (4xx / 5xx)
    if (!res.ok) {
        const detail = typeof parsed === 'object' ? JSON.stringify(parsed) : text
        throw new Error(`WhatsApp API HTTP Error (${res.status}): ${detail}`)
    }

    // 2. Cek response logic dari Fonnte (status: false)
    if (parsed && parsed.status === false) {
        throw new Error(`Fonnte Rejected: ${parsed.reason || parsed.message || JSON.stringify(parsed)}`)
    }

    return parsed
}

module.exports = { sendWhatsAppText }