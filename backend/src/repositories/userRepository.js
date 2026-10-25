const db = require('../config/db');

// whatsapp_phone sengaja TIDAK ikut di hasil pencarian (data pribadi)
const searchUsers = async (keyword) => {
    const result = await db.query(
        `SELECT id, name, email, avatar_url FROM users WHERE
        name ILIKE $1 OR email ILIKE $1`, [`%${keyword}%`]
    );
    return result.rows;
}

const ALLOWED_USER_PATCH = new Set(['name', 'email', 'avatar_url', 'whatsapp_phone'])

/**
 * Hanya kolom yang nilainya !== undefined yang di-update.
 */
const updateUser = async (id, patch) => {
    const entries = Object.entries(patch).filter(
        ([k, v]) => ALLOWED_USER_PATCH.has(k) && v !== undefined
    )

    if (entries.length === 0) {
        return findUserById(id)
    }

    const setClause = entries.map(([col], i) => `${col} = $${i + 1}`).join(', ')
    const values = entries.map(([, val]) => val)
    values.push(id)

    const result = await db.query(
        `UPDATE users SET ${setClause} WHERE id = $${values.length}
        RETURNING id, name, email, avatar_url, whatsapp_phone, created_at`,
        values
    )
    return result.rows[0] || null
}

const updatePassword = async (id, password_hash) => {
    await db.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [password_hash, id]
    )
}

const findPasswordHashById = async (id) => {
    const result = await db.query(
        `SELECT password_hash FROM users WHERE id = $1`,
        [id]
    )
    return result.rows[0]?.password_hash || null
}

const findUserById = async (id) => {
    const result = await db.query(
        `SELECT id, name, email, avatar_url, whatsapp_phone, created_at FROM users WHERE id = $1`,
        [id]
    )
    return result.rows[0] || null
}

module.exports = {
    searchUsers,
    updateUser,
    updatePassword,
    findPasswordHashById,
    findUserById,
};