const Subscriber = require('../models/Subscriber.js');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { setCorsHeaders } = require('../utils/responseHelper');

// Helper to ensure DB connection (waits if connecting, handles gracefully)
const ensureDbConnection = async () => {
  const readyState = mongoose.connection.readyState;
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (readyState === 1) {
    return true; // Already connected
  }
  
  if (readyState === 2) {
    // Connecting - wait for it (up to 3 seconds)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        mongoose.connection.removeListener('connected', onConnected);
        mongoose.connection.removeListener('error', onError);
        reject(new Error('Connection timeout'));
      }, 3000);
      
      const onConnected = () => {
        clearTimeout(timeout);
        mongoose.connection.removeListener('connected', onConnected);
        mongoose.connection.removeListener('error', onError);
        resolve(true);
      };
      
      const onError = (err) => {
        clearTimeout(timeout);
        mongoose.connection.removeListener('connected', onConnected);
        mongoose.connection.removeListener('error', onError);
        reject(err);
      };
      
      mongoose.connection.once('connected', onConnected);
      mongoose.connection.once('error', onError);
    });
  }
  
  // Disconnected - try to connect (server.js middleware should handle this, but just in case)
  if (readyState === 0 || readyState === 3) {
    // Let mongoose handle queued operations - don't block
    return true; // Mongoose will queue operations if not connected
  }
  
  return true;
};

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      setCorsHeaders(req, res);
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Ensure email is properly normalized (lowercase and trimmed)
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (!normalizedEmail) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Ensure DB connection (will wait if connecting, or proceed if mongoose can queue)
    try {
      await ensureDbConnection();
    } catch (error) {
      console.error('DB connection error:', error.message);
      // Continue anyway - mongoose might queue operations
    }

    // Check if subscriber already exists (email field is indexed and lowercase in schema)
    // Mongoose will queue this operation if not connected yet
    const existingSubscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter',
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        setCorsHeaders(req, res);
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated',
          data: existingSubscriber,
        });
      }
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({ email: normalizedEmail });

    setCorsHeaders(req, res);
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: subscriber,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    
    // Handle duplicate key error (unique email constraint)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }

    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all subscribers (for admin use)
// @route   GET /api/subscribers
// @access  Public (should be protected in production)
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .select('-__v');

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/subscribers/:email
// @access  Public
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list',
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
};

module.exports = {
  subscribeNewsletter,
  getAllSubscribers,
  unsubscribe,
};
