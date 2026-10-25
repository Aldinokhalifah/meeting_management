const { normalizeIndonesiaWhatsapp } = require('./normalizePhone')

// 628 + 8 sampai 11 digit = nomor seluler Indonesia (11-14 digit total)
const MOBILE_REGEX = /^628\d{8,11}$/

/**
 * Validasi nomor WA wajib diisi + format seluler Indonesia.
 * Mengembalikan nomor ternormalisasi (62xxxx) atau melempar kode error konstan.
 */
const requireWhatsappPhone = (input) => {
    if (input === undefined || input === null || String(input).trim() === '') {
        throw new Error('WHATSAPP_PHONE_REQUIRED')
    }

    const normalized = normalizeIndonesiaWhatsapp(input)
    if (!normalized || !MOBILE_REGEX.test(normalized)) {
        throw new Error('INVALID_WHATSAPP_PHONE')
    }

    return normalized
}

module.exports = { requireWhatsappPhone }