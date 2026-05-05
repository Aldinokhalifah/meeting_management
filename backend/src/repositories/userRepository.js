const db = require('../config/db');

const searchUsers = async (keyword) => {
    const result = await db.query(
        `SELECT id, name, email, avatar_url FROM users WHERE 
        name ILIKE  $1 OR email ILIKE $1`, [`%${keyword}%`]
    );
    return result.rows;
}

const updateUser = async (id, { name, email, avatar_url }) => {
    const result = await db.query(
        `UPDATE users
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            avatar_url = COALESCE($3, avatar_url)
        WHERE id = $4
        RETURNING id, name, email, avatar_url, created_at`,
        [name, email, avatar_url, id]
    )
    return result.rows[0] || null
}

const updatePassword = async (id, password_hash) => {
    await db.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [password_hash, id]
    )
}

const findUserById = async (id) => {
    const result = await db.query(
        `SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1`,
        [id]
    )
    return result.rows[0] || null
}

module.exports = {searchUsers, updateUser, updatePassword, findUserById};