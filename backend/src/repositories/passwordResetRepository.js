const db = require("../config/db");

// Cocok persis diutamakan, tapi beda huruf besar-kecil tetap ketemu
const findUserForReset = async (email) => {
    const result = await db.query(
        `SELECT id, name, whatsapp_phone FROM users
        WHERE LOWER(email) = LOWER($1)
        ORDER BY (email = $1) DESC
        LIMIT 1`,
        [email],
    );
    return result.rows[0] || null;
};

/**
 * Cek cooldown + batas per jam, batalkan token lama, simpan token baru: satu transaksi.
 * Baris user dikunci supaya dua permintaan bersamaan untuk akun yang sama berjalan berurutan.
 * Mengembalikan true jika token dibuat, false jika permintaan dilewati.
 */
const issueResetToken = async ({
    userId,
    tokenHash,
    ttlMinutes,
    cooldownSeconds,
    maxPerHour,
}) => {
    const client = await db.pool.connect();
    try {
            await client.query("BEGIN");
            await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [userId,]);

            const recent = await client.query(
            `SELECT
                COUNT(*) FILTER (WHERE created_at > now() - ($2::int * interval '1 second'))::int AS in_cooldown,
                COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour')::int AS in_hour
            FROM password_reset_tokens
            WHERE user_id = $1`,
            [userId, cooldownSeconds],
            );
            const { in_cooldown, in_hour } = recent.rows[0];
            if (in_cooldown > 0 || in_hour >= maxPerHour) {
            await client.query("ROLLBACK");
            return false;
        }

        // Token lama yang masih aktif dibatalkan (ditandai, tidak dihapus: dipakai untuk hitung batas per jam)
        await client.query(
            `UPDATE password_reset_tokens SET used_at = now()
            WHERE user_id = $1 AND used_at IS NULL`,
            [userId],
            );

        // Housekeeping: buang baris yang sudah lama kedaluwarsa
        await client.query(
            `DELETE FROM password_reset_tokens WHERE expires_at < now() - interval '1 day'`,
        );

        await client.query(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
            VALUES ($1, $2, now() + ($3::int * interval '1 minute'))`,
            [userId, tokenHash, ttlMinutes],
        );

        await client.query("COMMIT");
        return true;
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
    } finally {
        client.release();
    }
};

// Tidak menghabiskan token
const isTokenUsable = async (tokenHash) => {
    const result = await db.query(
        `SELECT 1 FROM password_reset_tokens
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
        [tokenHash],
    );
    return result.rowCount > 0;
};

/**
 * Pemakaian token atomik + ganti password dalam satu transaksi.
 * Dua request bersamaan dengan token yang sama: satu menunggu kunci baris, lalu
 * mengevaluasi ulang used_at IS NULL dan gagal. Mengembalikan data user, atau null jika token tidak berlaku.
 */
const consumeTokenAndSetPassword = async ({ tokenHash, passwordHash }) => {
    const client = await db.pool.connect();
    try {
        await client.query("BEGIN");

        const used = await client.query(
            `UPDATE password_reset_tokens SET used_at = now()
            WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
            RETURNING user_id`,
            [tokenHash],
        );
        if (used.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        const userId = used.rows[0].user_id;
        const updated = await client.query(
            `UPDATE users SET password_hash = $1, password_changed_at = now()
            WHERE id = $2
            RETURNING id, name, whatsapp_phone`,
            [passwordHash, userId],
        );
        if (updated.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        // Batalkan sisa token aktif milik user ini
        await client.query(
            `UPDATE password_reset_tokens SET used_at = now()
            WHERE user_id = $1 AND used_at IS NULL`,[userId],
        );

        await client.query("COMMIT");
        return updated.rows[0];
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
    } finally {
        client.release();
    }
};

const findPasswordChangedAtEpoch = async (userId) => {
    const result = await db.query(
        `SELECT FLOOR(EXTRACT(EPOCH FROM password_changed_at))::bigint AS changed_at
        FROM users WHERE id = $1`,
        [userId]
    )
    if (result.rowCount === 0) return undefined
    const value = result.rows[0].changed_at
    return value === null ? null : Number(value)
}

module.exports = {
    findUserForReset,
    issueResetToken,
    isTokenUsable,
    consumeTokenAndSetPassword,
    findPasswordChangedAtEpoch,
};
