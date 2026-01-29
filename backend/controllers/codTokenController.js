const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const mongoose = require('mongoose');
const { setCorsHeaders } = require('../utils/responseHelper');
const { recordCouponUsage } = require('./couponController');
const connectDB = require('../config/db');
const { createShiprocketOrder } = require('./paymentController');

// Helper to check if verbose logging should be enabled (development only)
// Note: VERCEL_ENV can be 'development', 'preview', or 'production'
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';

// Helper to log critical errors that should ALWAYS be logged in production
const logCritical = (message, error = null) => {
  console.error(`🚨 CRITICAL: ${message}`);
  if (error) {
    console.error(`   Error: ${error.message || error}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    if (error.stack && isDevelopment) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
};

// Helper function with retry mechanism
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      if (isDevelopment) {
        console.log(`⚠️  Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Create COD Token Order (₹100) - Only creates Razorpay order, doesn't create database order yet
exports.createCODTokenOrder = async (req, res) => {
  try {
    // Ensure database connection (idempotent - safe to call multiple times)
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
      // Fetch user to get email (in case it wasn't loaded)
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

    // CRITICAL: Validate stock availability before creating order
    const unavailableItems = [];
    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      
      if (!product) {
        unavailableItems.push({
          productName: item.productName,
          size: item.size,
          reason: 'Product no longer available'
        });
        continue;
      }

      const totalStock = product.stock[item.size] || 0;

      if (totalStock < item.quantity) {
        unavailableItems.push({
          productName: item.productName,
          size: item.size,
          requestedQuantity: item.quantity,
          availableQuantity: totalStock,
          reason: totalStock === 0 ? 'Out of stock' : `Only ${totalStock} available`
        });
      }
    }

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

    // Validate and apply coupon if provided
    if (couponCode && couponCode.trim()) {
      try {
        const coupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase().trim(),
          isActive: true
        });

        if (coupon) {
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
          if (baseAmount < coupon.minPurchaseAmount) {
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
          if (coupon.discountType === 'percentage') {
            discountAmount = (baseAmount * coupon.discountValue) / 100;
            // Apply max discount limit if set
            if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            // Fixed discount
            discountAmount = coupon.discountValue;
            // Don't allow discount more than cart total
            if (discountAmount > baseAmount) {
              discountAmount = baseAmount;
            }
          }

          couponData = {
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: discountAmount
          };
        } else {
          setCorsHeaders(req, res);
          return res.status(400).json({
            success: false,
            message: 'Invalid coupon code'
          });
        }
      } catch (couponError) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'Failed to validate coupon code'
        });
      }
    }

    // Calculate final amount after discount
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    // COD Token Amount (₹100)
    const COD_TOKEN_AMOUNT = 100;

    // Validate amount (minimum 1 INR)
    if (COD_TOKEN_AMOUNT < 1) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid COD token amount'
      });
    }

    // Generate unique receipt ID for COD token payment
    const receiptId = `COD_TOKEN_${Date.now()}_${userId.toString().slice(-6)}`;

    // Create Razorpay order for COD token payment (DO NOT create database order yet - only after payment confirmation)
    const options = {
      amount: Math.round(COD_TOKEN_AMOUNT * 100), // Amount in paise (must be integer)
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: userId.toString(),
        orderDate: new Date().toISOString(),
        // Store cart snapshot and shipping address in notes for later order creation
        cartSnapshot: JSON.stringify({
          items: cart.items,
          totalPrice: baseAmount
        }),
        shippingAddress: JSON.stringify(shippingAddress),
        coupon: couponData ? JSON.stringify(couponData) : '',
        // Mark this as COD token payment
        paymentType: 'cod_token',
        codTokenAmount: COD_TOKEN_AMOUNT,
        finalOrderAmount: finalAmount
      }
    };

    // Note: Payment configuration ID (config_id) should be passed on the frontend
    // when initializing Razorpay checkout, not in the order creation payload
    // The frontend CheckoutPage.tsx handles this via VITE_RAZORPAY_PAYMENT_CONFIG_ID

    let razorpayOrder;
    try {
      const Razorpay = require('razorpay');
      razorpayOrder = await retryOperation(
        () => new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        }).orders.create(options),
        3,
        1000
      );
    } catch (razorpayError) {
      logCritical('Razorpay COD token order creation failed', razorpayError);
      console.error('   COD Token Amount:', COD_TOKEN_AMOUNT);
      console.error('   User ID:', req.user._id);
      
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to create COD token payment order. Please try again.',
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      });
    }

    // Return Razorpay order details - NO database order created yet
    // Database order will be created only after payment is verified
    // Include payment configuration ID if set (for frontend to use in checkout)
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

    // Add payment config ID if set in backend env (so frontend can use it)
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

    // STEP 1: Verify signature (CRITICAL SECURITY CHECK)
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
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
      
      // Try to find and mark order as failed if it exists
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

    // STEP 2: Additional verification with Razorpay API (verify payment is actually captured)
    const razorpayVerification = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
    if (!razorpayVerification.verified) {
      console.error(`❌ Razorpay API verification failed: ${razorpayVerification.error}`);
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: `COD token payment verification failed: ${razorpayVerification.error}. Please contact support.`
      });
    }

    // STEP 3: Get Razorpay order details to retrieve stored cart and address
    let razorpayOrderDetails;
    let shippingAddressData;
    let itemsToUse;
    let couponDataFromNotes = null;
    let finalOrderAmount;
    let codTokenAmount;
    
    try {
      // Retry fetching Razorpay order details in case of network issues
      const Razorpay = require('razorpay');
      razorpayOrderDetails = await retryOperation(
        () => new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        }).orders.fetch(razorpay_order_id),
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

    // Parse cart, shipping address, and coupon from Razorpay notes
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

    // Verify the order belongs to the authenticated user
    if (notes.userId !== req.user._id.toString()) {
      if (isDevelopment) {
        console.error('❌ Unauthorized COD token payment verification');
      }
      setCorsHeaders(req, res);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify this is a COD token payment
    if (notes.paymentType !== 'cod_token') {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type for COD token verification'
      });
    }

    // Validate cart data - try to get current cart, fallback to stored cart snapshot
    let cartQuery = Cart.findOne({ userId: req.user._id });
    let currentCart = await cartQuery;
    
    // Use stored cart snapshot if current cart is empty (network issue might have cleared it)
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

    // Use the final order amount from notes (the actual order amount, not the token amount)
    const orderAmount = finalOrderAmount || cartData.totalPrice || 0;

    // CREATE ACTUAL COD ORDER IN DATABASE (after token payment is confirmed)
    try {
      const orderData = {
        userId: req.user._id,
        orderId: `COD_${Date.now()}_${req.user._id.toString().slice(-6)}`,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        items: itemsToUse,
        shippingAddress: shippingAddressData,
        amount: orderAmount, // Full order amount (not just token amount)
        currency: razorpayOrderDetails.currency,
        paymentMethod: 'cod_token',
        status: 'confirmed',
        paymentStatus: 'completed', // Token payment is completed
        // Add 24-hour cancellation window
        cancellationWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        // Add status history entry
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: 'system',
          reason: 'COD order created after token payment verification'
        }],
        coupon: couponDataFromNotes || null,
        // Track COD token payment details
        codTokenPayment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          tokenAmount: codTokenAmount,
          paymentDate: new Date(),
          verified: true
        }
      };

      const order = await Order.create(orderData);

      // Record coupon usage after order is created
      if (couponDataFromNotes && couponDataFromNotes.code) {
        recordCouponUsage(couponDataFromNotes.code, req.user._id, order.orderId).catch(err => {
          if (isDevelopment) {
            console.error('Failed to record coupon usage:', err);
          }
        });
      }

      // 🔥 CRITICAL: Deduct stock from products and clear cart
      try {
        for (const item of order.items) {
          const product = await Product.findOne({ productId: item.productId });
          
          if (!product) {
            if (isDevelopment) {
              console.error('⚠️  Product not found during stock deduction for COD order');
            }
            continue;
          }

          const currentStock = product.stock[item.size] || 0;
          
          if (currentStock < item.quantity) {
            if (isDevelopment) {
              console.error(`⚠️  Insufficient stock - Required: ${item.quantity}, Available: ${currentStock}`);
            }
            // Log but continue - stock might have changed, but payment is confirmed
          }

          await Product.findOneAndUpdate(
            { productId: item.productId },
            {
              $inc: {
                [`stock.${item.size}`]: -item.quantity
              }
            },
            { new: true }
          );
        }

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
        console.error('🚨 MANUAL RECONCILIATION REQUIRED: COD token payment confirmed but order processing failed');
        
        // Try to at least save order record for manual processing (outside transaction)
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
            if (isDevelopment) {
              console.log('✅ Reconciliation COD order created for manual processing');
            }
          }
        } catch (reconError) {
          console.error('❌ Failed to create reconciliation COD order');
        }
      }

      // Create Shiprocket order (if enabled) - AFTER order is created
      // This runs asynchronously and won't block the response
      if (process.env.SHIPROCKET_ENABLED === 'true' && order) {
        console.log('🚀 Initiating Shiprocket order creation for COD order:', order.orderId);
        
        // Retry Shiprocket creation in background with exponential backoff
        retryOperation(
          () => createShiprocketOrder(order),
          3,
          2000
        )
        .then(result => {
          if (result) {
            console.log('✅ Shiprocket COD order successfully created. Order ID:', order.orderId, 'Shiprocket Order ID:', result.order_id);
          } else {
            logCritical(`Shiprocket returned null/undefined result for COD order ${order.orderId}`);
          }
        })
        .catch(err => {
          logCritical(`Shiprocket COD order creation failed after retries for order ${order.orderId}`, err);
          console.error('🚨 MANUAL SHIPROCKET ORDER REQUIRED for COD order');
          console.error(`   Order ID: ${order.orderId}`);
          console.error(`   Error: ${err.response?.data?.message || err.message}`);
          if (err.response?.data) {
            console.error(`   Shiprocket Response: ${JSON.stringify(err.response.data)}`);
          }
          if (err.response?.status) {
            console.error(`   HTTP Status: ${err.response.status}`);
          }
          
          // Log to order notes for admin reference
          Order.findByIdAndUpdate(order._id, {
            $push: {
              notes: `Shiprocket creation failed after retries: ${err.response?.data?.message || err.message}. Manual creation required.`
            }
          }).catch(updateErr => {
            console.error('Failed to update COD order notes:', updateErr.message);
          });
        });
      } else {
        if (process.env.SHIPROCKET_ENABLED !== 'true') {
          console.log('⚠️  Shiprocket is disabled (SHIPROCKET_ENABLED != true)');
        } else if (!order) {
          console.error('❌ No order object available for Shiprocket creation');
        }
      }

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
    console.error('Error stack:', error.stack);
    if (error.response?.data) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // CRITICAL: Check if payment was actually made but verification failed
    // This handles network failures after payment but before verification
    const { razorpay_order_id, razorpay_payment_id } = req.body || {};
    
    if (razorpay_order_id && razorpay_payment_id) {
      // Try to verify payment status with Razorpay API
      try {
        const paymentCheck = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
        if (paymentCheck.verified) {
          // Payment is confirmed but order creation failed
          console.error('🚨 CRITICAL: COD token payment confirmed but verification failed. Manual reconciliation required.');
          
          // Try to create order one more time (without transaction for recovery)
          try {
            const Razorpay = require('razorpay');
            const razorpayOrderDetails = await new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET
            }).orders.fetch(razorpay_order_id);
            const notes = razorpayOrderDetails.notes || {};
            
            const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!existingOrder) {
              // Create order for reconciliation
              const cartData = JSON.parse(notes.cartSnapshot || '{}');
              const shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
              
              // Ensure shipping address has email (required for Shiprocket)
              if (!shippingAddressData.email) {
                // Try to get user email
                const User = require('../models/User');
                const user = await User.findById(req.user._id).select('email');
                if (user && user.email) {
                  shippingAddressData.email = user.email;
                } else {
                  shippingAddressData.email = 'customer@kallkeyy.com';
                }
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
                paymentMethod: 'cod',
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
              
              // Add coupon data if present
              if (notes.coupon) {
                try {
                  recoveryOrderData.coupon = JSON.parse(notes.coupon);
                } catch (parseErr) {
                  // Ignore coupon parse errors for recovery orders
                }
              }
              
              await Order.create(recoveryOrderData);
              
              if (isDevelopment) {
                console.log('✅ Recovery COD order created');
              }
              
              // IMPORTANT: Create Shiprocket order for recovery orders too
              const recoveryOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
              if (process.env.SHIPROCKET_ENABLED === 'true' && recoveryOrder) {
                if (isDevelopment) {
                  console.log('🚀 Initiating Shiprocket order creation for recovery COD order');
                }
                retryOperation(
                  () => createShiprocketOrder(recoveryOrder),
                  3,
                  2000
                )
                .then(result => {
                  if (result && isDevelopment) {
                    console.log('✅ Shiprocket order successfully created for recovery COD order');
                  }
                })
                .catch(err => {
                  console.error('⚠️  Shiprocket creation failed for recovery COD order');
                  console.error('Shiprocket error details:', err.message || err);
                  if (err.response?.data) {
                    console.error('Shiprocket API response:', JSON.stringify(err.response.data, null, 2));
                  }
                  // Update order notes with Shiprocket error
                  Order.findByIdAndUpdate(recoveryOrder._id, {
                    $push: {
                      notes: `Shiprocket creation failed for recovery COD order: ${err.message || err.response?.data?.message || 'Unknown error'}. Manual creation required.`
                    }
                  }).catch(updateErr => {
                    if (isDevelopment) {
                      console.error('Failed to update recovery COD order notes:', updateErr);
                    }
                  });
                });
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
    
    // Log critical error
    logCritical('COD token payment verification failed', error);
    console.error('   Razorpay Order ID:', razorpay_order_id);
    console.error('   Razorpay Payment ID:', razorpay_payment_id);
    
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'COD token payment verification failed. Please contact support with your Razorpay Payment ID if payment was deducted.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

    // Helper function to verify payment with Razorpay API (extra validation)
async function verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id) {
  try {
    // Fetch payment details from Razorpay to confirm payment status
    const Razorpay = require('razorpay');
    const payment = await new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    }).payments.fetch(razorpay_payment_id);
    
    // Verify payment is linked to the correct order
    if (payment.order_id !== razorpay_order_id) {
      throw new Error('Payment order ID mismatch');
    }

    // Verify payment status - Only accept 'captured' status for live mode
    if (payment.status !== 'captured') {
      throw new Error(`Payment not captured. Status: ${payment.status}`);
    }

    return {
      verified: true,
      paymentDetails: payment
    };
  } catch (error) {
    console.error('❌ Razorpay payment verification failed:', error.message);
    return {
      verified: false,
      error: error.message
    };
  }
}