const db = require('../config/db');

const searchUsers = async (keyword) => {
    const result = await db.query(
        `SELECT id, name, email, avatar_url FROM users WHERE 
        name ILIKE  $1 OR email ILIKE $1`, [`%${keyword}%`]
    );
    return result.rows;
}

module.exports = {searchUsers};