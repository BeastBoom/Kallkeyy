const Order = require('../models/Order');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const { setCorsHeaders } = require('../utils/responseHelper');
const { recordCouponUsage } = require('./couponController');
const connectDB = require('../config/db');

// Shared utilities (previously duplicated inline)
const { isDevelopment, logCritical, retryOperation } = require('../utils/helpers');
const { validateAndCalculateDiscount } = require('../utils/couponValidator');
const { validateStockAvailability, deductStock } = require('../utils/stockManager');
const { createShiprocketOrderWithRetry } = require('../utils/shiprocketHelper');

// Create COD Order
exports.createCODOrder = async (req, res) => {
  try {
    // Ensure database connection
    try {
      await connectDB();
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please try again.'
      });
    }

    const userId = req.user._id;
    const { shippingAddress, couponCode } = req.body;

    // Get user email if not in shipping address
    let userEmail = shippingAddress?.email;
    if (!userEmail && req.user) {
      try {
        const User = require('../models/User');
        const user = await User.findById(userId).select('email');
        userEmail = user?.email;
      } catch (userError) {
        if (isDevelopment) {
          console.error('Failed to fetch user email:', userError);
        }
      }
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address'
      });
    }

    // Get cart items
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // CRITICAL: Validate stock availability using shared utility
    const unavailableItems = await validateStockAvailability(cart.items);

    if (unavailableItems.length > 0) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available',
        unavailableItems
      });
    }

    // Calculate base total amount
    let baseAmount = cart.totalPrice;
    let discountAmount = 0;
    let couponData = null;

    // Validate and apply coupon using shared validator
    if (couponCode && couponCode.trim()) {
      try {
        const result = await validateAndCalculateDiscount(couponCode, baseAmount, userId);
        couponData = result.couponData;
        discountAmount = result.discountAmount;
      } catch (couponError) {
        // Handle validation errors from shared validator
        setCorsHeaders(req, res);
        return res.status(couponError.status || 400).json({
          success: false,
          message: couponError.message || 'Failed to validate coupon code'
        });
      }
    }

    // Calculate final amount after discount
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    try {
      // Generate unique order ID
      const receiptId = `COD_${Date.now()}_${userId.toString().slice(-6)}`;

      // Ensure shipping address has email (required for Shiprocket)
      const completeShippingAddress = {
        ...shippingAddress,
        email: shippingAddress.email || userEmail || 'customer@kallkeyy.com'
      };

      // Create order data
      const orderData = {
        userId: req.user._id,
        orderId: receiptId,
        items: cart.items,
        shippingAddress: completeShippingAddress,
        amount: finalAmount,
        currency: 'INR',
        paymentMethod: 'cod',
        status: 'confirmed',
        paymentStatus: 'pending',
        cancellationWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: 'system',
          reason: 'COD order created'
        }],
        coupon: couponData || null
      };

      // Create order
      let order;
      try {
        order = await Order.create(orderData);
      } catch (createError) {
        console.error('❌ Failed to create order in database:', createError);
        throw createError;
      }

      // Deduct stock using shared utility
      await deductStock(cart.items);

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 },
        { new: true }
      );

      if (isDevelopment) {
        console.log('✅ COD order created successfully');
      }

      // Record coupon usage if applicable
      if (couponData && couponData.code) {
        recordCouponUsage(couponData.code, req.user._id, order.orderId).catch(err => {
          if (isDevelopment) {
            console.error('Failed to record coupon usage for COD order:', err);
          }
        });
      }

      // Create Shiprocket order using shared utility (non-blocking)
      try {
        if (order && order._id) {
          setImmediate(async () => {
            try {
              const freshOrder = await Order.findById(order._id).lean();
              if (freshOrder) {
                await createShiprocketOrderWithRetry(freshOrder, 'COD');
              }
            } catch (err) {
              logCritical(`Shiprocket COD order creation failed for order ${order.orderId}`, err);
            }
          });
        }
      } catch (shiprocketError) {
        if (isDevelopment) {
          console.error('Error setting up Shiprocket order creation:', shiprocketError);
        }
      }

      setCorsHeaders(req, res);
      res.status(200).json({
        success: true,
        message: 'COD order placed successfully',
        order: {
          _id: order._id,
          orderId: order.orderId,
          amount: order.amount,
          paymentMethod: order.paymentMethod,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });

    } catch (error) {
      console.error('❌ COD order creation error:', error);
      setCorsHeaders(req, res);
      res.status(500).json({
        success: false,
        message: 'Failed to create COD order. Please try again.',
        error: isDevelopment ? error.message : undefined,
        ...(isDevelopment && { stack: error.stack })
      });
    }
  } catch (error) {
    console.error('❌ COD order creation error (outer catch):', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD order. Please try again.',
      error: isDevelopment ? error.message : undefined
    });
  }
};
