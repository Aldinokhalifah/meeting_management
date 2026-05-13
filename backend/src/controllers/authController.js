const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
        return res.status(400).json({ message: 'Semua field wajib diisi' });

        const user = await authService.register({ name, email, password });
        res.status(201).json({ message: 'Registrasi berhasil', data: user });
    } catch (err) {
        next(err);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
        return res.status(400).json({ message: 'Email dan password wajib diisi' });

        const result = await authService.login({ email, password });
        res.status(200).json({ message: 'Login berhasil', data: result });
    } catch (err) {
        next(err);
    }
}

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user.id);
        res.status(200).json({
            message: 'Berhasil mendapatkan data',
            data: user
        });
    } catch (err) {
        res.status(404).json({
            message: 'Data tidak ditemukan',
            data: []
        });
    }
}

const logout = async (req, res, next) => {
    try {
        const result = await authService.logout(req.user.id);
        res.status(200).json({ message: result.message });
    } catch (err) {
        res.status(500).json({ message: 'Gagal logout', error: err.message });
    }
}

module.exports = { register, login, getMe, logout };