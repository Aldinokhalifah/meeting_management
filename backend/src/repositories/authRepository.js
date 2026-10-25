const db = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null  // tambahkan .rows
}

const findUserByWhatsappPhone = async (whatsapp_phone) => {
    const result = await db.query('SELECT id, whatsapp_phone FROM users WHERE whatsapp_phone = $1', [whatsapp_phone]);
    return result.rows[0]
}

const findOtherUserByWhatsappPhone = async (whatsapp_phone, userId) => {
    const result = await db.query(
        'SELECT id, whatsapp_phone FROM users WHERE whatsapp_phone = $1 AND id <> $2 LIMIT 1',
        [whatsapp_phone, userId]
    )
    return result.rows[0] || null
}

const findUserById = async (id) => {
    const result = await db.query(
        'SELECT id, name, email, avatar_url, whatsapp_phone, created_at FROM users WHERE id = $1',
        [id]
    )
    return result.rows[0] || null
}

const createUser = async ({ name, email, password_hash, whatsapp_phone = null }) => {
    const result = await db.query(
        `INSERT INTO users (name, email, password_hash, whatsapp_phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, avatar_url, whatsapp_phone, created_at`,
        [name, email, password_hash, whatsapp_phone]
    )
    return result.rows[0]
}

module.exports = {
    findUserByEmail,
    findUserByWhatsappPhone,
    findOtherUserByWhatsappPhone,
    findUserById,
    createUser,
}