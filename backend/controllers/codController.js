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

// Create COD Order
exports.createCODOrder = async (req, res) => {
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

    // Check if MongoDB transactions are supported
    // Transactions only work with replica sets or mongos, not standalone instances
    // We'll start with transactions disabled and only enable if we detect support
    // Since the test itself can fail on standalone, we'll detect during actual operations
    let useTransactions = false;
    let session = null;
    
    // Don't test transactions upfront - let the actual operations test and fallback
    // This avoids errors during testing on standalone MongoDB

    try {
      // Generate unique order ID
      const receiptId = `COD_${Date.now()}_${userId.toString().slice(-6)}`;

      // Validate cart items exist
      if (!cart.items || cart.items.length === 0) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

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
        status: 'confirmed', // COD orders start as confirmed
        paymentStatus: 'pending', // Payment pending until delivery
        // Add 24-hour cancellation window
        cancellationWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        // Add status history entry
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: 'system',
          reason: 'COD order created'
        }],
        coupon: couponData || null
      };

      // Create order
      // Always start without transactions - simpler and works on standalone MongoDB
      let order;
      try {
        order = await Order.create(orderData);
      } catch (createError) {
        console.error('❌ Failed to create order in database:', createError);
        throw createError;
      }

      // Deduct stock for each item (without transactions - simpler and works on standalone MongoDB)
      for (const item of cart.items) {
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
            console.error(`⚠️  Insufficient stock for COD order - Required: ${item.quantity}, Available: ${currentStock}`);
          }
          // Log but continue - stock might have changed
        }

        await Product.findOneAndUpdate(
          { productId: item.productId },
          { 
            $inc: { [`stock.${item.size}`]: -item.quantity }
          },
          { new: true }
        );
      }

      // Clear cart (without transactions)
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

      // Create Shiprocket order (if enabled) - runs asynchronously (non-blocking)
      // This runs in the background and won't affect the order creation response
      // Wrap in try-catch to ensure it doesn't break order creation
      try {
        if (process.env.SHIPROCKET_ENABLED === 'true' && order && order._id) {
          // Run asynchronously - don't await, don't block response
          setImmediate(async () => {
            try {
              console.log('🚀 Initiating Shiprocket order creation for COD order:', order.orderId);
              
              // Fetch fresh order from DB to ensure all fields are present
              const freshOrder = await Order.findById(order._id).lean();
              if (!freshOrder) {
                throw new Error('Order not found');
              }
              
              const result = await retryOperation(
                async () => {
                  return await createShiprocketOrder(freshOrder);
                },
                3,
                2000
              );
              
              if (result) {
                console.log('✅ Shiprocket COD order successfully created. Order ID:', order.orderId, 'Shiprocket Order ID:', result.order_id);
              } else {
                logCritical(`Shiprocket returned null/undefined result for COD order ${order.orderId}`);
              }
            } catch (err) {
              logCritical(`Shiprocket COD order creation failed for order ${order.orderId}`, err);
              console.error('🚨 MANUAL SHIPROCKET ORDER REQUIRED for COD order');
              console.error(`   Order ID: ${order.orderId}`);
              console.error(`   Error: ${err.response?.data?.message || err.message}`);
              if (err.response?.data) {
                console.error(`   Shiprocket Response: ${JSON.stringify(err.response.data)}`);
              }
              // Log to order notes for admin reference
              try {
                await Order.findByIdAndUpdate(order._id, {
                  $push: {
                    notes: `Shiprocket creation failed: ${err.response?.data?.message || err.message}. Manual creation required.`
                  }
                });
              } catch (updateError) {
                console.error('Failed to update COD order notes:', updateError.message);
              }
            }
          });
        }
      } catch (shiprocketError) {
        // This should never happen, but if it does, log and continue
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
      // No need to rollback - we're not using transactions on standalone MongoDB

      console.error('❌ COD order creation error:', error);
      console.error('Error stack:', error.stack);
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
    console.error('Error stack:', error.stack);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD order. Please try again.',
      error: isDevelopment ? error.message : undefined,
      ...(isDevelopment && { stack: error.stack })
    });
  }
};

