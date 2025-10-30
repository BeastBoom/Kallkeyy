const nodemailer = require('nodemailer');

// Configure email service - PROPER CONFIGURATION FOR GMAIL
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",  // Use hostname, not IP
  port: 465,
  secure: true, // false for port 587, true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: true // Keep security enabled
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('✓ Email server is ready to send messages');
  }
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `KALLKEYY <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code - KALLKEYY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your KALLKEYY account.</p>
          <p>Your verification code is:</p>
          <h1 style="background-color: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
            ${code}
          </h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} KALLKEYY. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Email sending error:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
};
