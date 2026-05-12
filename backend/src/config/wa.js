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

    if (!res.ok) {
        const detail = typeof parsed === 'object' ? JSON.stringify(parsed) : text
        throw new Error(`WhatsApp API gagal (${res.status}): ${detail}`)
    }

    return parsed
}

module.exports = { sendWhatsAppText }
