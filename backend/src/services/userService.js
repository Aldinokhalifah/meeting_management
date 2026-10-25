const userRepo = require('../repositories/userRepository');
const authRepo = require('../repositories/authRepository');
const bcrypt = require('bcryptjs');
const waService = require('./waService');
const { requireWhatsappPhone } = require('../utils/whatsappPhone');
const { fireAndForget } = require('../utils/fireAndForget');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const searchUsers = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) throw new Error('KEYWORD_TOO_SHORT');
    return await userRepo.searchUsers(keyword.trim());
}

// Dipakai saat email / nomor WA berubah
const assertCurrentPassword = async (userId, current_password) => {
    if (typeof current_password !== 'string' || current_password === '') {
        throw new Error('CURRENT_PASSWORD_REQUIRED')
    }

    const password_hash = await userRepo.findPasswordHashById(userId)
    if (!password_hash) throw new Error('USER_NOT_FOUND')

    const valid = await bcrypt.compare(current_password, password_hash)
    if (!valid) throw new Error('WRONG_CURRENT_PASSWORD')
}

const assertWhatsappPhoneAvailable = async (userId, whatsapp_phone) => {
    const existing = await authRepo.findOtherUserByWhatsappPhone(whatsapp_phone, userId)
    if (existing) throw new Error('WHATSAPP_PHONE_ALREADY_EXISTS')
}

// Tanpa await: kegagalan WA tidak boleh menggagalkan perubahan yang sudah tersimpan
    const notifyWhatsappChanged = ({ name, oldPhone, newPhone }) => {
    fireAndForget('WA nomor diperbarui (nomor baru)', () =>
        waService.sendPhoneUpdatedWhatsApp({ phone: newPhone, name })
    )
    if (oldPhone) {
        fireAndForget('WA nomor diubah (nomor lama)', () =>
        waService.sendPhoneChangedOldWhatsApp({ phone: oldPhone, name })
        )
    }
}

const updateProfile = async (id, { name, email, avatar_url, whatsapp_phone, current_password }) => {
    if (!name || !name.trim()) throw new Error('INVALID_NAME')

    const user = await userRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')

    const patch = { name: name.trim() }

    // Deteksi perubahan dilakukan di backend: bandingkan dengan data tersimpan
    let emailChanged = false
    if (email !== undefined) {
        if (!EMAIL_REGEX.test(email)) throw new Error('INVALID_EMAIL_FORMAT')
        emailChanged = email !== user.email
    }

    let newPhone = null
    if (whatsapp_phone !== undefined) {
        const normalized = requireWhatsappPhone(whatsapp_phone)
        if (normalized !== user.whatsapp_phone) newPhone = normalized
    }

    if (newPhone) await assertWhatsappPhoneAvailable(id, newPhone)

    if (emailChanged || newPhone) {
        await assertCurrentPassword(id, current_password)
    }

    if (emailChanged) {
        const existing = await authRepo.findUserByEmail(email)
        if (existing && existing.id !== id) throw new Error('EMAIL_ALREADY_EXISTS')
        patch.email = email
    }
    if (newPhone) patch.whatsapp_phone = newPhone
    if (avatar_url !== undefined) patch.avatar_url = avatar_url

    const updated = await userRepo.updateUser(id, patch)
    if (!updated) throw new Error('USER_NOT_FOUND')

    if (newPhone) {
        notifyWhatsappChanged({ name: updated.name, oldPhone: user.whatsapp_phone, newPhone })
    }

    return updated
}

const updateWhatsappPhone = async (id, { whatsapp_phone, current_password }) => {
    const user = await userRepo.findUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')

    const normalized = requireWhatsappPhone(whatsapp_phone)
    if (normalized === user.whatsapp_phone) return user

    await assertWhatsappPhoneAvailable(id, normalized)
    await assertCurrentPassword(id, current_password)

    const updated = await userRepo.updateUser(id, { whatsapp_phone: normalized })
    if (!updated) throw new Error('USER_NOT_FOUND')

    notifyWhatsappChanged({ name: updated.name, oldPhone: user.whatsapp_phone, newPhone: normalized })

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
    updateWhatsappPhone,
}