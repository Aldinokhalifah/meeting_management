/**
 * Normalisasi nomor WhatsApp Indonesia ke format 62xxxx
 * Hanya menerima input numerik valid.
 */
const normalizeIndonesiaWhatsapp = (input) => {
    if (input == null) return null

    const raw = String(input).trim()

    if (raw === '') return null

    // Tolak jika ada karakter selain angka, spasi, +, -, (, )
    if (!/^[\d+\-\s()]+$/.test(raw)) {
        return null
    }

    // Ambil digit saja
    const d = raw.replace(/\D/g, '')

    if (d.length < 9 || d.length > 15) {
        return null
    }

    if (d.startsWith('62')) return d
    if (d.startsWith('0')) return `62${d.slice(1)}`
    if (d.startsWith('8')) return `62${d}`

    return null
}

module.exports = { normalizeIndonesiaWhatsapp }