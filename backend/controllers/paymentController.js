const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const axios = require('axios');
const { setCorsHeaders } = require('../utils/responseHelper');
const { recordCouponUsage } = require('./couponController');

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials are missing! Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error. Please contact support.'
      });
    }

    const userId = req.user._id;
    const { shippingAddress, couponCode } = req.body;

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
    const finalAmount = Math.max(1, baseAmount - discountAmount); // Minimum 1 INR

    // Validate amount (minimum 1 INR)
    if (finalAmount < 1) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount after discount'
      });
    }

    // Generate unique receipt ID
    const receiptId = `order_${Date.now()}_${userId.toString().slice(-6)}`;

    // Create Razorpay order (DO NOT create database order yet - only after payment confirmation)
    const options = {
      amount: Math.round(finalAmount * 100), // Amount in paise (must be integer)
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
        coupon: couponData ? JSON.stringify(couponData) : ''
      }
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', razorpayError);
      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order. Please try again.',
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : undefined
      });
    }

    // Return Razorpay order details - NO database order created yet
    // Database order will be created only after payment is verified
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      key: process.env.RAZORPAY_KEY_ID
    });

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

// Helper function to verify payment with Razorpay API (extra validation)
async function verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id) {
  try {
    // Fetch payment details from Razorpay to confirm payment status
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    // Verify payment is linked to the correct order
    if (payment.order_id !== razorpay_order_id) {
      throw new Error('Payment order ID mismatch');
    }

    // Verify payment status
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
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

// Helper to check if verbose logging should be enabled (development only)
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';

// Helper function to check if MongoDB transactions are supported
async function supportsTransactions() {
  try {
    // Try to start a session - if this works, transactions are supported
    const testSession = await mongoose.startSession();
    await testSession.endSession();
    return true;
  } catch (error) {
    // If error mentions replica set, transactions are not supported
    if (error.message && error.message.includes('replica set')) {
      return false;
    }
    // Other errors might be transient, assume transactions are supported
    return true;
  }
}

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

// Verify Payment
exports.verifyPayment = async (req, res) => {
  // Check if transactions are supported (replica set required)
  let useTransactions = false;
  let session = null;
  
  try {
    // Try to check if transactions are supported
    const testSession = await mongoose.startSession();
    await testSession.endSession();
    useTransactions = true;
    session = await mongoose.startSession();
    session.startTransaction();
    if (isDevelopment) {
      console.log('✅ MongoDB transactions supported - using transaction mode');
    }
  } catch (transactionError) {
    // Transactions not supported (standalone MongoDB)
    if (transactionError.message && transactionError.message.includes('replica set')) {
      if (isDevelopment) {
        console.warn('⚠️  MongoDB transactions not supported (standalone instance). Using fallback mode without transactions.');
      }
      useTransactions = false;
      session = null;
    } else {
      // Re-throw other errors
      throw transactionError;
    }
  }
  
  try {
    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_SECRET) {
      if (useTransactions && session) {
        await session.abortTransaction();
        session.endSession();
      }
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

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      if (useTransactions && session) {
        await session.abortTransaction();
        session.endSession();
      }
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    // STEP 1: Verify signature (CRITICAL SECURITY CHECK)
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
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
      if (useTransactions && session) {
        await session.abortTransaction();
        session.endSession();
      }
      if (isDevelopment) {
        console.error('❌ Payment signature verification failed');
      }
      
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
        message: 'Payment verification failed. Signature mismatch.'
      });
    }

    // STEP 2: Additional verification with Razorpay API (verify payment is actually captured)
    const razorpayVerification = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
    if (!razorpayVerification.verified) {
      if (useTransactions && session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error(`❌ Razorpay API verification failed: ${razorpayVerification.error}`);
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: `Payment verification failed: ${razorpayVerification.error}. Please contact support.`
      });
    }

    // STEP 3: Check if order already exists (idempotency check)
    let orderQuery = Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (useTransactions && session) {
      orderQuery = orderQuery.session(session);
    }
    let order = await orderQuery;

    if (order) {
      // Order already exists - verify ownership and prevent double payment
      if (order.userId.toString() !== req.user._id.toString()) {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        if (isDevelopment) {
          console.error('❌ Unauthorized payment verification attempt');
        }
        setCorsHeaders(req, res);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      if (order.paymentStatus === 'completed') {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        if (isDevelopment) {
          console.log(`✅ Payment already verified (idempotency check passed)`);
        }
        setCorsHeaders(req, res);
        return res.status(200).json({
          success: true,
          message: 'Payment already verified',
          order
        });
      }

      // Update existing order (edge case: order exists but payment not completed)
      const updateOptions = { new: true };
      if (useTransactions && session) {
        updateOptions.session = session;
      }
      order = await Order.findByIdAndUpdate(
        order._id,
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: 'completed',
          status: 'paid'
        },
        updateOptions
      );
    } else {
      // CREATE ORDER FOR THE FIRST TIME (only after payment is confirmed)
      // Get Razorpay order details to retrieve stored cart and address
      let razorpayOrderDetails;
      let shippingAddressData;
      let itemsToUse;
      let paidAmount;
      
      try {
        // Retry fetching Razorpay order details in case of network issues
        razorpayOrderDetails = await retryOperation(
          () => razorpay.orders.fetch(razorpay_order_id),
          3,
          1000
        );
      } catch (error) {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        console.error('❌ Failed to fetch Razorpay order details after retries:', error);
        setCorsHeaders(req, res);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve order details. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      // Parse cart, shipping address, and coupon from Razorpay notes
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
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        console.error('❌ Failed to parse order data from Razorpay notes:', parseError);
        setCorsHeaders(req, res);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve order information. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      // Verify the order belongs to the authenticated user
      if (notes.userId !== req.user._id.toString()) {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        if (isDevelopment) {
          console.error('❌ Unauthorized payment verification');
        }
        setCorsHeaders(req, res);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      // Validate cart data - try to get current cart, fallback to stored cart snapshot
      let cartQuery = Cart.findOne({ userId: req.user._id });
      if (useTransactions && session) {
        cartQuery = cartQuery.session(session);
      }
      let currentCart = await cartQuery;
      
      // Use stored cart snapshot if current cart is empty (network issue might have cleared it)
      itemsToUse = (currentCart && currentCart.items.length > 0) 
        ? currentCart.items 
        : (cartData.items || []);
      
      if (!itemsToUse || itemsToUse.length === 0) {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        console.error('❌ No cart items available during payment verification');
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'No items found for order. Please contact support with Razorpay Order ID: ' + razorpay_order_id
        });
      }

      // Use the amount from Razorpay order (the amount that was actually paid)
      paidAmount = razorpayOrderDetails.amount / 100; // Convert from paise to rupees

      // CREATE ORDER IN DATABASE (only after payment is confirmed)
      try {
        const orderData = {
          userId: req.user._id,
          orderId: razorpayOrderDetails.receipt,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          items: itemsToUse,
          shippingAddress: shippingAddressData,
          amount: paidAmount,
          currency: razorpayOrderDetails.currency,
          status: 'paid',
          paymentStatus: 'completed'
        };

        // Add coupon data if available
        if (couponDataFromNotes) {
          orderData.coupon = couponDataFromNotes;
        }

        const createOptions = useTransactions && session ? { session } : {};
        if (useTransactions && session) {
          // With transaction: create returns array
          order = await Order.create([orderData], createOptions);
          order = order[0]; // Create returns an array when using session
        } else {
          // Without transaction: create returns single object
          order = await Order.create(orderData);
        }

        // Record coupon usage after order is created
        if (couponDataFromNotes && couponDataFromNotes.code) {
          recordCouponUsage(couponDataFromNotes.code, req.user._id, order.orderId).catch(err => {
            if (isDevelopment) {
              console.error('Failed to record coupon usage:', err);
            }
          });
        }

        // Order created successfully
        if (isDevelopment) {
          console.log('✅ Order created and payment confirmed');
        }
      } catch (createError) {
        if (useTransactions && session) {
          await session.abortTransaction();
          session.endSession();
        }
        
        // Check if order was created due to duplicate key (race condition)
        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (existingOrder && existingOrder.paymentStatus === 'completed') {
          if (isDevelopment) {
            console.log('⚠️  Order already exists (race condition handled)');
          }
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

    // 🔥 CRITICAL: Deduct stock from products and clear cart
    // This happens for both new and existing orders
    try {
      for (const item of order.items) {
        let productQuery = Product.findOne({ productId: item.productId });
        if (useTransactions && session) {
          productQuery = productQuery.session(session);
        }
        const product = await productQuery;
        
        if (!product) {
          if (isDevelopment) {
            console.error('⚠️  Product not found during stock deduction');
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

        let productUpdateQuery = Product.findOneAndUpdate(
          { productId: item.productId },
          {
            $inc: {
              [`stock.${item.size}`]: -item.quantity
            }
          }
        );
        if (useTransactions && session) {
          productUpdateQuery = productUpdateQuery.session(session);
        }
        await productUpdateQuery;
      }

      // Clear cart
      let cartUpdateQuery = Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 }
      );
      if (useTransactions && session) {
        cartUpdateQuery = cartUpdateQuery.session(session);
      }
      await cartUpdateQuery;

      // COMMIT TRANSACTION if using transactions
      if (useTransactions && session) {
        await session.commitTransaction();
        session.endSession();
        if (isDevelopment) {
          console.log('✅ Transaction committed successfully');
        }
      } else {
        if (isDevelopment) {
          console.log('✅ Order processing completed successfully (without transactions)');
        }
      }
    } catch (stockError) {
      // ROLLBACK TRANSACTION on any error (if using transactions)
      if (useTransactions && session) {
        await session.abortTransaction();
        session.endSession();
      }
      
      console.error('❌ Error during stock deduction/cart clearing - transaction rolled back');
      
      // CRITICAL: Even though transaction failed, payment is confirmed
      // Log this for manual reconciliation
      console.error('🚨 MANUAL RECONCILIATION REQUIRED: Payment confirmed but order processing failed');
      
      // Try to at least save order record for manual processing (outside transaction)
      try {
        const reconciliationOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!reconciliationOrder) {
          // Get order details if available
          let reconRazorpayOrderDetails = razorpayOrderDetails;
          if (!reconRazorpayOrderDetails) {
            try {
              reconRazorpayOrderDetails = await razorpay.orders.fetch(razorpay_order_id);
            } catch (err) {
              console.error('Failed to fetch order details for reconciliation:', err);
            }
          }
          
          // Create order without stock deduction for manual processing
          await Order.create({
            userId: req.user._id,
            orderId: reconRazorpayOrderDetails?.receipt || `recon_${Date.now()}`,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            items: order?.items || itemsToUse || [],
            shippingAddress: shippingAddressData || {},
            amount: paidAmount || (reconRazorpayOrderDetails?.amount / 100) || 0,
            currency: reconRazorpayOrderDetails?.currency || 'INR',
            status: 'paid',
            paymentStatus: 'completed',
            notes: ['⚠️ MANUAL RECONCILIATION REQUIRED - Stock not deducted due to transaction failure']
          });
          if (isDevelopment) {
            console.log('✅ Reconciliation order created for manual processing');
          }
        }
      } catch (reconError) {
        console.error('❌ Failed to create reconciliation order');
      }

      setCorsHeaders(req, res);
      return res.status(500).json({
        success: false,
        message: 'Payment confirmed but order processing encountered an issue. Our team will process your order manually. Please contact support with Razorpay Order ID: ' + razorpay_order_id
      });
    }

    // Create Shiprocket order (if enabled) - AFTER transaction is committed
    // This runs asynchronously and won't block the response
    if (process.env.SHIPROCKET_ENABLED === 'true' && order) {
      if (isDevelopment) {
        console.log('🚀 Initiating Shiprocket order creation');
      }
      
      // Retry Shiprocket creation in background with exponential backoff
      retryOperation(
        () => createShiprocketOrder(order),
        3,
        2000
      )
      .then(result => {
        if (result) {
          if (isDevelopment) {
            console.log('✅ Shiprocket order successfully created');
          }
        }
      })
      .catch(err => {
        console.error('⚠️  Shiprocket order creation failed after retries (non-blocking)');
        console.error('🚨 MANUAL SHIPROCKET ORDER REQUIRED');
        if (isDevelopment) {
          console.error(`   Error: ${err.response?.data?.message || err.message}`);
        }
        
        // Log to order notes for admin reference
        Order.findByIdAndUpdate(order._id, {
          $push: {
            notes: `Shiprocket creation failed after retries: ${err.response?.data?.message || err.message}. Manual creation required.`
          }
        }).catch(updateErr => {
          if (isDevelopment) {
            console.error('Failed to update order notes');
          }
        });
      });
    } else {
      if (process.env.SHIPROCKET_ENABLED !== 'true') {
        if (isDevelopment) {
          console.log('ℹ️  Shiprocket is disabled (SHIPROCKET_ENABLED != true)');
        }
      } else if (!order) {
        if (isDevelopment) {
          console.log('ℹ️  No order object available for Shiprocket creation');
        }
      }
    }

    setCorsHeaders(req, res);
    return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
  } catch (error) {
    // Ensure transaction is aborted on any unhandled error
    if (useTransactions && session && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    if (session) {
      session.endSession().catch(() => {});
    }
    
    console.error('❌ Payment verification error');
    
    // CRITICAL: Check if payment was actually made but verification failed
    // This handles network failures after payment but before verification
    const { razorpay_order_id, razorpay_payment_id } = req.body || {};
    
    if (razorpay_order_id && razorpay_payment_id) {
      // Try to verify payment status with Razorpay API
      try {
        const paymentCheck = await verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id);
        if (paymentCheck.verified) {
          // Payment is confirmed but order creation failed
          console.error('🚨 CRITICAL: Payment confirmed but verification failed. Manual reconciliation required.');
          
          // Try to create order one more time (without transaction for recovery)
          try {
            const razorpayOrderDetails = await razorpay.orders.fetch(razorpay_order_id);
            const notes = razorpayOrderDetails.notes || {};
            
            const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!existingOrder) {
              // Create order for reconciliation
              const cartData = JSON.parse(notes.cartSnapshot || '{}');
              const shippingAddressData = JSON.parse(notes.shippingAddress || '{}');
              
              await Order.create({
                userId: req.user._id,
                orderId: razorpayOrderDetails.receipt,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: req.body?.razorpay_signature || '',
                items: cartData.items || [],
                shippingAddress: shippingAddressData,
                amount: razorpayOrderDetails.amount / 100,
                currency: razorpayOrderDetails.currency,
                status: 'paid',
                paymentStatus: 'completed',
                notes: ['⚠️ Created during error recovery - verify stock deduction']
              });
              
              if (isDevelopment) {
                console.log('✅ Recovery order created');
              }
              
              // IMPORTANT: Create Shiprocket order for recovery orders too
              const recoveryOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
              if (process.env.SHIPROCKET_ENABLED === 'true' && recoveryOrder) {
                if (isDevelopment) {
                  console.log('🚀 Initiating Shiprocket order creation for recovery order');
                }
                retryOperation(
                  () => createShiprocketOrder(recoveryOrder),
                  3,
                  2000
                )
                .then(result => {
                  if (result && isDevelopment) {
                    console.log('✅ Shiprocket order successfully created for recovery order');
                  }
                })
                .catch(err => {
                  console.error('⚠️  Shiprocket creation failed for recovery order');
                });
              }

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
    
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support with your Razorpay Payment ID if payment was deducted.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Webhook handler for Razorpay (Optional - can be enabled with webhook secret)
exports.webhookHandler = async (req, res) => {
  try {
    // Webhook secret is optional - if not provided, webhook is disabled for security
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.log('⚠️  Razorpay webhook secret not configured. Webhook disabled for security.');
      setCorsHeaders(req, res);
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook disabled - secret not configured' 
      });
    }

    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Missing signature' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Webhook signature verification failed');
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Signature verified - process webhook
      const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (!payload) {
      setCorsHeaders(req, res);
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

      if (event === 'payment.captured') {
        // Update order status
      const order = await Order.findOneAndUpdate(
          { razorpayPaymentId: payload.id },
          { 
            paymentStatus: 'completed',
            status: 'paid'
        },
        { new: true }
      );

      if (order) {
        console.log(`✅ Order ${order.orderId} updated via webhook: payment captured`);
      } else {
        console.log(`⚠️  Order not found for payment ID: ${payload.id}`);
      }
      } else if (event === 'payment.failed') {
      const order = await Order.findOneAndUpdate(
          { razorpayOrderId: payload.order_id },
          { 
            paymentStatus: 'failed',
            status: 'failed'
        },
        { new: true }
      );

      if (order) {
        console.log(`❌ Order ${order.orderId} updated via webhook: payment failed`);
      } else {
        console.log(`⚠️  Order not found for Razorpay order ID: ${payload.order_id}`);
      }
      }

      setCorsHeaders(req, res);
      res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Shiprocket token cache (to avoid fetching token on every order)
let shiprocketTokenCache = null;
let shiprocketTokenExpiry = null;

// Helper function to get Shiprocket auth token (with caching)
async function getShiprocketToken() {
  try {
    // Return cached token if still valid (tokens typically last 24 hours)
    if (shiprocketTokenCache && shiprocketTokenExpiry && Date.now() < shiprocketTokenExpiry) {
      return shiprocketTokenCache;
    }

    // Validate credentials exist
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials not configured');
    }

    const authResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    if (!authResponse.data || !authResponse.data.token) {
      throw new Error('Invalid token response from Shiprocket');
    }

    // Cache token for 20 hours (tokens typically last 24 hours, cache for safety)
    shiprocketTokenCache = authResponse.data.token;
    shiprocketTokenExpiry = Date.now() + (20 * 60 * 60 * 1000); // 20 hours

    if (isDevelopment) {
      console.log('✅ Shiprocket token obtained and cached');
    }
    return shiprocketTokenCache;
  } catch (error) {
    console.error('❌ Shiprocket authentication failed');
    // Clear cache on error
    shiprocketTokenCache = null;
    shiprocketTokenExpiry = null;
    throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
  }
}

// Helper function to split full name into first and last name
function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }
  
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }
  
  // First name is first part, rest is last name
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
}

// Helper function to format phone number (remove spaces, ensure 10 digits)
function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // If starts with country code (91), remove it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.substring(2);
  }
  // Return last 10 digits
  return cleaned.slice(-10);
}

// Helper function to calculate package dimensions and weight based on items
function calculatePackageDetails(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Base dimensions for a single item (hoodie/tshirt in a polybag)
  const baseLength = 30; // cm
  const baseBreadth = 25; // cm
  const baseHeight = 5; // cm
  const baseWeight = 0.3; // kg per item (hoodie is heavier than tshirt)
  
  // For multiple items, stack them (increase height)
  // Max reasonable dimensions for a package
  const maxLength = 45;
  const maxBreadth = 35;
  const maxHeight = 15;
  
  let length = baseLength;
  let breadth = baseBreadth;
  let height = baseHeight;
  let weight = baseWeight * totalItems;
  
  // Adjust for multiple items (stacking)
  if (totalItems > 1) {
    height = Math.min(baseHeight * Math.ceil(totalItems / 2), maxHeight);
    // If many items, might need bigger base
    if (totalItems > 4) {
      length = Math.min(baseLength + 10, maxLength);
      breadth = Math.min(baseBreadth + 10, maxBreadth);
    }
  }
  
  // Ensure minimum weight (at least 0.2kg for shipping)
  weight = Math.max(weight, 0.2);
  
  return { length, breadth, height, weight };
}

// Helper function to create Shiprocket order
async function createShiprocketOrder(order) {
  try {
    if (isDevelopment) {
      console.log('🚀 Creating Shiprocket order');
    }
    
    // Validate Shiprocket is enabled
    if (process.env.SHIPROCKET_ENABLED !== 'true') {
      if (isDevelopment) {
        console.log('⚠️  Shiprocket is disabled, skipping order creation');
      }
      return null;
    }

    // Validate required environment variables
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials not configured in environment variables');
    }

    // Validate order data
    if (!order || !order.shippingAddress) {
      throw new Error('Invalid order data: missing shipping address');
    }

    const shippingAddress = order.shippingAddress;
    
    // Validate required fields
    const requiredFields = ['fullName', 'address', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required shipping fields: ${missingFields.join(', ')}`);
    }

    // Validate and format phone number (same logic as test script)
    const formattedPhone = formatPhoneNumber(shippingAddress.phone);
    if (!formattedPhone || formattedPhone.length !== 10) {
      if (isDevelopment) {
        console.error('❌ Invalid phone number format');
      }
      throw new Error(`Invalid phone number: ${shippingAddress.phone}. Must be exactly 10 digits.`);
    }
    
    // Additional validation: Ensure phone is all digits (should already be handled by formatPhoneNumber)
    if (!/^\d{10}$/.test(formattedPhone)) {
      if (isDevelopment) {
        console.error('❌ Phone number contains non-digits');
      }
      throw new Error(`Invalid phone number format: ${shippingAddress.phone}. Must contain only digits.`);
    }
    
    if (isDevelopment) {
      console.log('✅ Phone number validated');
    }

    // Validate pincode (must be 6 digits for India)
    const pincode = shippingAddress.pincode.trim().replace(/\D/g, '');
    if (pincode.length !== 6) {
      throw new Error(`Invalid pincode: ${shippingAddress.pincode}. Must be 6 digits.`);
    }

    // Split full name
    const { firstName, lastName } = splitFullName(shippingAddress.fullName);

    // Get user email if not in shipping address
    let customerEmail = shippingAddress.email;
    if (!customerEmail && order.userId) {
      try {
        const User = require('../models/User');
        const user = await User.findById(order.userId);
        customerEmail = user?.email;
      } catch (userError) {
        if (isDevelopment) {
            console.error('Failed to fetch user email');
        }
      }
    }
    
    // Validate email (use order email or default)
    if (!customerEmail) {
      customerEmail = 'customer@kallkeyy.com'; // Fallback email
      if (isDevelopment) {
        console.warn('⚠️  No email found for order, using fallback email');
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error(`Invalid email format: ${customerEmail}`);
    }
    
    // Get auth token
    const token = await getShiprocketToken();

    // Calculate package dimensions and weight
    const packageDetails = calculatePackageDetails(order.items);

    // Create SKU with size information for each item
    const orderItems = order.items.map(item => ({
      name: `${item.productName} (Size: ${item.size})`,
      sku: `${item.productId}_${item.size}`, // Include size in SKU
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: 0
    }));

    // Create order payload (optimized for streetwear)
    const orderPayload = {
      order_id: order.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: "",
      comment: `KALLKEYY Streetwear Order - Order ID: ${order.orderId}`,
      billing_customer_name: firstName,
      billing_last_name: lastName || '',
      billing_address: shippingAddress.address.trim(),
      billing_address_2: "",
      billing_city: shippingAddress.city.trim(),
      billing_pincode: pincode,
      billing_state: shippingAddress.state.trim(),
      billing_country: 'India',
      billing_email: customerEmail.trim().toLowerCase(),
      billing_phone: formattedPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.amount,
      length: packageDetails.length,
      breadth: packageDetails.breadth,
      height: packageDetails.height,
      weight: packageDetails.weight
    };

    // Payload validation complete (no sensitive data logging)

    // Create Shiprocket order
    const shiprocketResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      orderPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Validate response
    if (!shiprocketResponse.data) {
      throw new Error('Empty response from Shiprocket API');
    }

    const responseData = shiprocketResponse.data;

    // Check for errors in response
    if (responseData.message && !responseData.order_id) {
      throw new Error(`Shiprocket API error: ${responseData.message}`);
    }

    if (!responseData.order_id) {
      throw new Error('Shiprocket response missing order_id');
    }

    if (isDevelopment) {
      console.log('✅ Shiprocket response received');
    }

    // Update order with Shiprocket details
    const updateData = {
      shiprocketOrderId: responseData.order_id,
      status: 'processing'
    };

    if (responseData.shipment_id) {
      updateData.shiprocketShipmentId = responseData.shipment_id;
    }

    await Order.findByIdAndUpdate(order._id, updateData);

    if (isDevelopment) {
      console.log('✅ Shiprocket order created successfully');
    }

    return responseData;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    
    console.error('❌ Shiprocket order creation failed');

    // Clear token cache on authentication errors
    if (error.response?.status === 401 || error.message?.includes('authentication')) {
      shiprocketTokenCache = null;
      shiprocketTokenExpiry = null;
      if (isDevelopment) {
        console.log('🔄 Cleared Shiprocket token cache due to auth error');
      }
    }
    
    // Update order to note Shiprocket failure
    try {
    await Order.findByIdAndUpdate(order._id, {
      $push: {
          notes: `Shiprocket creation failed: ${errorMessage}`
        }
      });
    } catch (updateError) {
      console.error('Failed to update order with error note:', updateError);
    }
    
    // Log specific error types for debugging
    if (error.response?.data) {
      const apiError = error.response.data;
      
      if (apiError.message?.includes('pickup')) {
        console.error('🔧 Issue: Pickup location might not exist. Check SHIPROCKET_PICKUP_LOCATION in .env');
      }
      
      if (apiError.message?.includes('phone')) {
        console.error('🔧 Issue: Invalid phone number format. Phone must be 10 digits.');
      }
      
      if (apiError.message?.includes('pincode')) {
        console.error('🔧 Issue: Invalid pincode. Must be 6 digits.');
      }
      
      if (apiError.message?.includes('email')) {
        console.error('🔧 Issue: Invalid email format.');
      }
    }
    
    // Don't throw - log and continue (order still valid even if Shiprocket fails)
    // But throw for retry mechanism to work
    throw error;
  }
}

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
    console.log('📨 Shiprocket webhook received:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;
    
    // Find order by Shiprocket order ID
    const order = await Order.findOne({ 
      shiprocketOrderId: webhookData.order_id 
    });

    if (!order) {
      console.log(`⚠️  Order not found for Shiprocket ID: ${webhookData.order_id}`);
      setCorsHeaders(req, res);
      return res.status(200).json({ success: true, message: 'Order not found' });
    }

    // Update order based on webhook event
    const updates = {};

    // Handle different webhook events
    switch (webhookData.current_status) {
      case 'PICKUP SCHEDULED':
      case 'PICKUP QUEUED':
        updates.status = 'processing';
        break;
      
      case 'SHIPPED':
      case 'IN TRANSIT':
        updates.status = 'shipped';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
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

    // Add tracking URL if available
    if (webhookData.awb_code) {
      updates.trackingUrl = `https://shiprocket.co/tracking/${webhookData.awb_code}`;
    }

    if (Object.keys(updates).length > 0) {
      await Order.findByIdAndUpdate(order._id, updates);
      console.log(`✅ Order ${order.orderId} updated:`, updates);
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
