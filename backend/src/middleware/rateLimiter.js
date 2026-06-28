const rateLimit = require('express-rate-limit')

// Limiter umum untuk semua request — proteksi dasar
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 300,
    message: { message: 'Terlalu banyak request, coba lagi nanti' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Limiter khusus login — cegah brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5,
    message: { message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // ← hanya hitung yang gagal
})

// Limiter khusus register — cegah spam akun
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: 3,
    message: { message: 'Terlalu banyak percobaan registrasi, coba lagi dalam 1 jam' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Limiter khusus AI agent — cegah spam & kontrol biaya API
const agentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 15,
    message: { message: 'Terlalu banyak permintaan ke AI Agent, mohon tunggu sebentar' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip), // ← limit per user, bukan per IP
})

module.exports = { globalLimiter, loginLimiter, registerLimiter, agentLimiter }