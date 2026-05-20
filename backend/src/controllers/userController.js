const userService = require('../services/userService');

const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter q wajib diisi' });

        const users = await userService.searchUsers(q);
        res.json({ message: 'Berhasil mencari user', data: users });
    } catch (err) {
        next(err);
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const { name, email, avatar_url, whatsapp_phone } = req.body
        if (!name) return res.status(400).json({ message: 'Nama wajib diisi' })

        const updated = await userService.updateProfile(req.user.id, {
            name,
            email,
            avatar_url,
            whatsapp_phone,
        })
        res.status(200).json({ message: 'Profil berhasil diupdate', data: updated })
    } catch (err) {
        next(err)
    }
}

const setWhatsappPhone = async (req, res, next) => {
    try {
        const { whatsapp_phone } = req.body
        if (!whatsapp_phone) {
            return res.status(400).json({ message: 'Nomor WhatsApp wajib diisi' })
        }

        const updated = await userService.setWhatsappPhone(req.user.id, whatsapp_phone)
        res.status(201).json({ message: 'Nomor WhatsApp berhasil ditambahkan', data: updated })
    } catch (err) {
        next(err)
    }
}

const updateWhatsappPhone = async (req, res, next) => {
    try {
        const { whatsapp_phone } = req.body
        if (!whatsapp_phone) {
            return res.status(400).json({ message: 'Nomor WhatsApp wajib diisi' })
        }

        const updated = await userService.updateWhatsappPhone(req.user.id, whatsapp_phone)
        res.status(200).json({ message: 'Nomor WhatsApp berhasil diubah', data: updated })
    } catch (err) {
        next(err)
    }
}

const deleteWhatsappPhone = async (req, res, next) => {
    try {
        const updated = await userService.deleteWhatsappPhone(req.user.id)
        res.status(200).json({ message: 'Nomor WhatsApp berhasil dihapus', data: updated })
    } catch (err) {
        next(err)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body
        if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' })
        }
        await userService.updatePassword(req.user.id, { current_password, new_password })
        res.json({ message: 'Password berhasil diubah' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    searchUsers,
    updateProfile,
    updatePassword,
    setWhatsappPhone,
    updateWhatsappPhone,
    deleteWhatsappPhone,
}