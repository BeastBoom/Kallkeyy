const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { setCorsHeaders } = require('../utils/responseHelper');
const { recordCouponUsage } = require('./couponController');
const connectDB = require('../config/db');

// Shared utilities (previously duplicated inline)
const { isDevelopment, logCritical, retryOperation } = require('../utils/helpers');
const { validateAndCalculateDiscount } = require('../utils/couponValidator');
const { validateStockAvailability, deductStock } = require('../utils/stockManager');
const { createShiprocketOrder, createShiprocketOrderWithRetry } = require('../utils/shiprocketHelper');
const { getRazorpay, verifyPaymentWithRazorpay } = require('../utils/razorpayHelper');

// verifyPaymentWithRazorpay is now imported from utils/razorpayHelper.js

// Create COD Token Order (₹100) - Only creates Razorpay order, doesn't create database order yet
exports.createCODTokenOrder = async (req, res) => {
  try {
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
        setCorsHeaders(req, res);
        return res.status(couponError.status || 400).json({
          success: false,
          message: couponError.message || 'Failed to validate coupon code'
        });
      }
    }

    // Calculate final amount after discount
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    // COD Token Amount (₹100)
    const COD_TOKEN_AMOUNT = 100;

    // Generate unique receipt ID for COD token payment
    const receiptId = `COD_TOKEN_${Date.now()}_${userId.toString().slice(-6)}`;

    // Create Razorpay order for COD token payment
    const options = {
      amount: Math.round(COD_TOKEN_AMOUNT * 100),
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: userId.toString(),
        orderDate: new Date().toISOString(),
        cartSnapshot: JSON.stringify({
          items: cart.items,
          totalPrice: baseAmount
        }),
        shippingAddress: JSON.stringify(shippingAddress),
        coupon: couponData ? JSON.stringify(couponData) : '',
        paymentType: 'cod_token',
        codTokenAmount: COD_TOKEN_AMOUNT,
        finalOrderAmount: finalAmount
      }
    };

    let razorpayOrder;
    try {
      const razorpay = getRazorpay();
      razorpayOrder = await retryOperation(
        () => razorpay.orders.create(options),
        3,
        1000
      );
    } catch (razorpayError) {
      logCritical('Razorpay COD token order creation failed', razorpayError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to create COD token payment order. Please try again.',
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      });
    }

    const responseData = {
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      key: process.env.RAZORPAY_KEY_ID
    };

    if (process.env.RAZORPAY_PAYMENT_CONFIG_ID) {
      responseData.checkout_config_id = process.env.RAZORPAY_PAYMENT_CONFIG_ID;
    }

    setCorsHeaders(req, res);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('COD token order creation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD token order',
      error: error.message
    });
  }
};

// Verify COD Token Payment and Create Actual COD Order
exports.verifyCODTokenPayment = async (req, res) => {
  try {
    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_SECRET) {
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error. Please contact support.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      couponCode
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address'
      });
    }

    // STEP 1: Verify signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    let signatureMatch = false;
    if (razorpay_signature.length === expectedSign.length) {
      try {
        signatureMatch = require('crypto').timingSafeEqual(
          Buffer.from(razorpay_signature),
          Buffer.from(expectedSign)
        );
      } catch (err) {
        signatureMatch = false;
      }
    }

    if (!signatureMatch) {
      console.error('❌ COD token payment signature verification failed');
      
      const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (existingOrder) {
        await Order.findByIdAndUpdate(existingOrder._id, {
          paymentStatus: 'failed',
          status: 'failed'
        }).catch(err => console.error('Failed to update order status:', err));
      }

      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'COD token payment verification failed. Signature mismatch.'
      });
    }

    // STEP 2: Verify with Razorpay API
    const razorpayVerification = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
    if (!razorpayVerification.verified) {
      console.error(`❌ Razorpay API verification failed: ${razorpayVerification.error}`);
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: `COD token payment verification failed: ${razorpayVerification.error}. Please contact support.`
      });
    }

    // STEP 3: Get Razorpay order details
    let razorpayOrderDetails;
    let shippingAddressData;
    let itemsToUse;
    let couponDataFromNotes = null;
    let finalOrderAmount;
    let codTokenAmount;
    
    try {
      const razorpay = getRazorpay();
      razorpayOrderDetails = await retryOperation(
        () => razorpay.orders.fetch(razorpay_order_id),
        3,
        1000
      );
    } catch (error) {
      console.error('❌ Failed to fetch Razorpay order details after retries:', error);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve COD token order details. Please contact support with Razorpay Order ID: ' + razorpay_order_id
      });
    }

    // Parse data from Razorpay notes
    const notes = razorpayOrderDetails.notes || {};
    let cartData;

    try {
      cartData = JSON.parse(notes.cartSnapshot || '{}');
      shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
      if (notes.coupon) {
        couponDataFromNotes = JSON.parse(notes.coupon);
      }
      codTokenAmount = parseInt(notes.codTokenAmount || '100');
      finalOrderAmount = parseFloat(notes.finalOrderAmount || '0');
    } catch (parseError) {
      console.error('❌ Failed to parse COD token order data from Razorpay notes:', parseError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve COD order information. Please contact support with Razorpay Order ID: ' + razorpay_order_id
      });
    }

    // Verify user ownership
    if (notes.userId !== req.user._id.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify payment type
    if (notes.paymentType !== 'cod_token') {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type for COD token verification'
      });
    }

    // Get cart items
    let currentCart = await Cart.findOne({ userId: req.user._id });
    itemsToUse = (currentCart && currentCart.items.length > 0) 
      ? currentCart.items 
      : (cartData.items || []);
    
    if (!itemsToUse || itemsToUse.length === 0) {
      console.error('❌ No cart items available during COD token payment verification');
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'No items found for COD order. Please contact support with Razorpay Order ID: ' + razorpay_order_id
      });
    }

    const orderAmount = finalOrderAmount || cartData.totalPrice || 0;

    // CREATE ACTUAL COD ORDER
    try {
      const orderData = {
        userId: req.user._id,
        orderId: `COD_${Date.now()}_${req.user._id.toString().slice(-6)}`,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        items: itemsToUse,
        shippingAddress: shippingAddressData,
        amount: orderAmount,
        currency: razorpayOrderDetails.currency,
        paymentMethod: 'cod_token',
        status: 'confirmed',
        paymentStatus: 'completed',
        cancellationWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: 'system',
          reason: 'COD order created after token payment verification'
        }],
        coupon: couponDataFromNotes || null,
        codTokenPayment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          tokenAmount: codTokenAmount,
          paymentDate: new Date(),
          verified: true
        }
      };

      const order = await Order.create(orderData);

      // Record coupon usage
      if (couponDataFromNotes && couponDataFromNotes.code) {
        recordCouponUsage(couponDataFromNotes.code, req.user._id, order.orderId).catch(err => {
          if (isDevelopment) {
            console.error('Failed to record coupon usage:', err);
          }
        });
      }

      // Deduct stock using shared utility
      try {
        await deductStock(order.items);

        // Clear cart
        await Cart.findOneAndUpdate(
          { userId: req.user._id },
          { items: [], totalItems: 0, totalPrice: 0 },
          { new: true }
        );

        if (isDevelopment) {
          console.log('✅ COD order created and stock deducted successfully');
        }
      } catch (stockError) {
        console.error('❌ Error during stock deduction/cart clearing for COD order');
        logCritical('COD token payment confirmed but order processing failed', stockError);
        
        // Create reconciliation order if needed
        try {
          const reconciliationOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
          if (!reconciliationOrder) {
            await Order.create({
              userId: req.user._id,
              orderId: `recon_${Date.now()}`,
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              items: order?.items || itemsToUse || [],
              shippingAddress: shippingAddressData || {},
              amount: orderAmount,
              currency: razorpayOrderDetails?.currency || 'INR',
              paymentMethod: 'cod',
              status: 'confirmed',
              paymentStatus: 'completed',
              notes: ['⚠️ MANUAL RECONCILIATION REQUIRED - Stock not deducted due to processing error'],
              codTokenPayment: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                tokenAmount: codTokenAmount,
                paymentDate: new Date(),
                verified: true
              }
            });
          }
        } catch (reconError) {
          console.error('❌ Failed to create reconciliation COD order');
        }
      }

      // FIX: Single Shiprocket order creation (previously duplicated twice)
      await createShiprocketOrderWithRetry(order, 'COD Token');

      setCorsHeaders(req, res);
      return res.status(200).json({
        success: true,
        message: 'COD token payment verified successfully. COD order created.',
        order: {
          _id: order._id,
          orderId: order.orderId,
          amount: order.amount,
          paymentMethod: order.paymentMethod,
          status: order.status,
          paymentStatus: order.paymentStatus,
          codTokenPayment: order.codTokenPayment
        }
      });
    } catch (createError) {
      console.error('❌ Failed to create COD order in database:', createError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to create COD order. Please contact support.',
        error: isDevelopment ? createError.message : undefined
      });
    }
  } catch (error) {
    console.error('❌ COD token payment verification error:', error);
    
    // CRITICAL: Check if payment was actually made but verification failed
    const { razorpay_order_id, razorpay_payment_id } = req.body || {};
    
    if (razorpay_order_id && razorpay_payment_id) {
      try {
        const paymentCheck = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
        if (paymentCheck.verified) {
          logCritical('COD token payment confirmed but verification failed. Manual reconciliation required.');
          
          try {
            const razorpay = getRazorpay();
            const razorpayOrderDetails = await razorpay.orders.fetch(razorpay_order_id);
            const notes = razorpayOrderDetails.notes || {};
            
            const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!existingOrder) {
              const cartData = JSON.parse(notes.cartSnapshot || '{}');
              const shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
              
              if (!shippingAddressData.email) {
                const User = require('../models/User');
                const user = await User.findById(req.user._id).select('email');
                shippingAddressData.email = user?.email || 'customer@kallkeyy.com';
              }
              
              const recoveryOrderData = {
                userId: req.user._id,
                orderId: `recon_${Date.now()}`,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: req.body?.razorpay_signature || '',
                items: cartData.items || [],
                shippingAddress: shippingAddressData,
                amount: parseFloat(notes.finalOrderAmount || '0'),
                currency: razorpayOrderDetails.currency,
                paymentMethod: 'cod_token',
                status: 'confirmed',
                paymentStatus: 'completed',
                notes: ['⚠️ Created during error recovery - manual stock verification required'],
                codTokenPayment: {
                  razorpayOrderId: razorpay_order_id,
                  razorpayPaymentId: razorpay_payment_id,
                  tokenAmount: parseInt(notes.codTokenAmount || '100'),
                  paymentDate: new Date(),
                  verified: true
                }
              };
              
              if (notes.coupon) {
                try { recoveryOrderData.coupon = JSON.parse(notes.coupon); } catch (e) {}
              }
              
              await Order.create(recoveryOrderData);
              
              // Shiprocket for recovery order
              const recoveryOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
              if (recoveryOrder) {
                createShiprocketOrderWithRetry(recoveryOrder, 'COD Token Recovery').catch(() => {});
              }

              setCorsHeaders(req, res);
              return res.status(200).json({
                success: true,
                message: 'COD token payment verified successfully (recovered from error)',
                order: recoveryOrder
              });
            }
          } catch (recoveryError) {
            console.error('❌ Recovery attempt failed');
          }
        }
      } catch (checkError) {
        console.error('❌ Failed to verify COD token payment status during error handling');
      }
    }
    
    logCritical('COD token payment verification failed', error);
    
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'COD token payment verification failed. Please contact support with your Razorpay Payment ID if payment was deducted.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};