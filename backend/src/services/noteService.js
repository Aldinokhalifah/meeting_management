const notesRepo = require('../repositories/noteRepository');
const meetingRepo = require('../repositories/meetingRepository');

const createNote = async ({ meeting_id, content, user_id }) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Hanya host & secretary yang boleh buat notulen
    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!['host', 'secretary'].includes(role)) throw new Error('Hanya host dan secretary yang dapat membuat notulen');

    // Cek notulen sudah ada belum (1 meeting = 1 notulen)
    const existing = await notesRepo.getNoteByMeetingId(meeting_id);
    if (existing) throw new Error('Notulen sudah ada, gunakan endpoint edit');

    return await notesRepo.createNote({ meeting_id, content, created_by: user_id });
}

const getNote = async ({ meeting_id, user_id }) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    const note = await notesRepo.getNoteByMeetingId(meeting_id);
    if (!note) throw new Error('Notulen belum dibuat');

    return note;
}

const updateNote = async ({ meeting_id, content, user_id }) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Hanya host & secretary yang boleh edit notulen
    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!['host', 'secretary'].includes(role)) throw new Error('Hanya host dan secretary yang dapat mengedit notulen');

    // Cek notulen ada
    const existing = await notesRepo.getNoteByMeetingId(meeting_id);
    if (!existing) throw new Error('Notulen belum dibuat');

    return await notesRepo.updateNote(meeting_id, content);
}

module.exports = { createNote, getNote, updateNote };