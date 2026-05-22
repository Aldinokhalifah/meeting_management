const openrouter = require('../config/openrouter')
const aiRepo = require('../repositories/aiRepository')
const notesRepo = require('../repositories/noteRepository')
const meetingRepo = require('../repositories/meetingRepository')
const actionItemRepo = require('../repositories/actionItemRepository')
const tiptapToText = require('../utils/tiptapToText')
const Prompt = require('../utils/prompt')

const generateMeetingSummary = async (meeting_id, user_id) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id)
    if (!meeting) throw new Error('MEETING_NOT_FOUND')

    // Cek user adalah peserta
    const isParticipant = await meetingRepo.isParticipant(meeting_id, user_id)
    if (!isParticipant) throw new Error('ACCESS_FORBIDDEN')

    // Cek meeting sudah done
    if (meeting.status !== 'done') throw new Error('MEETING_NOT_DONE')

    // Ambil notulen
    const note = await notesRepo.getNoteByMeetingId(meeting_id)
    const noteText = note?.content ? tiptapToText(note.content) : null

    if (!noteText) throw new Error('NOTE_EMPTY')

    // Ambil Action Item
    const actionItems = await actionItemRepo.getActionItemsByMeetingId(meeting_id)
    
    // Format action items menjadi string readable
    const actionItemText = actionItems && actionItems.length > 0
    ? actionItems
        .filter(item => item.status !== 'done')
        .map((item, index) =>
            `${index + 1}. ${item.description} (Ditugaskan ke: ${item.assigned_to_name || 'Belum ditugaskan'}, Deadline: ${item.due_date || 'Tidak ada deadline'})`
        )
        .join('\n')
    : 'Tidak ada action items';
    // Ambil peserta
    const participants = await meetingRepo.getParticipantsByMeetingId(meeting_id)
    const participantNames = participants.map((p) => `${p.name} (${p.role})`).join(', ')

    // Buat prompt
    const promptText = Prompt(meeting.title, meeting.scheduled_at, meeting.location, meeting.description, noteText, participantNames, actionItemText);

    // Kirim ke OpenRouter
    const response = await openrouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 1000,
        temperature: 0.3, // rendah agar output konsisten
    })

    const summary = response.choices[0]?.message?.content
    if (!summary) throw new Error('AI_RESPONSE_EMPTY')

    // Simpan ke database
    await aiRepo.saveAiSummary(meeting_id, summary)

    return summary
}

const getAiSummary = async (meeting_id, user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id)
    if (!meeting) throw new Error('MEETING_NOT_FOUND')

    const isParticipant = await meetingRepo.isParticipant(meeting_id, user_id)
    if (!isParticipant) throw new Error('ACCESS_FORBIDDEN')

    const summary = await aiRepo.getAiSummary(meeting_id)
    if (!summary) throw new Error('AI_SUMMARY_NOT_FOUND')

    return summary
}

module.exports = { generateMeetingSummary, getAiSummary }