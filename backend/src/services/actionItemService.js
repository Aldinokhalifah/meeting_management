const actionItemsRepo = require('../repositories/actionItemRepository')
const meetingRepo = require('../repositories/meetingRepository')

const createActionItem = async ({ meeting_id, description, assigned_to, due_date }, user_id) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Hanya host & secretary yang boleh buat action item
    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!['host', 'secretary'].includes(role)) throw new Error('Hanya host dan secretary yang dapat membuat action item');

    // Cek assignee adalah peserta meeting
    if (assigned_to) {
        const assigneeIsParticipant = await meetingRepo.isParticipant(meeting_id, assigned_to);
        if (!assigneeIsParticipant) throw new Error('Assignee harus merupakan peserta meeting');
    }

    return await actionItemsRepo.createActionItem({ meeting_id, description, assigned_to, due_date });
}

const getActionItems = async (meeting_id, user_id) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    return await actionItemsRepo.getActionItemsByMeetingId(meeting_id);
}

const updateActionItem = async (meeting_id, item_id, body, user_id) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Hanya host & secretary yang boleh edit
    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!['host', 'secretary'].includes(role)) throw new Error('Hanya host dan secretary yang dapat mengedit action item');

    // Cek action item ada dan milik meeting ini
    const item = await actionItemsRepo.getActionItemById(item_id);
    if (!item) throw new Error('Action item tidak ditemukan');
    if (item.meeting_id !== meeting_id) throw new Error('Action item tidak ditemukan');

    // Validasi status
    const validStatus = ['open', 'done', 'carried_over'];
    if (body.status && !validStatus.includes(body.status)) throw new Error('Status tidak valid');

    return await actionItemsRepo.updateActionItem(item_id, body)
}

const deleteActionItem = async (meeting_id, item_id, user_id) => {
    // Cek meeting ada
    const meeting = await meetingRepo.getMeetingById(meeting_id);
    if (!meeting) throw new Error('Meeting tidak ditemukan');

    // Cek user adalah peserta
    const participant = await meetingRepo.isParticipant(meeting_id, user_id);
    if (!participant) throw new Error('Kamu tidak memiliki akses ke meeting ini');

    // Hanya host & secretary yang boleh hapus
    const role = await meetingRepo.getUserRole(meeting_id, user_id);
    if (!['host', 'secretary'].includes(role)) throw new Error('Hanya host dan secretary yang dapat menghapus action item');

    // Cek action item ada dan milik meeting ini
    const item = await actionItemsRepo.getActionItemById(item_id);
    if (!item) throw new Error('Action item tidak ditemukan');
    if (item.meeting_id !== meeting_id) throw new Error('Action item tidak ditemukan');

    await actionItemsRepo.deleteActionItem(item_id);
}

module.exports = { createActionItem, getActionItems, updateActionItem, deleteActionItem };