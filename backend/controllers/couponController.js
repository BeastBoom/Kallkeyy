const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');
const { setCorsHeaders } = require('../utils/responseHelper');
const connectDB = require('../config/db');
const { validateAndCalculateDiscount } = require('../utils/couponValidator');

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

    // Use shared coupon validator
    const { couponData, discountAmount } = await validateAndCalculateDiscount(code, cartTotal, userId);

    if (!couponData) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    const finalAmount = Math.max(0, cartTotal - discountAmount);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      coupon: {
        code: couponData.code,
        name: couponData.name,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        discountAmount: discountAmount,
        cartTotal: cartTotal,
        finalAmount: finalAmount
      }
    });

  } catch (error) {
    // Handle validation errors from shared validator (they throw { status, message })
    if (error.status) {
      setCorsHeaders(req, res);
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    console.error('Coupon validation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon code'
    });
  }
};

// Get available coupons for user
exports.getAvailableCoupons = async (req, res) => {
  try {
    await connectDB();

    const { cartTotal } = req.query;
    const userId = req.user._id;

    // Get all general purpose active coupons
    const allCoupons = await Coupon.find({
      isActive: true,
      isGeneralPurpose: true
    });

    const availableCoupons = [];

    for (const coupon of allCoupons) {
      let isApplicable = true;
      let reason = '';

      // Check if coupon is expired
      if (coupon.validUntil && new Date() > coupon.validUntil) {
        continue;
      }

      // Check if coupon is valid yet
      if (coupon.validFrom && new Date() < coupon.validFrom) {
        continue;
      }

      // Check usage limit
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        continue;
      }

      // Check minimum purchase amount if cart total is provided
      if (cartTotal && cartTotal < coupon.minPurchaseAmount) {
        isApplicable = false;
        reason = `Min. purchase ₹${coupon.minPurchaseAmount}`;
      }

      // Check first-time purchase rule
      if (coupon.rules.firstTimePurchaseOnly && isApplicable) {
        const existingOrders = await Order.countDocuments({
          userId: userId,
          paymentStatus: 'completed'
        });

        if (existingOrders > 0) {
          isApplicable = false;
          reason = 'First-time purchase only';
        }
      }

      // Check once per account rule
      if (coupon.rules.oncePerAccount && isApplicable) {
        const hasUsedCoupon = coupon.usedBy.some(
          usage => usage.userId.toString() === userId.toString()
        );

        if (hasUsedCoupon) {
          isApplicable = false;
          reason = 'Already used';
        }
      }

      // Only add if applicable or if reason exists (to show why it's not applicable)
      if (isApplicable) {
        availableCoupons.push({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchaseAmount: coupon.minPurchaseAmount,
          maxDiscountAmount: coupon.maxDiscountAmount,
          isApplicable: true,
          reason: null
        });
      }
    }

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      coupons: availableCoupons
    });

  } catch (error) {
    console.error('Get available coupons error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available coupons'
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

