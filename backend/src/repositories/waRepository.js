const db = require('../config/db')

/**
 * Peserta meeting yang punya nomor WhatsApp tersimpan.
 */
const getParticipantsWithWhatsappByMeetingId = async (meeting_id) => {
    const result = await db.query(
        `SELECT u.id, u.name, u.email, u.whatsapp_phone, mp.role
        FROM meeting_participants mp
        JOIN users u ON u.id = mp.user_id
        WHERE mp.meeting_id = $1
        AND u.whatsapp_phone IS NOT NULL
        AND TRIM(u.whatsapp_phone) <> ''`,
        [meeting_id]
    )
    return result.rows
}

module.exports = {
    getParticipantsWithWhatsappByMeetingId,
}
