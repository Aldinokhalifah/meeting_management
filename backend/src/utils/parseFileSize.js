const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const parseFileSize = (file_size) => {
    const size = Number(file_size);
    if (file_size === undefined || file_size === null || file_size === '' || !Number.isInteger(size) || size <= 0) {
        throw new Error('INVALID_FILE_SIZE');
    }
    if (size > MAX_FILE_SIZE) throw new Error('FILE_TOO_LARGE');
    return size;
};

module.exports = parseFileSize