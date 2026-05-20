const userRepo = require('../repositories/userRepository');
const authRepo = require('../repositories/authRepository');
const bcrypt = require('bcryptjs');
const { normalizeIndonesiaWhatsapp } = require('../utils/normalizePhone');

const searchUsers = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) throw new Error('KEYWORD_TOO_SHORT');
    return await userRepo.searchUsers(keyword.trim());
}

const parseWhatsappPhone = (whatsapp_phone) => {
    if (whatsapp_phone === null || String(whatsapp_phone).trim() === '') {
        return null
    }
    const normalizedWa = normalizeIndonesiaWhatsapp(whatsapp_phone)
    if (!normalizedWa) {
        const e = new Error('Nomor WhatsApp tidak valid')
        e.status = 400
        throw e
    }
    return normalizedWa
}

const setWhatsappPhone = async (id, whatsapp_phone) => {
    const user = await userRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')
    if (user.whatsapp_phone) throw new Error('WHATSAPP_PHONE_ALREADY_EXISTS')

    const normalized = parseWhatsappPhone(whatsapp_phone)
    const updated = await userRepo.updateUser(id, { whatsapp_phone: normalized })
    if (!updated) throw new Error('USER_NOT_FOUND')
    return updated
}

const updateWhatsappPhone = async (id, whatsapp_phone) => {
    const user = await userRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')
    if (!user.whatsapp_phone) throw new Error('WHATSAPP_PHONE_NOT_SET')

    const normalized = parseWhatsappPhone(whatsapp_phone)
    const updated = await userRepo.updateUser(id, { whatsapp_phone: normalized })
    if (!updated) throw new Error('USER_NOT_FOUND')
    return updated
}

const deleteWhatsappPhone = async (id) => {
    const user = await userRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')
    if (!user.whatsapp_phone) throw new Error('WHATSAPP_PHONE_NOT_SET')

    const updated = await userRepo.clearWhatsappPhone(id)
    if (!updated) throw new Error('USER_NOT_FOUND')
    return updated
}

const updateProfile = async (id, { name, email, avatar_url, whatsapp_phone }) => {
    if (!name || !name.trim()) throw new Error('INVALID_NAME')

    // Kalau email diubah, cek apakah sudah dipakai user lain
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) throw new Error('INVALID_EMAIL_FORMAT')

        const existing = await authRepo.findUserByEmail(email)
        if (existing && existing.id !== id) throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const patch = { name: name.trim() }
    if (email !== undefined) patch.email = email
    if (avatar_url !== undefined) patch.avatar_url = avatar_url

    if (whatsapp_phone !== undefined) {
        patch.whatsapp_phone = parseWhatsappPhone(whatsapp_phone)
    }

    const updated = await userRepo.updateUser(id, patch)
    if (!updated) throw new Error('USER_NOT_FOUND')
    return updated
}

const updatePassword = async (id, { current_password, new_password }) => {
    if (!new_password || new_password.length < 6) throw new Error('PASSWORD_TOO_SHORT')

    // Ambil user dengan password_hash
    const user = await authRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')

    // Verifikasi password lama
    const userWithHash = await authRepo.findUserByEmail(user.email)
    const valid = await bcrypt.compare(current_password, userWithHash.password_hash)
    if (!valid) throw new Error('WRONG_CURRENT_PASSWORD')

    const password_hash = await bcrypt.hash(new_password, 10)
    await userRepo.updatePassword(id, password_hash)
}

module.exports = {
    searchUsers,
    updateProfile,
    updatePassword,
    setWhatsappPhone,
    updateWhatsappPhone,
    deleteWhatsappPhone,
}