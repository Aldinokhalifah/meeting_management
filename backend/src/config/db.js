const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,        // tutup koneksi idle setelah 30s
    connectionTimeoutMillis: 5000,   // jangan nunggu koneksi kosong tanpa batas
    keepAlive: true,                 // kirim TCP keepalive, cegah network drop koneksi idle
})

pool.on('error', (err) => {
    console.error('Unexpected DB error', err)
    // process.exit(-1)
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