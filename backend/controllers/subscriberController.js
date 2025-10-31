const Subscriber = require('../models/Subscriber.js');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { setCorsHeaders } = require('../utils/responseHelper');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      setCorsHeaders(req, res);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again in a moment.',
      });
    }

    // Check for validation errors
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

    // Check if subscriber already exists (email field is indexed and lowercase in schema)
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
