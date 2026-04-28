const meetingRepo = require('../repositories/meetingRepository');
const actionItemsRepo = require('../repositories/actionItemRepository');
const continuationRepo = require('../repositories/continuationRepository');

const createContinuation = async ({
    source_meeting_id,
    title,
    description,
    scheduled_at,
    participant_ids = [],   // [{ user_id, role, access_level }]
}, user_id) => {

    // Cek meeting sumber ada
    const sourceMeeting = await meetingRepo.getMeetingById(source_meeting_id);
    if (!sourceMeeting) throw new Error('Meeting sebelumnya tidak ditemukan');

    // Hanya host yang boleh buat continuation
    const role = await meetingRepo.getUserRole(source_meeting_id, user_id);
    if (role !== 'host') throw new Error('Hanya host yang dapat membuat meeting lanjutan');

    // Validasi field wajib
    if (!title || !scheduled_at) throw new Error('Title dan jadwal wajib diisi');

    // Validasi access_level yang dikirim
    const validAccessLevels = ['full', 'summary_only', 'none'];
    for (const p of participant_ids) {
        if (p.access_level && !validAccessLevels.includes(p.access_level)) {
            throw new Error(`Access level tidak valid untuk user ${p.user_id}`);
        }
    }

    // Buat meeting baru dengan previous_meeting_id
    const newMeeting = await meetingRepo.createMeeting({
        title,
        description,
        scheduled_at,
        created_by: user_id,
        previous_meeting_id: source_meeting_id,
    });

    // Tambah host sebagai peserta meeting baru
    await meetingRepo.addParticipant({
        meeting_id: newMeeting.id,
        user_id,
        role: 'host',
    });

    // Tambah peserta lain + set access level ke meeting lama
    for (const p of participant_ids) {
        if (p.user_id === user_id) continue; // skip kalau host

        // Tambah sebagai peserta meeting baru
        await meetingRepo.addParticipant({
            meeting_id: newMeeting.id,
            user_id: p.user_id,
            role: p.role || 'participant',
        });

        // Cek apakah user ini peserta di meeting lama
        const wasParticipant = await meetingRepo.isParticipant(source_meeting_id, p.user_id);

        if (wasParticipant) {
        // Peserta lama otomatis full access
            await continuationRepo.setAccessLevel({
                continuation_meeting_id: newMeeting.id,
                source_meeting_id,
                user_id: p.user_id,
                access_level: 'full',
            });
        } else {
        // Peserta baru → pakai access_level dari request, default 'none'
            await continuationRepo.setAccessLevel({
                continuation_meeting_id: newMeeting.id,
                source_meeting_id,
                user_id: p.user_id,
                access_level: p.access_level || 'none',
            });
        }
    }

    // Carry-over action items yang masih open dari meeting lama
    const openItems = await actionItemsRepo.getOpenActionItemsByMeetingId(source_meeting_id);
    const carriedItems = [];

    for (const item of openItems) {
        // Update status item lama jadi carried_over
        await actionItemsRepo.updateActionItem(item.id, { status: 'carried_over' });

        // Buat action item baru di meeting baru
        const newItem = await actionItemsRepo.createActionItem({
            meeting_id: newMeeting.id,
            description: item.description,
            assigned_to: item.assigned_to,
            due_date: item.due_date,
            carried_from_id: item.id,
        });
        carriedItems.push(newItem);
    }

    const participants = await meetingRepo.getParticipantsByMeetingId(newMeeting.id);

    return {
        ...newMeeting,
        participants,
        carried_action_items: carriedItems,
    };
}

const getPreviousMeeting = async (continuation_meeting_id, user_id) => {
    // Cek meeting continuation ada
    const continuationMeeting = await meetingRepo.getMeetingById(continuation_meeting_id);
    if (!continuationMeeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta meeting continuation
    const participant = await meetingRepo.isParticipant(continuation_meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Cek ada previous meeting tidak
    if (!continuationMeeting.previous_meeting_id) throw new Error('Meeting ini tidak memiliki meeting sebelumnya');

    const source_meeting_id = continuationMeeting.previous_meeting_id;

    // Cek apakah user peserta asli meeting lama
    const wasParticipant = await meetingRepo.isParticipant(source_meeting_id, user_id);

    if (wasParticipant) {
        // Peserta lama → full access
        const meeting = await meetingRepo.getMeetingById(source_meeting_id);
        const participants = await meetingRepo.getParticipantsByMeetingId(source_meeting_id);
        return { access_level: 'full', meeting: { ...meeting, participants } };
    }

    // Peserta baru → cek access level
    const accessLevel = await continuationRepo.getAccessLevel({
        continuation_meeting_id,
        source_meeting_id,
        user_id,
    });

    if (!accessLevel || accessLevel === 'none') {
        throw new Error('Kamu tidak memiliki akses ke meeting sebelumnya');
    }

    const sourceMeeting = await meetingRepo.getMeetingById(source_meeting_id);

    if (accessLevel === 'summary_only') {
        // Hanya return info dasar, tanpa notulen & action items detail
        return {
        access_level: 'summary_only',
        meeting: {
            id: sourceMeeting.id,
            title: sourceMeeting.title,
            scheduled_at: sourceMeeting.scheduled_at,
            status: sourceMeeting.status,
            description: sourceMeeting.description,
        },
        };
    }

    // Full access
    const participants = await meetingRepo.getParticipantsByMeetingId(source_meeting_id);
    return {
        access_level: 'full',
        meeting: { ...sourceMeeting, participants },
    };
}

module.exports = { createContinuation, getPreviousMeeting };