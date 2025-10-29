const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
} = require("../controllers/otpController");
const auth = require("../middleware/auth");

// OTP routes - Protected with auth middleware
router.post("/send", auth, sendOTP);
router.post("/verify", auth, verifyOTP);
router.post("/resend", auth, resendOTP);

module.exports = router;
