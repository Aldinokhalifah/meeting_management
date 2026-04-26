const db = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null  // tambahkan .rows
}

const findUserById = async (id) => {
    const result = await db.query(
        'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
        [id]
    )
    return result.rows[0] || null
}

const createUser = async ({ name, email, password_hash }) => {
    const result = await db.query(
        `INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at`,
        [name, email, password_hash]
    )
    return result.rows[0]
}

module.exports = { findUserByEmail, findUserById, createUser }