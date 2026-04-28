const ERROR_MAP = {
    MEETING_NOT_FOUND: { status: 404, message: 'Meeting tidak ditemukan' },
    ACCESS_FORBIDDEN: { status: 403, message: 'Kamu tidak memiliki akses ke meeting ini' },
    ONLY_HOST_CAN_UPDATE: { status: 403, message: 'Hanya host yang dapat mengubah meeting' },
    ONLY_HOST_CAN_DELETE: { status: 403, message: 'Hanya host yang dapat menghapus meeting' },
    ONLY_HOST_CAN_ADD_PARTICIPANT: { status: 403, message: 'Hanya host yang dapat menambah peserta' },
    ONLY_HOST_CAN_REMOVE_PARTICIPANT: { status: 403, message: 'Hanya host yang dapat menghapus peserta' },
    USER_NOT_FOUND: { status: 404, message: 'User tidak ditemukan' },
    ALREADY_PARTICIPANT: { status: 409, message: 'User sudah menjadi peserta' },
    HOST_CANNOT_REMOVE_SELF: { status: 400, message: 'Host tidak dapat menghapus diri sendiri' },
    USER_ID_REQUIRED: { status: 400, message: 'user_id wajib diisi' },
    TITLE_AND_SCHEDULE_REQUIRED: { status: 400, message: 'Title dan jadwal wajib diisi' },
    SCHEDULE_CONFLICT: { status: 409, message: 'Terdapat jadwal meeting yang bentrok' },
    SOURCE_MEETING_NOT_FOUND: { status: 404, message: 'Meeting sebelumnya tidak ditemukan' },
    ONLY_HOST_CAN_CREATE_CONTINUATION: { status: 403, message: 'Hanya host yang dapat membuat meeting lanjutan' },
    INVALID_ACCESS_LEVEL: { status: 400, message: 'Access level tidak valid' },
};

module.exports = (err, req, res, next) => {
    // Handle dynamic SCHEDULE_CONFLICT_USERS error
    if (err.message.startsWith('SCHEDULE_CONFLICT_USERS_')) {
        const userIds = err.message.replace('SCHEDULE_CONFLICT_USERS_', '').split(',')
        return res.status(409).json({
        message: 'Terdapat jadwal meeting yang bentrok',
        conflict_user_ids: userIds,
        });
    }

    const mapped = ERROR_MAP[err.message]
    if (mapped) {
        return res.status(mapped.status).json({ message: mapped.message });
    }

    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
}