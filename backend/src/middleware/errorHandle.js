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
    END_TIME_BEFORE_START_TIME: { status: 400, message: 'Waktu selesai harus lebih besar dari waktu mulai' },
    SCHEDULE_IN_THE_PAST: { status: 400, message: 'Jadwal meeting tidak boleh di masa lalu' },
    SCHEDULE_CONFLICT: { status: 409, message: 'Terdapat jadwal meeting yang bentrok' },
    SCHEDULE_CONFLICT_ROOM: { status: 409, message: 'Ruangan sudah digunakan pada jadwal tersebut' },
    AI_AGENT_ERROR: { status: 500, message: 'Gagal menjalankan AI agent' },
    MEETING_NOT_DONE: { status: 400, message: 'Meeting belum selesai' },
    NOTE_EMPTY: { status: 400, message: 'Notulen belum memiliki isi' },
    AI_SUMMARY_FAILED_EXHAUSTED: { status: 500, message: 'Gagal membuat ringkasan meeting' },
    AI_SUMMARY_NOT_FOUND: { status: 404, message: 'Ringkasan meeting tidak ditemukan' },
    SOURCE_MEETING_NOT_FOUND: { status: 404, message: 'Meeting sebelumnya tidak ditemukan' },
    ONLY_HOST_CAN_CREATE_CONTINUATION: { status: 403, message: 'Hanya host yang dapat membuat meeting lanjutan' },
    INVALID_ACCESS_LEVEL: { status: 400, message: 'Access level tidak valid' },
    ONLY_HOST_CAN_UPDATE_ROLE: { status: 403, message: 'Hanya host yang dapat mengubah role peserta' },
    USER_NOT_PARTICIPANT: { status: 404, message: 'User bukan peserta meeting ini' },
    HOST_CANNOT_CHANGE_OWN_ROLE: { status: 400, message: 'Host tidak dapat mengubah role diri sendiri' },
    INVALID_ROLE: { status: 400, message: 'Role tidak valid, gunakan secretary atau participant' },
    UPDATE_ROLE_FAILED: { status: 500, message: 'Gagal mengupdate role peserta' },
    KEYWORD_TOO_SHORT: { status: 400, message: 'Keyword pencarian minimal 2 karakter' },
    WRONG_CURRENT_PASSWORD: { status: 400, message: 'Password saat ini tidak benar' },
    NO_API_KEY_CONFIGURED: { status: 500, message: 'Konfigurasi API key belum tersedia' },
    LLM_SERVICE_UNAVAILABLE: { status: 503, message: 'Layanan AI sedang tidak tersedia' },
    INVALID_EMAIL_FORMAT: { status: 400, message: 'Format email tidak valid' },
    PASSWORD_TOO_SHORT: { status: 400, message: 'Password minimal 6 karakter' },
    INVALID_NAME: { status: 400, message: 'Nama tidak boleh kosong' },
    EMAIL_ALREADY_EXISTS: { status: 409, message: 'Email sudah terdaftar' },
    INVALID_WHATSAPP_PHONE: { status: 400, message: 'Nomor WhatsApp tidak valid' },
    WHATSAPP_PHONE_ALREADY_EXISTS: { status: 409, message: 'Nomor WhatsApp sudah terdaftar di profil ini' },
    WHATSAPP_PHONE_NOT_SET: { status: 404, message: 'Nomor WhatsApp belum diatur' },
    INVALID_TITLE: { status: 400, message: 'Title tidak boleh kosong' },
    INVALID_DATETIME_FORMAT: { status: 400, message: 'Format datetime tidak valid' },
    INVALID_PARTICIPANT_IDS: { status: 400, message: 'participant_ids harus berupa array' },
    DESCRIPTION_REQUIRED: { status: 400, message: 'Deskripsi action item tidak boleh kosong' },
    INVALID_DATE_FORMAT: { status: 400, message: 'Format tanggal tidak valid' },
    DUE_DATE_IN_THE_PAST: { status: 400, message: 'Due date tidak boleh di masa lalu' },
    INVALID_STATUS_FILTER: { status: 400, message: 'Status filter tidak valid, gunakan open, done, atau carried_over' },
    ACTION_ITEM_NOT_FOUND: { status: 404, message: 'Action item tidak ditemukan' },
    INVALID_ACTION_ITEM_STATUS: { status: 400, message: 'Status tidak valid, gunakan open, done, atau carried_over' },
    ONLY_HOST_SECRETARY_CAN_CREATE_ACTION_ITEM: { status: 403, message: 'Hanya host dan secretary yang dapat membuat action item' },
    ONLY_HOST_SECRETARY_CAN_DELETE_ACTION_ITEM: { status: 403, message: 'Hanya host dan secretary yang dapat menghapus action item' },
    ONLY_HOST_SECRETARY_OR_ASSIGNEE_CAN_UPDATE: { status: 403, message: 'Hanya host, secretary, atau assignee yang dapat mengubah action item' },
    ASSIGNEE_MUST_BE_PARTICIPANT: { status: 400, message: 'Assignee harus merupakan peserta meeting' },
    ASSIGNEE_CANNOT_EDIT_ACTION_ITEM_FIELDS: { status: 403, message: 'Assignee hanya dapat mengubah status menjadi done' },
    ASSIGNEE_CAN_ONLY_MARK_DONE: { status: 403, message: 'Assignee hanya dapat menandai action item sebagai done' },
    ACTION_ITEM_CANNOT_BE_UPDATED: { status: 400, message: 'Action item yang sudah carried over tidak dapat diubah' },
    INVALID_MEETING_ID: { status: 400, message: 'ID meeting tidak valid' },
    'Meeting tidak ditemukan': { status: 404, message: 'Meeting tidak ditemukan' },
    'Kamu tidak memiliki akses ke meeting ini': { status: 403, message: 'Kamu tidak memiliki akses ke meeting ini' },
    'Email tidak ditemukan': { status: 401, message: 'Email tidak ditemukan' },
    'Email atau password salah': { status: 401, message: 'Email atau password salah' },
    'Hanya host dan secretary yang dapat membuat notulen': { status: 403, message: 'Hanya host dan secretary yang dapat membuat notulen' },
    'Hanya host dan secretary yang dapat mengedit notulen': { status: 403, message: 'Hanya host dan secretary yang dapat mengedit notulen' },
    'Notulen sudah ada, gunakan endpoint edit': { status: 409, message: 'Notulen sudah ada, gunakan endpoint edit' },
    'Notulen belum dibuat': { status: 404, message: 'Notulen belum dibuat' },
    'Meeting ini tidak memiliki meeting sebelumnya': { status: 404, message: 'Meeting ini tidak memiliki meeting sebelumnya' },
    'Kamu tidak memiliki akses ke meeting sebelumnya': { status: 403, message: 'Kamu tidak memiliki akses ke meeting sebelumnya' },
    'Nomor WhatsApp penerima tidak valid': { status: 400, message: 'Nomor WhatsApp penerima tidak valid' },
    'FROM_EMAIL tidak dikonfigurasi di .env': { status: 500, message: 'Konfigurasi email belum tersedia' },
};

module.exports = (err, req, res, next) => {
    // Handle dynamic SCHEDULE_CONFLICT_USERS error
    const errorMessage = typeof err?.message === 'string' ? err.message : '';
    if (errorMessage.startsWith('SCHEDULE_CONFLICT_USERS_')) {
        const userIds = errorMessage
            .slice('SCHEDULE_CONFLICT_USERS_'.length)
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((userId) => userId.trim())
            .filter(Boolean);

        return res.status(409).json({
            message: `Terdapat jadwal meeting yang bentrok untuk: ${userIds}`,
            conflict_user_ids: userIds,
        });
    }

    const mapped = ERROR_MAP[errorMessage]
    if (mapped) {
        return res.status(mapped.status).json({ message: mapped.message });
    }

    if (Number.isInteger(err?.status) && errorMessage) {
        return res.status(err.status).json({ message: errorMessage });
    }

    console.error(err?.stack || err);
    res.status(500).json({ message: 'Internal Server Error' });
}