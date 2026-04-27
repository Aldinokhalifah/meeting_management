const db = require('../config/db');

const createNote = async ({meeting_id, content, created_by}) => {
    const result = await db.query(
        `INSERT INTO notes (meeting_id, content, created_by) VALUES ($1, $2, $3) 
        RETURNING *`, [meeting_id, JSON.stringify(content), created_by]
    );
    return result.rows[0];
}

const getNoteByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT n.*, u.name as created_by_name FROM notes n JOIN users u ON n.created_by = u.id 
        WHERE n.meeting_id = $1`, [meeting_id]
    );
    return result.rows[0] || null;
}

const updateNote = async (meeting_id, content) => {
    const result = await db.query(
        `UPDATE notes SET content = $1, updated_at = NOW() WHERE meeting_id = $2 RETURNING *`,
        [JSON.stringify(content), meeting_id]
    )
    return result.rows[0] || null
}

module.exports = {createNote, getNoteByMeetingId, updateNote};