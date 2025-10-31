const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
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

// Middleware to verify admin authentication
const adminAuth = async (req, res, next) => {
  try {
    await connectDB();
    
    // Get token from header OR cookie
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check cookie as fallback
    if (!token && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    
    if (!token) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (!decoded.isAdmin) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Fetch admin from database
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Admin not found. Please login again.'
      });
    }

    if (!admin.isActive) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Your admin account has been deactivated.'
      });
    }

    // Attach admin to request
    req.admin = admin;
    req.adminId = admin._id;
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    // Clear invalid cookie
    if (req.cookies.admin_token) {
      res.clearCookie('admin_token');
    }
    
    setCorsHeaders(req, res);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

// Middleware to check specific admin roles
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = { adminAuth, checkRole };

