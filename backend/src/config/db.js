const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
    console.error('Unexpected DB error', err)
    process.exit(-1)
})

async function testConnection() {
    try {
        const res = await pool.query("SELECT 1 AS ok");
        return res.rows[0]?.ok === 1;
    } catch (err) {
        console.error("PostgreSQL connection test failed:", err.message);
        return false;
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    testConnection
}