const db = require('../config/db');

// Buat record 'pending' dengan batas jumlah file per meeting.
// Semuanya dalam satu transaksi + advisory lock per meeting, supaya dua request
// presign paralel tidak bisa sama-sama lolos dari batas.
// Record 'pending' yang sudah basi dibersihkan di sini; key-nya dikembalikan
// agar objek (jika sempat terunggah) bisa dihapus dari MinIO oleh service.
const createPendingAttachment = async ({
    id, meeting_id, file_name, object_key, file_size, file_type, uploaded_by,
    max_files, pending_ttl_minutes,
}) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [meeting_id]);

        const stale = await client.query(
            `DELETE FROM meeting_attachments
            WHERE meeting_id = $1 AND status = 'pending'
            AND created_at < NOW() - make_interval(mins => $2)
            RETURNING object_key`,
            [meeting_id, pending_ttl_minutes]
        );

        const count = await client.query(
            `SELECT COUNT(*)::int AS total FROM meeting_attachments WHERE meeting_id = $1`,
            [meeting_id]
        );

        let attachment = null;
        if (count.rows[0].total < max_files) {
            const inserted = await client.query(
                `INSERT INTO meeting_attachments (id, meeting_id, file_name, object_key, file_size, file_type, uploaded_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [id, meeting_id, file_name, object_key, file_size, file_type, uploaded_by]
            );
            attachment = inserted.rows[0];
        }

        await client.query('COMMIT');
        return { attachment, stale_keys: stale.rows.map((row) => row.object_key) };
    } catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        throw err;
    } finally {
        client.release();
    }
};

const getAttachmentById = async (id) => {
    const result = await db.query(`SELECT * FROM meeting_attachments WHERE id = $1`, [id]);
    return result.rows[0] || null;
};

const getUploadedByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT a.id, a.meeting_id, a.file_name, a.file_size, a.file_type,
                a.uploaded_by, u.name AS uploaded_by_name, a.created_at
        FROM meeting_attachments a
        LEFT JOIN users u ON a.uploaded_by = u.id
        WHERE a.meeting_id = $1 AND a.status = 'uploaded'
        ORDER BY a.created_at ASC`,
        [meeting_id]
    );
    return result.rows;
};

const markUploaded = async (id, meeting_id, file_size) => {
    const result = await db.query(
        `UPDATE meeting_attachments
        SET status = 'uploaded', file_size = $3
        WHERE id = $1 AND meeting_id = $2 AND status = 'pending'
        RETURNING id, meeting_id, file_name, file_size, file_type, status, uploaded_by, created_at`,
        [id, meeting_id, file_size]
    );
    return result.rows[0] || null;
};

const deleteAttachment = async (id) => {
    await db.query(`DELETE FROM meeting_attachments WHERE id = $1`, [id]);
};

// Semua key milik meeting (termasuk 'pending'), dipakai sebelum meeting dihapus
const getObjectKeysByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT object_key FROM meeting_attachments WHERE meeting_id = $1`,
        [meeting_id]
    );
    return result.rows.map((row) => row.object_key);
};

module.exports = {
    createPendingAttachment, getAttachmentById, getUploadedByMeetingId,
    markUploaded, deleteAttachment, getObjectKeysByMeetingId,
};