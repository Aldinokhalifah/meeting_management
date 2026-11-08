const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const repo = require('../repositories/passwordResetRepository')
const waService = require('./waService')
const { fireAndForget } = require('../utils/fireAndForget')

const TOKEN_TTL_MINUTES = 30
const COOLDOWN_SECONDS = 60
const MAX_REQUESTS_PER_HOUR = 3
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/ // 32 byte dalam base64url

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const sendResetLink = async ({ phone, name, link }) => {
    try {
        await waService.sendPasswordResetLinkWhatsApp({
        phone,
        name,
        link,
        ttlMinutes: TOKEN_TTL_MINUTES,
        })
    } catch {
        // Error asli tidak diteruskan: pesan error provider bisa memuat isi pesan (link)
        throw new Error('WA_SEND_FAILED')
    }
}

/**
 * Dipanggil tanpa await dari controller. Semua jalur "tidak ada yang dikirim"
 * (email tidak ada, tidak punya nomor, kena cooldown) selesai diam-diam.
 */
const requestPasswordReset = async (email) => {
    if (typeof email !== 'string' || !email.trim()) return

    const baseUrl = (process.env.APP_URL || '').replace(/\/+$/, '')
    if (!baseUrl) throw new Error('APP_URL belum dikonfigurasi')

    const user = await repo.findUserForReset(email.trim())
    if (!user || !user.whatsapp_phone) return

    const token = crypto.randomBytes(32).toString('base64url')
    const issued = await repo.issueResetToken({
        userId: user.id,
        tokenHash: hashToken(token),
        ttlMinutes: TOKEN_TTL_MINUTES,
        cooldownSeconds: COOLDOWN_SECONDS,
        maxPerHour: MAX_REQUESTS_PER_HOUR,
    })
    if (!issued) return

    // Fragment (#), bukan query string, supaya token tidak masuk log IIS
    await sendResetLink({
        phone: user.whatsapp_phone,
        name: user.name,
        link: `${baseUrl}/ResetPassword#token=${token}`,
    })
}

const validateResetToken = async (token) => {
    if (typeof token !== 'string' || !TOKEN_FORMAT.test(token)) {
        throw new Error('TOKEN_INVALID_OR_EXPIRED')
    }
    const usable = await repo.isTokenUsable(hashToken(token))
    if (!usable) throw new Error('TOKEN_INVALID_OR_EXPIRED')
}

const resetPassword = async ({ token, new_password }) => {
    if (typeof new_password !== 'string' || new_password.length < 6) {
        throw new Error('PASSWORD_TOO_SHORT')
    }

    // Pengecekan murah dulu, supaya token sampah tidak memicu bcrypt
    await validateResetToken(token)

    const passwordHash = await bcrypt.hash(new_password, 10)
    const user = await repo.consumeTokenAndSetPassword({
        tokenHash: hashToken(token),
        passwordHash,
    })
    if (!user) throw new Error('TOKEN_INVALID_OR_EXPIRED')

    if (user.whatsapp_phone) {
        fireAndForget('WA konfirmasi password diubah', () =>
        waService.sendPasswordChangedWhatsApp({ phone: user.whatsapp_phone, name: user.name })
        )
    }
}

module.exports = { requestPasswordReset, validateResetToken, resetPassword }