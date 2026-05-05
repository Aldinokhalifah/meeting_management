const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/search', userController.searchUsers);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);

module.exports = router;