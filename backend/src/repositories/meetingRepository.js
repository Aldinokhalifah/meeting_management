const db = require('../config/db');

const createMeeting = async ({ title, description, scheduled_at, created_by }) => {
    const result = await db.query(
        `INSERT INTO meetings (title, description, scheduled_at, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [title, description, scheduled_at, created_by]
    );
    return result.rows[0];
};

const addParticipant = async ({ meeting_id, user_id, role = 'participant' }) => {
    const result = await db.query(
        `INSERT INTO meeting_participants (meeting_id, user_id, role)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [meeting_id, user_id, role]
    );
    return result.rows[0];
};

const getMeetingByUser = async (user_id) => {
    const result = await db.query(
        `SELECT m.*, mp.role as my_role
        FROM meetings m
        JOIN meeting_participants mp ON m.id = mp.meeting_id
        WHERE mp.user_id = $1
        ORDER BY m.scheduled_at DESC`,
        [user_id]
    );
    return result.rows;
};

const getMeetingById = async (meeting_id) => {
    const result = await db.query(
        `SELECT id, title, description, scheduled_at, status, created_by, previous_meeting_id, created_at 
        FROM meetings WHERE id = $1`, 
        [meeting_id]
    );
    return result.rows[0] || null;
};

const getParticipantsByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT u.id, u.name, u.email, u.avatar_url, mp.role
        FROM meeting_participants mp
        JOIN users u ON mp.user_id = u.id
        WHERE mp.meeting_id = $1`,
        [meeting_id]
    );
    return result.rows;
};

const isParticipant = async (meeting_id, user_id) => {
    const result = await db.query(
        `SELECT 1 FROM meeting_participants
        WHERE meeting_id = $1 AND user_id = $2`,
        [meeting_id, user_id]
    );
    return result.rows.length > 0;
};

const getUserRole = async (meeting_id, user_id) => {
    const result = await db.query(
        `SELECT role FROM meeting_participants
        WHERE meeting_id = $1 AND user_id = $2`,
        [meeting_id, user_id]
    );
    return result.rows[0]?.role || null;
};

const updateMeeting = async (meeting_id, { title, description, scheduled_at, status }) => {
    const result = await db.query(
        `UPDATE meetings
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            scheduled_at = COALESCE($3, scheduled_at),
            status = COALESCE($4, status)
        WHERE id = $5
        RETURNING *`,
        [title, description, scheduled_at, status, meeting_id]
    );
    return result.rows[0];
};

const deleteMeeting = async (meeting_id) => {
    await db.query(`DELETE FROM meetings WHERE id = $1`, [meeting_id]);
};

const removeParticipant = async (meeting_id, user_id) => {
    await db.query(
        `DELETE FROM meeting_participants
        WHERE meeting_id = $1 AND user_id = $2`,
        [meeting_id, user_id]
    );
};

module.exports = {
    createMeeting, addParticipant, getMeetingByUser, getMeetingById, 
    getParticipantsByMeetingId, isParticipant, getUserRole, 
    updateMeeting, deleteMeeting, removeParticipant
};