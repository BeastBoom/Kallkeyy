const twilio = require('twilio');
const User = require('../models/User');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiration
    otpStore.set(phone, {
      otp,
      expiresAt,
      attempts: 0
    });

    // Format phone number for Twilio
    const formattedPhone = `+91${phone}`;

    // Send SMS via Twilio
    await client.messages.create({
      body: `Your KALLKEYY verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`OTP sent to ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600
    });

  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: error.message
    });
  }
};

// Verify OTP and save phone to user
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, userId } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this number. Please request a new one.'
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(phone, storedData);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.`
      });
    }

    // OTP verified successfully - Update user with phone number
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        phone: phone,
        phoneVerified: true
      });
    }

    otpStore.delete(phone);

    // Generate verification token
    const verificationToken = Buffer.from(`${phone}_${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      verificationToken,
      phone
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: error.message
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    otpStore.delete(phone);
    return exports.sendOTP(req, res);
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};
