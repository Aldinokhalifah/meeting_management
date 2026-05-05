const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authRepo = require('../repositories/authRepository')

const register = async ({name, email, password}) => {
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) throw new Error('INVALID_EMAIL_FORMAT');

    const existingEmail = await authRepo.findUserByEmail(email);
    if(existingEmail) {
        throw {
            status: 409,
            message: 'Email sudah terdaftar'
        };
    }

    // Validasi panjang password
    if (password.length < 6) throw new Error('PASSWORD_TOO_SHORT');

    // Validasi name tidak boleh hanya spasi
    if (!name.trim()) throw new Error('INVALID_NAME');

    const existing = await authRepo.findUserByEmail(email);
    if (existing) throw new Error('EMAIL_ALREADY_EXISTS');

    const password_hash = await bcrypt.hash(password, 10);
    const user = await authRepo.createUser({ name, email, password_hash });  // jadikan object

    return user;
}

const login = async ({ email, password }) => {
    const user = await authRepo.findUserByEmail(email);
    if (!user) throw { status: 401, message: 'Email atau password salah' };

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw { status: 401, message: 'Email atau password salah' };

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at } };
}

const getMe = async (userId) => {
    const user = await authRepo.findUserById(userId);
    if (!user) throw { status: 404, message: 'User tidak ditemukan' };
    return user;
}

const logout = async (userId) => {
    // Untuk JWT stateless, logout dilakukan di client-side dengan menghapus token
    // Server hanya return success message
    return { message: 'Logout berhasil' };
}

module.exports = { register, login, getMe, logout };