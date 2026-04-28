const userRepo = require('../repositories/userRepository');

const searchUsers = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) throw new Error('KEYWORD_TOO_SHORT');
    return await userRepo.searchUsers(keyword.trim());
}

module.exports = { searchUsers };