const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter')
const authMiddleware = require('../middleware/auth');
// const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter')

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware , authController.getMe);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', forgotPasswordLimiter, passwordResetController.forgotPassword);
router.post('/reset-password/validate', passwordResetController.validateResetToken);
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;