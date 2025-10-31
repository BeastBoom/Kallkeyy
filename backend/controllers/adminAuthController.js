const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { setCorsHeaders } = require('../utils/responseHelper');
const connectDB = require('../config/db');

// Generate admin JWT token
const generateAdminToken = (adminId, role) => {
  return jwt.sign(
    { 
      adminId, 
      role,
      isAdmin: true 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// Set admin auth cookie
const setAdminCookie = (res, token) => {
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    await connectDB();

    const { username, password } = req.body;

    if (!username || !password) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!admin) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact a founder.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateAdminToken(admin._id, admin.role);

    // Set cookie
    setAdminCookie(res, token);

    // Update last login and history
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Keep only last 50 login records
    if (admin.loginHistory.length > 50) {
      admin.loginHistory = admin.loginHistory.slice(-50);
    }

    await admin.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin logout
exports.adminLogout = async (req, res) => {
  try {
    await connectDB();

    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  try {
    await connectDB();

    const admin = await Admin.findById(req.adminId).select('-password');

    if (!admin) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new admin (founder/developer only)
exports.createAdmin = async (req, res) => {
  try {
    await connectDB();

    const { username, email, password, fullName, role } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Admin with this username or email already exists'
      });
    }

    // Create admin
    const admin = new Admin({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      role: role || 'admin',
      createdBy: req.adminId
    });

    await admin.save();

    setCorsHeaders(req, res);
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin'
    });
  }
};

// List all admins (founder/developer only)
exports.listAdmins = async (req, res) => {
  try {
    await connectDB();

    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('List admins error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
};

// Deactivate admin (founder only)
exports.deactivateAdmin = async (req, res) => {
  try {
    await connectDB();

    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deactivating founders
    if (admin.role === 'founder') {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate a founder account'
      });
    }

    admin.isActive = false;
    await admin.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate admin'
    });
  }
};

// Verify cookie token
exports.verifyAdminCookie = async (req, res) => {
  try {
    await connectDB();

    const token = req.cookies.admin_token;

    if (!token) {
      setCorsHeaders(req, res);
      return res.status(401).json({
        success: false,
        message: 'No authentication cookie found'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin) {
      res.clearCookie('admin_token');
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isActive) {
      res.clearCookie('admin_token');
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    setCorsHeaders(req, res);
    res.json({
      success: true,
      token,
      admin
    });
  } catch (error) {
    res.clearCookie('admin_token');
    
    setCorsHeaders(req, res);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication'
    });
  }
};

