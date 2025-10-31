const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDB = require('../config/db');

// Helper to set CORS headers (reuse from server.js pattern)
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    // Check against common allowed origins
    const allowedPatterns = [
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
      /^https:\/\/.*\.kallkeyy\.com$/,
      /^http:\/\/localhost:\d+$/
    ];
    const allowedOrigins = [
      'https://kallkeyy.com',
      'https://www.kallkeyy.com',
      'https://kallkeyy.vercel.app',
      'https://kallkeyy-admin.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin) || allowedPatterns.some(p => p.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
  }
}

const auth = async (req, res, next) => {
  try {
    await connectDB();
    
    // Get token from header OR cookie (cookie has priority for seamless UX)
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, check for cookie
    if (!token && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    
    if (!token) {
      setCorsHeaders(req, res);
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      setCorsHeaders(req, res);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach both for compatibility
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Clear invalid cookie if it exists
    if (req.cookies.auth_token) {
      res.clearCookie('auth_token');
    }
    
    setCorsHeaders(req, res);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
