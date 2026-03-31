const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { setCorsHeaders } = require('../utils/responseHelper');
const { recordCouponUsage } = require('./couponController');
const connectDB = require('../config/db');

// Shared utilities
const { isDevelopment, logCritical, retryOperation } = require('../utils/helpers');
const { validateAndCalculateDiscount } = require('../utils/couponValidator');
const { validateStockAvailability, deductStock } = require('../utils/stockManager');
const { createShiprocketOrderWithRetry, getShiprocketToken } = require('../utils/shiprocketHelper');
const { getRazorpay, verifyPaymentWithRazorpay } = require('../utils/razorpayHelper');

// Shared Razorpay instance
const razorpay = getRazorpay();

exports.createOrder = async (req, res) => {
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

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error. Please contact support.'
      });
    }

    const userId = req.user._id;
    const { shippingAddress, couponCode } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address'
      });
    }

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

    const finalAmount = Math.max(1, baseAmount - discountAmount); // Minimum 1 INR

    if (finalAmount < 1) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount after discount'
      });
    }

    const receiptId = `order_${Date.now()}_${userId.toString().slice(-6)}`;

    const options = {
      amount: Math.round(finalAmount * 100),
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
        coupon: couponData ? JSON.stringify(couponData) : ''
      }
    };

    let razorpayOrder;
    try {
      razorpayOrder = await retryOperation(
        () => razorpay.orders.create(options),
        3,
        1000
      );
    } catch (razorpayError) {
      logCritical('Razorpay order creation failed', razorpayError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order. Please try again.',
        error: isDevelopment ? razorpayError.message : undefined
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
    console.error('Order creation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// verifyPaymentWithRazorpay is now imported from utils/razorpayHelper.js

exports.verifyPayment = async (req, res) => {
  try {
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
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    let signatureMatch = false;
    if (razorpay_signature.length === expectedSign.length) {
      try {
        signatureMatch = crypto.timingSafeEqual(
          Buffer.from(razorpay_signature),
          Buffer.from(expectedSign)
        );
      } catch (err) {
        signatureMatch = false;
      }
    }

    if (!signatureMatch) {
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
        message: 'Payment verification failed. Signature mismatch.'
      });
    }

    const razorpayVerification = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
    
    if (!razorpayVerification.verified) {
      console.error(`❌ Razorpay API verification failed: ${razorpayVerification.error}`);
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: `Payment verification failed: ${razorpayVerification.error}. Please contact support.`
      });
    }

    let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order) {
      if (order.userId.toString() !== req.user._id.toString()) {
        setCorsHeaders(req, res);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      if (order.paymentStatus === 'completed') {
        setCorsHeaders(req, res);
        return res.status(200).json({
          success: true,
          message: 'Payment already verified',
          order
        });
      }

      order = await Order.findByIdAndUpdate(
        order._id,
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: 'completed',
          status: 'confirmed'
        },
        { new: true }
      );
    } else {
      let razorpayOrderDetails;
      let shippingAddressData;
      let itemsToUse;
      let paidAmount;
      
      try {
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
          message: 'Failed to retrieve order details. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      const notes = razorpayOrderDetails.notes || {};
      let cartData;
      let couponDataFromNotes = null;

      try {
        cartData = JSON.parse(notes.cartSnapshot || '{}');
        shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
        if (notes.coupon) {
          couponDataFromNotes = JSON.parse(notes.coupon);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse order data from Razorpay notes:', parseError);
        setCorsHeaders(req, res);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve order information. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      if (notes.userId !== req.user._id.toString()) {
        setCorsHeaders(req, res);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      let currentCart = await Cart.findOne({ userId: req.user._id });
      
      itemsToUse = (currentCart && currentCart.items.length > 0) 
        ? currentCart.items 
        : (cartData.items || []);
      
      if (!itemsToUse || itemsToUse.length === 0) {
        console.error('❌ No cart items available during payment verification');
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'No items found for order. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      paidAmount = razorpayOrderDetails.amount / 100;

      try {
        const orderData = {
          userId: req.user._id,
          orderId: razorpayOrderDetails.receipt || `order_${Date.now()}_${req.user._id.toString().slice(-6)}`,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          items: itemsToUse,
          shippingAddress: shippingAddressData,
          amount: paidAmount,
          currency: razorpayOrderDetails.currency,
          paymentMethod: 'razorpay',
          status: 'confirmed',
          paymentStatus: 'completed',
          cancellationWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          statusHistory: [{
            status: 'confirmed',
            timestamp: new Date(),
            updatedBy: 'system',
            reason: 'Order confirmed after payment verification'
          }],
          coupon: couponDataFromNotes || null
        };

        order = await Order.create(orderData);

        if (couponDataFromNotes && couponDataFromNotes.code) {
          recordCouponUsage(couponDataFromNotes.code, req.user._id, order.orderId).catch(err => {
            if (isDevelopment) {
              console.error('Failed to record coupon usage:', err);
            }
          });
        }
        
      } catch (createError) {
        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (existingOrder && existingOrder.paymentStatus === 'completed') {
          setCorsHeaders(req, res);
          return res.status(200).json({
            success: true,
            message: 'Payment already verified',
            order: existingOrder
          });
        }
        
        console.error('❌ Failed to create order in database:', createError);
        setCorsHeaders(req, res);
        return res.status(500).json({
          success: false,
          message: 'Failed to create order. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }
    }

    // Deduct stock and clear cart using shared utility
    try {
      await deductStock(order.items);

      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 }
      );
      
    } catch (stockError) {
      logCritical('Payment confirmed but order processing (stock deduction/cart) failed', stockError);
      
      try {
        const reconciliationOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!reconciliationOrder) {
          let reconRazorpayOrderDetails = await razorpay.orders.fetch(razorpay_order_id);
          const notes = reconRazorpayOrderDetails.notes || {};
          
          let shippingAddressData = {};
          try {
            shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
            if (!shippingAddressData.email) {
              const User = require('../models/User');
              const user = await User.findById(req.user._id).select('email');
              shippingAddressData.email = user?.email || 'customer@kallkeyy.com';
            }
          } catch(e) {}
          
          await Order.create({
            userId: req.user._id,
            orderId: reconRazorpayOrderDetails?.receipt || `recon_${Date.now()}`,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            items: order?.items || [],
            shippingAddress: shippingAddressData,
            amount: (reconRazorpayOrderDetails?.amount / 100) || 0,
            currency: reconRazorpayOrderDetails?.currency || 'INR',
            paymentMethod: 'razorpay',
            status: 'confirmed',
            paymentStatus: 'completed',
            notes: ['⚠️ MANUAL RECONCILIATION REQUIRED - Stock not deducted due to processing error']
          });
        }
      } catch (reconError) {
        console.error('❌ Failed to create reconciliation order');
      }
    }

    // Create Shiprocket order using shared utility
    await createShiprocketOrderWithRetry(order, 'razorpay');

    setCorsHeaders(req, res);
    return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order
    });
      
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    // CRITICAL: Check if payment was actually made but verification failed
    const { razorpay_order_id, razorpay_payment_id } = req.body || {};
    
    if (razorpay_order_id && razorpay_payment_id) {
      try {
        const paymentCheck = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
        if (paymentCheck.verified) {
          logCritical('Payment confirmed but verification failed. Manual reconciliation required.');
          
          try {
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
                orderId: razorpayOrderDetails.receipt || `recon_${Date.now()}`,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: req.body?.razorpay_signature || '',
                items: cartData.items || [],
                shippingAddress: shippingAddressData,
                amount: razorpayOrderDetails.amount / 100,
                currency: razorpayOrderDetails.currency,
                paymentMethod: 'razorpay',
                status: 'confirmed',
                paymentStatus: 'completed',
                notes: ['⚠️ Created during error recovery - manual stock verification required']
              };
              
              if (notes.coupon) {
                try { recoveryOrderData.coupon = JSON.parse(notes.coupon); } catch (e) {}
              }
              
              const recoveryOrder = await Order.create(recoveryOrderData);
              
              createShiprocketOrderWithRetry(recoveryOrder, 'razorpay_recovery').catch(() => {});

              setCorsHeaders(req, res);
              return res.status(200).json({
                success: true,
                message: 'Payment verified successfully (recovered from error)',
                order: recoveryOrder
              });
            }
          } catch (recoveryError) {
            console.error('❌ Recovery attempt failed');
          }
        }
      } catch (checkError) {
        console.error('❌ Failed to verify payment status during error handling');
      }
    }
    
    logCritical('Payment verification failed', error);
    
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support with your Razorpay Payment ID if payment was deducted.',
      error: isDevelopment ? error.message : undefined
    });
  }
};

exports.webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.log('⚠️  Razorpay webhook secret not configured. Webhook disabled for security.');
      setCorsHeaders(req, res);
      return res.status(200).json({ success: true, message: 'Webhook disabled - secret not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Missing signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Webhook signature verification failed');
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (!payload) {
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    if (event === 'payment.captured') {
      const order = await Order.findOneAndUpdate(
        { razorpayPaymentId: payload.id },
        { paymentStatus: 'completed', status: 'confirmed' },
        { new: true }
      );
      if (order) console.log(`✅ Order ${order.orderId} updated via webhook`);
    } else if (event === 'payment.failed') {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payload.order_id },
        { paymentStatus: 'failed', status: 'failed' },
        { new: true }
      );
      if (order) console.log(`❌ Order ${order.orderId} failed via webhook`);
    }

    setCorsHeaders(req, res);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ success: false, error: error.message });
  }
};

// getUserOrders has been removed — use orderController.getUserOrders at /api/orders instead.

// Get order tracking details from Shiprocket
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user._id.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // If Shiprocket is not enabled or no shipment ID, return basic order info
    if (!order.shiprocketShipmentId) {
      setCorsHeaders(req, res);
      return res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingAvailable: false
        }
      });
    }

    // Fetch tracking from Shiprocket
    try {
      const token = await getShiprocketToken();
      
      const trackingResponse = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocketShipmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setCorsHeaders(req, res);
      res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingAvailable: true,
          tracking: trackingResponse.data
        }
      });
    } catch (trackingError) {
      // If tracking fetch fails, return order without tracking
      console.error('Failed to fetch Shiprocket tracking:', trackingError.message);
      
      setCorsHeaders(req, res);
      res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          awbCode: order.awbCode,
          courierName: order.courierName,
          trackingUrl: order.trackingUrl,
          trackingAvailable: false,
          trackingError: 'Unable to fetch live tracking'
        }
      });
    }
  } catch (error) {
    console.error('Get order tracking error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking',
      error: error.message
    });
  }
};

// Shiprocket webhook handler
exports.shiprocketWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Find order by Shiprocket order ID
    const order = await Order.findOne({ 
      shiprocketOrderId: webhookData.order_id 
    });

    if (!order) {
      setCorsHeaders(req, res);
      return res.status(200).json({ success: true, message: 'Order not found' });
    }

    console.log(`✅ Found order: ${order.orderId} (Current Status: ${order.status})`);
    console.log(`   Shiprocket Status: ${webhookData.current_status}`);

    // Update order based on webhook event
    const updates = {};

    switch (webhookData.current_status) {
      case 'PICKUP SCHEDULED':
      case 'PICKUP QUEUED':
        updates.status = 'processing';
        break;
      
      case 'SHIPPED':
      case 'IN TRANSIT':
      case 'OUT FOR DELIVERY':
        updates.status = 'shipped';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
      case 'DELIVERED':
        updates.status = 'delivered';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
      case 'CANCELED':
      case 'RTO INITIATED':
      case 'RTO DELIVERED':
        updates.status = 'cancelled';
        break;
    }

    if (webhookData.awb_code) {
      updates.trackingUrl = `https://shiprocket.co/tracking/${webhookData.awb_code}`;
    }

    if (Object.keys(updates).length > 0) {
      await Order.findByIdAndUpdate(order._id, updates);
    }

    setCorsHeaders(req, res);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Shiprocket webhook error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
