const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
router.post('/resend-otp', authController.resendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/firebase', authController.firebaseLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyPasswordResetOtp);
router.post('/reset-password', authController.resetPassword);

// Security & Linking (JWT required)
router.get('/2fa/status', authenticateToken, authController.securityStatus);
router.post('/2fa/email/start', authenticateToken, authController.twoFAStartEmail);
router.post('/2fa/sms/start', authenticateToken, authController.twoFAStartSMS);
router.post('/2fa/verify', authenticateToken, authController.twoFAVerify);
router.post('/2fa/disable', authenticateToken, authController.twoFADisable);
router.post('/link/google', authenticateToken, authController.linkGoogle);
router.post('/link/apple', authenticateToken, authController.linkApple);
router.post('/unlink', authenticateToken, authController.unlinkProvider);

module.exports = router;