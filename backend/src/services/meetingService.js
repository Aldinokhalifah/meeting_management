const meetingRepo = require('../repositories/meetingRepository');
const authRepo = require('../repositories/authRepository');

const createMeeting = async ({ title, description, scheduled_at, end_time, location, participant_ids = [], previous_meeting_id = null }, created_by) => {
    if (!title || !scheduled_at) throw new Error('TITLE_AND_SCHEDULE_REQUIRED');

    // Cek bentrok jadwal jika end_time diisi
    if (end_time) {
        const allConflictIds = [];
        for (const pid of [created_by, ...participant_ids]) {
            const conflictUserIds = await meetingRepo.checkScheduleConflict(pid, scheduled_at, end_time);
            allConflictIds.push(...conflictUserIds);
        }
        if (allConflictIds.length > 0) throw new Error(`SCHEDULE_CONFLICT_USERS_[${[...new Set(allConflictIds)].join(', ')}]`);
    }

    const meeting = await meetingRepo.createMeeting({ 
        title, description, scheduled_at, end_time, location, created_by, previous_meeting_id 
    })

    await meetingRepo.addParticipant({ meeting_id: meeting.id, user_id: created_by, role: 'host' })

    for (const user_id of participant_ids) {
        if (user_id === created_by) continue
        await meetingRepo.addParticipant({ meeting_id: meeting.id, user_id, role: 'participant' })
    }

    const participants = await meetingRepo.getParticipantsByMeetingId(meeting.id)
    return { ...meeting, participants }
}

const getMeetings = async (user_id) => {
    return await meetingRepo.getMeetingByUser(user_id);
};

const getMeetingDetail = async (meeting_id, user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('ACCESS_FORBIDDEN');

    const participants = await meetingRepo.getParticipantsByMeetingId(meeting_id);
    return { ...meeting, participants };
};

const updateMeeting = async (meeting_id, user_id, body) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (role !== 'host') throw new Error('ONLY_HOST_CAN_UPDATE');

    return await meetingRepo.updateMeeting(meeting_id, body);
};

const deleteMeeting = async (meeting_id, user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (role !== 'host') throw new Error('ONLY_HOST_CAN_DELETE');

    await meetingRepo.deleteMeeting(meeting_id);
    return { id: meeting_id };
};

const addParticipant = async (meeting_id, user_id, target_user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (role !== 'host') throw new Error('ONLY_HOST_CAN_ADD_PARTICIPANT');

    const targetUser = await authRepo.findUserById(target_user_id);
    if (!targetUser) throw new Error('USER_NOT_FOUND');

    const already = await meetingRepo.isParticipant(meeting_id, target_user_id);
    if (already) throw new Error('ALREADY_PARTICIPANT');

    // Cek bentrok hanya kalau meeting punya end_time
    if (meeting.end_time) {
        const conflictUserIds = await meetingRepo.checkScheduleConflict(target_user_id, meeting.scheduled_at, meeting.end_time);
        if (conflictUserIds.length > 0) throw new Error(`SCHEDULE_CONFLICT_USERS_${conflictUserIds.join(',')}`);
    }

    return await meetingRepo.addParticipant({ meeting_id, user_id: target_user_id, role: 'participant' });
}

const removeParticipant = async (meeting_id, user_id, target_user_id) => {
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('MEETING_NOT_FOUND');

    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (role !== 'host') throw new Error('ONLY_HOST_CAN_REMOVE_PARTICIPANT');

    if (target_user_id === user_id) throw new Error('HOST_CANNOT_REMOVE_SELF');

    await meetingRepo.removeParticipant(meeting_id, target_user_id);
    return { message: 'Participant removed' };
};

module.exports = {
    createMeeting, getMeetings, getMeetingDetail,
    updateMeeting, deleteMeeting, addParticipant, removeParticipant,
};