const { sendWhatsAppText } = require('../config/wa')
const { invitationMessage, meetingSummaryMessage } = require('../utils/waTemplates')
const { normalizeIndonesiaWhatsapp } = require('../utils/normalizePhone')
const tiptapToText = require('../utils/tiptapToText')
const waRepo = require('../repositories/waRepository')
const meetingRepo = require('../repositories/meetingRepository')
const notesRepo = require('../repositories/noteRepository')
const actionItemsRepo = require('../repositories/actionItemRepository')
const authRepo = require('../repositories/authRepository')

const sendInvitationWhatsApp = async ({ recipientPhone, recipientName, meeting, hostName }) => {
    const to = normalizeIndonesiaWhatsapp(recipientPhone)
    if (!to) {
        throw new Error('Nomor WhatsApp penerima tidak valid')
    }
    const message = invitationMessage({
        recipientName,
        meetingTitle: meeting.title,
        scheduledAt: meeting.scheduled_at,
        endTime: meeting.end_time,
        location: meeting.location,
        hostName,
    })
    const result = await sendWhatsAppText({ to, message })
    console.log(`✓ WA undangan → ${to}`)
    return result
}

const sendMeetingSummaryWhatsApps = async (meeting_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id)
    if (!meeting) {
        const e = new Error('Meeting tidak ditemukan')
        e.status = 404
        throw e
    }

    const participants = await waRepo.getParticipantsWithWhatsappByMeetingId(meeting_id)
    const note = await notesRepo.getNoteByMeetingId(meeting_id)
    const allActionItems = await actionItemsRepo.getActionItemsByMeetingId(meeting_id)
    const noteText = note?.content ? tiptapToText(note.content) : null
    const aiSummary = meeting.ai_summary || null

    const tasks = participants.map(async (participant) => {
        const to = normalizeIndonesiaWhatsapp(participant.whatsapp_phone)
        if (!to) return { status: 'skipped', user_id: participant.id, reason: 'invalid_phone' }

        const myActionItems = allActionItems.filter(
            (item) => item.assigned_to === participant.id && item.status !== 'done'
        )

        try {
            const message = meetingSummaryMessage({
                recipientName: participant.name,
                meetingTitle: meeting.title,
                scheduledAt: meeting.scheduled_at,
                location: meeting.location,
                aiSummary,
                noteText,
                myActionItems,
            })
            const result = await sendWhatsAppText({ to, message })
            console.log(`✓ WA ringkasan meeting → ${participant.name} (${to})`)
            return { status: 'fulfilled', user_id: participant.id, result }
        } catch (err) {
            console.error(`✗ WA ringkasan gagal → ${participant.name}:`, err.message)
            return { status: 'rejected', user_id: participant.id, error: err.message }
        }
    })

    const results = await Promise.all(tasks)
    const ok = results.filter((r) => r.status === 'fulfilled').length
    console.log(`[WA Summary] meeting ${meeting_id}: ${ok}/${results.length} terkirim`)
    return results
}

const assertHost = async (meeting_id, user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id)
    if (!meeting) {
        const e = new Error('Meeting tidak ditemukan')
        e.status = 404
        throw e
    }
    const role = await meetingRepo.getUserRole(meeting_id, user_id)
    if (role !== 'host') {
        const e = new Error('Hanya host yang dapat mengirim pesan WhatsApp untuk meeting ini')
        e.status = 403
        throw e
    }
    return meeting
}

/**
 * Host: kirim ulang undangan WA ke satu peserta atau semua peserta yang punya nomor.
 */
const sendInvitationWhatsAppByMeeting = async (meeting_id, host_user_id, { participant_user_id } = {}) => {
    const meeting = await assertHost(meeting_id, host_user_id)
    const host = await authRepo.findUserById(host_user_id)
    if (!host) {
        const e = new Error('User tidak ditemukan')
        e.status = 404
        throw e
    }

    const withPhone = await waRepo.getParticipantsWithWhatsappByMeetingId(meeting_id)
    let targets = withPhone
    if (participant_user_id) {
        targets = withPhone.filter((p) => p.id === participant_user_id)
        if (targets.length === 0) {
            const isParticipant = await meetingRepo.isParticipant(meeting_id, participant_user_id)
            if (!isParticipant) {
                const e = new Error('User bukan peserta meeting ini')
                e.status = 404
                throw e
            }
            const e = new Error('Peserta tidak memiliki nomor WhatsApp di profil')
            e.status = 400
            throw e
        }
    }

    const results = []
    for (const p of targets) {
        try {
            const r = await sendInvitationWhatsApp({
                recipientPhone: p.whatsapp_phone,
                recipientName: p.name,
                meeting,
                hostName: host.name,
            })
            results.push({ user_id: p.id, status: 'sent', result: r })
        } catch (err) {
            results.push({ user_id: p.id, status: 'failed', error: err.message })
        }
    }
    return { meeting_id, results }
}

/**
 * Host: kirim notulen + ringkasan AI + action items lewat WA (biasanya meeting sudah selesai).
 */
const sendMeetingSummaryWhatsAppByMeeting = async (meeting_id, host_user_id) => {
    await assertHost(meeting_id, host_user_id)
    const results = await sendMeetingSummaryWhatsApps(meeting_id)
    return { meeting_id, results }
}

module.exports = {
    sendInvitationWhatsApp,
    sendMeetingSummaryWhatsApps,
    sendInvitationWhatsAppByMeeting,
    sendMeetingSummaryWhatsAppByMeeting,
}
