const passwordResetService = require('../services/passwordResetService')
const { fireAndForget } = require('../utils/fireAndForget')

const GENERIC_MESSAGE =
    'Jika email terdaftar dan memiliki nomor WhatsApp, link reset password akan dikirim.'

const forgotPassword = (req, res) => {
    const email = req.body?.email
    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Email wajib diisi' })
    }

    // Tanpa await: waktu respons tidak boleh membocorkan apakah email terdaftar
    fireAndForget('Proses lupa password', () => passwordResetService.requestPasswordReset(email))

    res.status(200).json({ message: GENERIC_MESSAGE })
}

const validateResetToken = async (req, res, next) => {
    try {
        await passwordResetService.validateResetToken(req.body?.token)
        res.status(200).json({ message: 'Link reset password valid' })
    } catch (err) {
        next(err)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { token, new_password } = req.body || {}
        await passwordResetService.resetPassword({ token, new_password })
        res.status(200).json({ message: 'Password berhasil diubah. Silakan login dengan password baru.' })
    } catch (err) {
        next(err)
    }
}

module.exports = { forgotPassword, validateResetToken, resetPassword }