const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');

// OTP routes
router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);

module.exports = router;
