const resend = require('../config/resend')
const { invitationTemplate, meetingSummaryTemplate } = require('../utils/emailTemplates')
const notesRepo = require('../repositories/noteRepository')
const actionItemsRepo = require('../repositories/actionItemRepository')
const meetingRepo = require('../repositories/meetingRepository')
const tiptapToText = require('../utils/tiptapToText')

const sendInvitationEmail = async ({ recipientEmail, recipientName, meeting, hostName }) => {
    if (!process.env.FROM_EMAIL) {
        throw new Error('FROM_EMAIL tidak dikonfigurasi di .env')
    }

    try {
        const result = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: recipientEmail,
            subject: `Undangan Meeting: ${meeting.title}`,
            html: invitationTemplate({
                recipientName,
                meetingTitle: meeting.title,
                scheduledAt: meeting.scheduled_at,
                endTime: meeting.end_time,
                location: meeting.location,
                hostName,
            }),
        })
        console.log(`✓ Email undangan dikirim ke ${recipientEmail}:`, result)
        return result
    } catch (err) {
        console.error(`✗ Gagal kirim email ke ${recipientEmail}:`, err.message)
        throw err
    }
}

    const sendMeetingSummaryEmails = async (meeting_id) => {
    if (!process.env.FROM_EMAIL) {
        throw new Error('FROM_EMAIL tidak dikonfigurasi di .env')
    }

    // Ambil semua data yang dibutuhkan
    const meeting = await meetingRepo.getMeetingById(meeting_id)
    const participants = await meetingRepo.getParticipantsByMeetingId(meeting_id)
    const note = await notesRepo.getNoteByMeetingId(meeting_id)
    const allActionItems = await actionItemsRepo.getActionItemsByMeetingId(meeting_id)

    const noteText = note?.content ? tiptapToText(note.content) : null
    const aiSummary = meeting.ai_summary || null

    // Kirim email ke setiap peserta
    const emailPromises = participants.map(async (participant) => {
        // Filter action items yang di-assign ke peserta ini
        const myActionItems = allActionItems.filter(
            (item) => item.assigned_to === participant.id && item.status !== 'done'
        )

        try {
            const result = await resend.emails.send({
                from: process.env.FROM_EMAIL,
                to: participant.email,
                subject: `[Selesai] Ringkasan Meeting: ${meeting.title}`,
                html: meetingSummaryTemplate({
                    recipientName: participant.name,
                    meetingTitle: meeting.title,
                    scheduledAt: meeting.scheduled_at,
                    location: meeting.location,
                    aiSummary,
                    noteText,
                    myActionItems,
                }),
            })
            console.log(`✓ Email ringkasan dikirim ke ${participant.email}:`, result)
            return result
        } catch (err) {
            console.error(`✗ Gagal kirim email ke ${participant.email}:`, err.message)
            throw err
        }
    })

    // Kirim semua email secara parallel
    const results = await Promise.allSettled(emailPromises)
    console.log(`Summary: ${results.filter(r => r.status === 'fulfilled').length}/${results.length} email berhasil`)
}

module.exports = { sendInvitationEmail, sendMeetingSummaryEmails }