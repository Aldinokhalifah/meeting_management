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
    ONLY_HOST_CAN_UPDATE_ROLE: { status: 403, message: 'Hanya host yang dapat mengubah role peserta' },
    USER_NOT_PARTICIPANT: { status: 404, message: 'User bukan peserta meeting ini' },
    HOST_CANNOT_CHANGE_OWN_ROLE: { status: 400, message: 'Host tidak dapat mengubah role diri sendiri' },
    INVALID_ROLE: { status: 400, message: 'Role tidak valid, gunakan secretary atau participant' },
    UPDATE_ROLE_FAILED: { status: 500, message: 'Gagal mengupdate role peserta' },
    INVALID_EMAIL_FORMAT: { status: 400, message: 'Format email tidak valid' },
    PASSWORD_TOO_SHORT: { status: 400, message: 'Password minimal 6 karakter' },
    INVALID_NAME: { status: 400, message: 'Nama tidak boleh kosong' },
    EMAIL_ALREADY_EXISTS: { status: 409, message: 'Email sudah terdaftar' },
    INVALID_TITLE: { status: 400, message: 'Title tidak boleh kosong' },
    INVALID_DATETIME_FORMAT: { status: 400, message: 'Format datetime tidak valid' },
    INVALID_PARTICIPANT_IDS: { status: 400, message: 'participant_ids harus berupa array' },
    DESCRIPTION_REQUIRED: { status: 400, message: 'Deskripsi action item tidak boleh kosong' },
    INVALID_DATE_FORMAT: { status: 400, message: 'Format tanggal tidak valid' },
    DUE_DATE_IN_THE_PAST: { status: 400, message: 'Due date tidak boleh di masa lalu' },
    INVALID_STATUS_FILTER: { status: 400, message: 'Status filter tidak valid, gunakan open, done, atau carried_over' },
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