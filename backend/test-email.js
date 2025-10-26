// testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: 'beastboom404@gmail.com',
  subject: 'Test Email',
  text: 'Hello from Nodemailer!',
}, (err, info) => {
  if (err) {
    console.error('❌ Error sending test email:', err);
  } else {
    console.log('✅ Test email sent:', info.response);
  }
});