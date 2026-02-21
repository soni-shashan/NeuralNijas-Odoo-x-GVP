const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, resendOTP, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);

// Protected route
router.get('/me', authenticate, getMe);

module.exports = router;
