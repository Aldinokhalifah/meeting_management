const meetingRepo = require('../repositories/meetingRepository');
const actionItemsRepo = require('../repositories/actionItemRepository');
const continuationRepo = require('../repositories/continuationRepository');
const emailService = require('./emailService');
const authRepo = require('../repositories/authRepository');

const createContinuation = async ({
    source_meeting_id,
    title,
    description,
    scheduled_at,
    end_time,
    location,
    participant_ids = [],
}, user_id) => {

    const sourceMeeting = await meetingRepo.getMeetingById(source_meeting_id);
    if (!sourceMeeting) throw new Error('SOURCE_MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(source_meeting_id, user_id);
    if (role !== 'host') throw new Error('ONLY_HOST_CAN_CREATE_CONTINUATION');

    if (!title || !scheduled_at) throw new Error('TITLE_AND_SCHEDULE_REQUIRED');

    const validAccessLevels = ['full', 'summary_only', 'none']
    for (const p of participant_ids) {
            if (p.access_level && !validAccessLevels.includes(p.access_level)) {
                throw new Error('INVALID_ACCESS_LEVEL');
        }
    }

    const checkRoomAvailable = await meetingRepo.checkRoomAvailable(location, scheduled_at, end_time);
    if(checkRoomAvailable) {
        throw new Error('SCHEDULE_CONFLICT_ROOM');
    }

    // Cek bentrok jadwal jika end_time diisi
    if (end_time) {
        const allConflictIds = [];
        for (const p of [{ user_id }, ...participant_ids]) {
            const conflictUserIds = await meetingRepo.checkScheduleConflict(p.user_id, scheduled_at, end_time);
            allConflictIds.push(...conflictUserIds);
        }
        if (allConflictIds.length > 0) throw new Error(`SCHEDULE_CONFLICT_USERS_[${[...new Set(allConflictIds)].join(', ')}]`);
    }

    const newMeeting = await meetingRepo.createMeeting({
        title,
        description,
        scheduled_at,
        end_time,
        location,
        created_by: user_id,
        previous_meeting_id: source_meeting_id,
    });

    await meetingRepo.addParticipant({
        meeting_id: newMeeting.id,
        user_id,
        role: 'host',
    });

    for (const p of participant_ids) {
        if (p.user_id === user_id) continue;

        await meetingRepo.addParticipant({
            meeting_id: newMeeting.id,
            user_id: p.user_id,
            role: p.role || 'participant',
        });

        const wasParticipant = await meetingRepo.isParticipant(source_meeting_id, p.user_id);

        await continuationRepo.setAccessLevel({
        continuation_meeting_id: newMeeting.id,
        source_meeting_id,
        user_id: p.user_id,
        access_level: wasParticipant ? 'full' : (p.access_level || 'none'),
        });

        // Kirim email undangan untuk peserta baru
        // const targetUser = await authRepo.findUserById(p.user_id)
        // const host = await authRepo.findUserById(user_id)

        // if (targetUser) {
        //     emailService.sendInvitationEmail({
        //     recipientEmail: targetUser.email,
        //     recipientName: targetUser.name,
        //     meeting: newMeeting,
        //     hostName: host.name,
        //     }).catch((err) => {
        //         console.error(`[Email Error] Invitation to ${targetUser.email}:`, err.message)
        //     })
        // }
        // if (targetUser.whatsapp_phone) {
        //     waService
        //         .sendInvitationWhatsApp({
        //             recipientPhone: targetUser.whatsapp_phone,
        //             recipientName: targetUser.name,
        //             meeting,
        //             hostName: host.name,
        //         })
        //         .catch((err) => {
        //             console.error(`[WA Error] Invitation to ${targetUser.whatsapp_phone}:`, err.message)
        //         })
        // }
    }

    const openItems = await actionItemsRepo.getOpenActionItemsByMeetingId(source_meeting_id);
    const carriedItems = [];

    for (const item of openItems) {
        await actionItemsRepo.updateActionItem(item.id, { status: 'carried_over' });

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

    return { ...newMeeting, participants, carried_action_items: carriedItems };
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