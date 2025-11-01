const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');
const { setCorsHeaders } = require('../utils/responseHelper');
const connectDB = require('../config/db');

// Validate and apply coupon code
exports.validateCoupon = async (req, res) => {
  try {
    await connectDB();

    const { code, cartTotal } = req.body;
    const userId = req.user._id;

    if (!code || !code.trim()) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    if (!cartTotal || cartTotal <= 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid cart total'
      });
    }

    // Find coupon by code (case-insensitive, uppercase)
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (!coupon) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is expired
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check if coupon is valid yet
    if (coupon.validFrom && new Date() < coupon.validFrom) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'This coupon is not yet valid'
      });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} is required for this coupon`
      });
    }

    // Check first-time purchase rule
    if (coupon.rules.firstTimePurchaseOnly) {
      const existingOrders = await Order.countDocuments({
        userId: userId,
        paymentStatus: 'completed'
      });

      if (existingOrders > 0) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'This coupon is valid only for first-time purchases'
        });
      }
    }

    // Check once per account rule
    if (coupon.rules.oncePerAccount) {
      const hasUsedCoupon = coupon.usedBy.some(
        usage => usage.userId.toString() === userId.toString()
      );

      if (hasUsedCoupon) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'You have already used this coupon'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
      // Don't allow discount more than cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    const finalAmount = Math.max(0, cartTotal - discountAmount);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        cartTotal: cartTotal,
        finalAmount: finalAmount
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon code'
    });
  }
};

// Record coupon usage (called after successful payment)
exports.recordCouponUsage = async (couponCode, userId, orderId) => {
  try {
    await connectDB();

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });

    if (!coupon) {
      return { success: false, error: 'Coupon not found' };
    }

    // Update usage count
    coupon.usedCount = (coupon.usedCount || 0) + 1;

    // Add to usedBy array
    coupon.usedBy.push({
      userId: userId,
      usedAt: new Date()
    });

    await coupon.save();

    return { success: true };
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    return { success: false, error: error.message };
  }
};

