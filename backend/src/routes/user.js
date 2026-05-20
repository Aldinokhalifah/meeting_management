const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/search', userController.searchUsers);
router.patch('/profile', userController.updateProfile);
router.post('/profile/whatsapp', userController.setWhatsappPhone);
router.patch('/profile/whatsapp', userController.updateWhatsappPhone);
router.delete('/profile/whatsapp', userController.deleteWhatsappPhone);
router.patch('/password', userController.updatePassword);

module.exports = router;