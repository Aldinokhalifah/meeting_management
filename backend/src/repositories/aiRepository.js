const db = require('../config/db')

const saveAiSummary = async (meeting_id, ai_summary) => {
    const result = await db.query(
        `UPDATE meetings
        SET ai_summary = $1
        WHERE id = $2
        RETURNING id, ai_summary`,
        [ai_summary, meeting_id]
    )
    return result.rows[0] || null
}

const getAiSummary = async (meeting_id) => {
    const result = await db.query(
        `SELECT ai_summary FROM meetings WHERE id = $1`,
        [meeting_id]
    )
    return result.rows[0]?.ai_summary || null
}

module.exports = { saveAiSummary, getAiSummary }