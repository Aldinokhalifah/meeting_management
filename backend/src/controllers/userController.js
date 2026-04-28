const userService = require('../services/userService');

const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter q wajib diisi' });

        const users = await userService.searchUsers(q);
        res.json({ message: 'Berhasil mencari user', data: users });
    } catch (err) {
        next(err);
    }
}

module.exports = { searchUsers }