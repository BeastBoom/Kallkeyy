const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify admin authentication
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header OR cookie
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check cookie as fallback
    if (!token && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Fetch admin from database
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found. Please login again.'
      });
    }

    if (!admin.isActive) {
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = { adminAuth, checkRole };

