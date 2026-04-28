const db = require('../config/db');

const setAccessLevel = async ({continuation_meeting_id, source_meeting_id, user_id, access_level}) => {
    const result = await db.query(
        `INSERT INTO meeting_continuation_access 
        (continuation_meeting_id, source_meeting_id, user_id, access_level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (continuation_meeting_id, source_meeting_id, user_id)
        DO UPDATE SET access_level = $4
        RETURNING *`,
        [continuation_meeting_id, source_meeting_id, user_id, access_level]
    );
    return result.rows[0];
}

const getAccessLevel = async ({ continuation_meeting_id, source_meeting_id, user_id }) => {
    const result = await db.query(
        `SELECT access_level FROM meeting_continuation_access
        WHERE continuation_meeting_id = $1
        AND source_meeting_id = $2
        AND user_id = $3`,
        [continuation_meeting_id, source_meeting_id, user_id]
    )
    return result.rows[0]?.access_level || null;
}

const getAllAccessByContinuationId = async (continuation_meeting_id) => {
    const result = await db.query(
        `SELECT mca.*, u.name, u.email
        FROM meeting_continuation_access mca
        JOIN users u ON mca.user_id = u.id
        WHERE mca.continuation_meeting_id = $1`,
        [continuation_meeting_id]
    );
    return result.rows;
}


module.exports = {setAccessLevel, getAccessLevel, getAllAccessByContinuationId};