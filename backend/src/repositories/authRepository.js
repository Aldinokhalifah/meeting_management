const db = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null  // tambahkan .rows
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

module.exports = { findUserByEmail, findUserById, createUser }