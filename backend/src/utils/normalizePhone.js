/**
 * Normalisasi ke digit numerik untuk API WhatsApp (Indonesia: 62…).
 */
const normalizeIndonesiaWhatsapp = (input) => {
    if (input == null || String(input).trim() === '') return null
    let d = String(input).replace(/\D/g, '')
    if (d.length === 0) return null
    if (d.startsWith('62')) return d
    if (d.startsWith('0')) return `62${d.slice(1)}`
    if (d.startsWith('8')) return `62${d}`
    return d
}

module.exports = { normalizeIndonesiaWhatsapp }
