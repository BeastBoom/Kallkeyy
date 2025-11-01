const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');
const { validateEmailWithAPI } = require('../utils/emailValidation');
const { validatePassword } = require('../utils/passwordValidation');
const { validateName } = require('../utils/nameValidation');
const { setCorsHeaders } = require('../utils/responseHelper');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '7d' : '24h'; // 7 days if remember me, else 24 hours
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// Set auth cookie
const setAuthCookie = (res, token, rememberMe = false) => {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 24 hours
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  
  res.cookie('auth_token', token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' needed for cross-domain on HTTPS, 'lax' for same-domain or development
    maxAge: maxAge,
    path: '/'
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    
    const { name, email, password } = req.body;

    // Validate name format
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid name format',
        errors: nameValidation.errors,
        field: 'name'
      });
    }




    // ✅ STEP 1: Check if user already exists FIRST (fast database query)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      setCorsHeaders(req, res);
      return res.status(400).json({ 
        success: false,
        message: 'This email is already registered. Please login instead.',
        field: 'email'
      });
    }

    // ✅ STEP 2: Validate password strength (fast local check)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
        field: 'password'
      });
    }

    // ✅ STEP 3: Validate email using Mailboxlayer API (expensive, do LAST)
    const emailValidation = await validateEmailWithAPI(email);
    if (!emailValidation.valid) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
        field: 'email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token (default remember me for registration)
    const token = generateToken(user._id, true);

    // Set HTTP-only cookie
    setAuthCookie(res, token, true);

    setCorsHeaders(req, res);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user registered with Google
    if (!user.password) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'Please login with Google' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token with appropriate expiration
    const token = generateToken(user._id, rememberMe);

    // Set HTTP-only cookie
    setAuthCookie(res, token, rememberMe);

    setCorsHeaders(req, res);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      rememberMe: rememberMe || false
    });
  } catch (error) {
    console.error('Login error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Google OAuth login/signup
exports.googleAuth = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if user exists but doesn't have it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId
      });
      await user.save();
    }

    // Generate token (default remember me for Google login)
    const token = generateToken(user._id, true);

    // Set HTTP-only cookie
    setAuthCookie(res, token, true);

    setCorsHeaders(req, res);
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// Forgot password - Send verification code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Check if user registered with Google
    if (!user.password) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'This account uses Google login. Please use Google to sign in.' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Save code and expiry to database
    user.resetPasswordToken = verificationCode;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      setCorsHeaders(req, res);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    setCorsHeaders(req, res);
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    setCorsHeaders(req, res);
    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setCorsHeaders(req, res);
      return res.status(400).json({ 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Find user
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    setCorsHeaders(req, res);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({ message: 'User not found' });
    }
    setCorsHeaders(req, res);
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user phone number
exports.updatePhone = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    
    const userId = req.userId;
    const { phone } = req.body;

    if (!userId) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found'
      });
    }

    // Validate phone number (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update phone number and mark as verified (since OTP is temporarily disabled)
    user.phone = phone;
    user.phoneVerified = true;
    await user.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Update phone error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to update phone number'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    await connectDB();
    
    // ✅ FIX: Use req.userId instead of req.user._id (set by auth middleware)
    const userId = req.userId;
    
    if (!userId) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// Logout - Clear cookie
exports.logout = async (req, res) => {
  try {
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    
    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    setCorsHeaders(req, res);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

// Verify cookie token
exports.verifyCookie = async (req, res) => {
  try {
    const connectDB = require('../config/db');
    
    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error('❌ Database connection failed in verifyCookie:', dbError.message);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: (process.env.VERCEL || process.env.NODE_ENV === 'development') ? dbError.message : undefined
      });
    }

    // Check if cookies object exists
    if (!req.cookies) {
      console.log('⚠️ Cookies object not available - cookie-parser may not be initialized');
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'No authentication cookie found'
      });
    }

    const token = req.cookies.auth_token;

    if (!token) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'No authentication cookie found'
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
      // Clear invalid cookie
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      });
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    setCorsHeaders(req, res);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Verify cookie error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    // Clear invalid cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });
    
    setCorsHeaders(req, res);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: (process.env.VERCEL || process.env.NODE_ENV === 'development') ? error.message : undefined
    });
  }
};
