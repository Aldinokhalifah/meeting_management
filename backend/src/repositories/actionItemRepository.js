const db = require('../config/db');

const createActionItem = async ({ meeting_id, description, assigned_to, due_date, carried_from_id = null}) => {
    const result = await db.query(
        `INSERT INTO action_items (meeting_id, description, assigned_to, due_date, carried_from_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [meeting_id, description, assigned_to, due_date || null, carried_from_id]
    )
    return result.rows[0];
}

const getActionItemById = async (id) => {
    const result = await db.query(
        `SELECT id, meeting_id, carried_from_id, description, assigned_to, due_date, status, created_at FROM action_items WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
}

const ALLOWED_ACTION_ITEM_PATCH = new Set(['description', 'assigned_to', 'due_date', 'status'])

const updateActionItem = async (id, patch) => {
    const entries = Object.entries(patch).filter(
        ([k, v]) => ALLOWED_ACTION_ITEM_PATCH.has(k) && v !== undefined
    )
    if (entries.length === 0) {
        return getActionItemById(id)
    }
    const setClause = entries.map(([col], i) => `${col} = $${i + 1}`).join(', ')
    const values = entries.map(([, val]) => val)
    values.push(id)
    const result = await db.query(
        `UPDATE action_items SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
    )
    return result.rows[0] || null
}

const deleteActionItem = async (id) => {
    await db.query(`DELETE FROM action_items WHERE id = $1`, [id]);
}

const getOpenActionItemsByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT id, meeting_id, carried_from_id, description, assigned_to, due_date, status, created_at FROM action_items
        WHERE meeting_id = $1 AND status = 'open'`,
        [meeting_id]
    );
    return result.rows;
}

const getActionItemsByMeetingId = async (meeting_id, status = null) => {
    const values = [meeting_id]
    let query = `
        SELECT ai.*, 
            u.name as assigned_to_name,
            u.email as assigned_to_email
        FROM action_items ai
        LEFT JOIN users u ON ai.assigned_to = u.id
        WHERE ai.meeting_id = $1`;

    // Tambah filter status kalau ada
    if (status) {
        values.push(status);
        query += ` AND ai.status = $2`;
    }

    query += ` ORDER BY ai.created_at ASC`;

    const result = await db.query(query, values);
    return result.rows;
}

module.exports = {createActionItem, getActionItemsByMeetingId, getActionItemById, updateActionItem, deleteActionItem, getOpenActionItemsByMeetingId};