const axios = require("axios");
const User = require("../models/User");

// Store OTPs temporarily (in production, consider using Redis)
const otpStore = new Map();

// Rate limiting: Store last OTP send time per phone number
const rateLimitStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via MSG91 WhatsApp
const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const sender = process.env.MSG91_WHATSAPP_SENDER;
    const templateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;

    if (!authKey || !sender || !templateId) {
      throw new Error(
        "MSG91 configuration missing. Please check environment variables."
      );
    }

    // Format phone number (ensure it's 10 digits)
    const formattedPhone = `91${phone}`;

    // MSG91 WhatsApp API endpoint
    const url = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

    // Request payload
    const payload = {
      integrated_number: sender,
      content_type: "template",
      payload: {
        to: formattedPhone,
        type: "template",
        template: {
          name: templateId,
          language: {
            code: "en",
            policy: "deterministic",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
    };

    // Send request to MSG91
    const response = await axios.post(url, payload, {
      headers: {
        "authkey": authKey,
        "Content-Type": "application/json",
      },
    });

    console.log("MSG91 WhatsApp Response:", response.data);

    if (response.data && response.data.type === "error") {
      throw new Error(
        response.data.message || "Failed to send WhatsApp OTP"
      );
    }

    return {
      success: true,
      messageId: response.data.messageId || response.data.id,
    };
  } catch (error) {
    console.error("MSG91 WhatsApp Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to send WhatsApp OTP"
    );
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit phone number is required",
      });
    }

    // Rate limiting: Check if OTP was sent recently (within last 60 seconds)
    const lastSendTime = rateLimitStore.get(phone);
    const currentTime = Date.now();

    if (lastSendTime && currentTime - lastSendTime < 60000) {
      const remainingTime = Math.ceil((60000 - (currentTime - lastSendTime)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingTime} seconds before requesting a new OTP`,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiration
    otpStore.set(phone, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Update rate limit timestamp
    rateLimitStore.set(phone, currentTime);

    // Send WhatsApp OTP via MSG91
    const result = await sendWhatsAppOTP(phone, otp);

    console.log(`WhatsApp OTP sent successfully to: 91${phone}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your WhatsApp",
      expiresIn: 600,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
      error: error.message,
    });
  }
};

// Verify OTP and save phone to user
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Get userId from authenticated user (set by auth middleware)
    const userId = req.userId;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this number. Please request a new one.",
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(phone, storedData);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.`,
      });
    }

    // OTP verified successfully - Update user with phone number
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phone: phone,
        phoneVerified: true,
      },
      { new: true } // Return the updated document
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    otpStore.delete(phone);

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
      error: error.message,
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Clear existing OTP and rate limit for resend
    otpStore.delete(phone);
    rateLimitStore.delete(phone);
    
    return exports.sendOTP(req, res);
  } catch (error) {
    console.error("OTP resend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again.",
    });
  }
};
