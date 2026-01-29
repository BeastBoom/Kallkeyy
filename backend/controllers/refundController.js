const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const { sendOrderCancellationEmail } = require('../utils/emailService');
const { logAction } = require('../utils/responseHelper');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to safely abort transaction
const safeAbort = async (session) => {
  if (session && session.inTransaction()) {
    try {
      await session.abortTransaction();
    } catch (error) {
      console.error('Error aborting transaction:', error);
    }
  }
};

// Helper function with retry mechanism for refund operations
const retryRefundOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`⚠️  Refund operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};


/**
 * Process order cancellation with refund
 */
const processOrderCancellation = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { orderId, reason } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and cancellation reason are required'
      });
    }
    
    // Find order with user validation
    const order = await Order.findOne({ 
      orderId, 
      userId,
      isDeleted: { $ne: true }
    }).session(session);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to cancel this order'
      });
    }

    // 🚫 Prevent double refund
    if (order.refundDetails && order.refundDetails.refundId) {
      return res.status(400).json({
        success: false,
        message: "Refund already processed for this order"
      });
    }

    
    // Check if order is eligible for cancellation
    const now = new Date();
    const cancellationWindowEnds = new Date(order.cancellationWindowEndsAt);
    
    if (now > cancellationWindowEnds) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window has expired. Please contact support for assistance.'
      });
    }
    
    // Check if order is already cancelled or delivered
    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }
    
    // Check if payment was successful
    const isPaymentSuccessful = order.paymentStatus === 'completed';
    
    let refundResult = null;
    
    // Process refund if payment was successful
    if (isPaymentSuccessful && order.razorpayPaymentId) {
      try {
        refundResult = await processRazorpayRefund(order, reason, session);
      } catch (refundError) {
        throw refundError;
      }
    }
    
    // Update order status and details
    const updatedOrder = await updateOrderForCancellation(order, reason, refundResult, session);
    
    // Restore inventory
    await restoreInventory(order.items, session);
    
    // Send cancellation email
    try {
      await sendOrderCancellationEmail(order, refundResult);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the transaction if email fails
    }
    
    await session.commitTransaction();
    
    // Log the cancellation action
    await logAction('order_cancellation', {
      orderId: order.orderId,
      userId: order.userId,
      reason,
      refundProcessed: !!refundResult,
      refundAmount: refundResult?.amount || 0
    });
    
    res.status(200).json({
      success: true,
      message: refundResult 
        ? 'Order cancelled successfully. Refund will be processed within 5-7 business days.'
        : 'Order cancelled successfully.',
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        refundDetails: updatedOrder.refundDetails
      }
    });
    
  } catch (error) {
    await safeAbort(session);
    console.error('Order cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your cancellation request',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Process Razorpay refund
 */
const processRazorpayRefund = async (order, reason, session) => {
  try {
    // Fetch actual payment details from Razorpay
    const payment = await razorpay.payments.fetch(order.razorpayPaymentId);

    if (payment.status !== "captured") {
      throw new Error("Payment not captured. Refund cannot be processed.");
    }

    let refundableAmount = payment.amount;

    // If COD token order → refund only token
    if (order.paymentMethod === 'cod_token') {
      const TOKEN_AMOUNT_PAISE = 100 * 100;
      refundableAmount = Math.min(payment.amount, TOKEN_AMOUNT_PAISE);
    }

    
    // Generate unique refund receipt ID
    const refundReceipt = `REF_${order.orderId}_${Date.now()}`;
    
    // Process refund via Razorpay API
    const refundData = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundableAmount,
      speed: 'normal',
      notes: {
        order_id: order.orderId,
        reason,
        payment_type: order.paymentMethod
      }
    });
    
    // Update order with refund details
    order.refundDetails = {
      refundId: refundData.id,
      refundAmount: refundableAmount,
      refundStatus: refundData.status,
      refundReason: reason,
      refundedAt: new Date(),
      refundNotes: `Refund processed via Razorpay. Receipt: ${refundReceipt}`
    };
    
    return {
      refundId: refundData.id,
      amount: refundableAmount / 100, // Convert back to rupees
      status: refundData.status,
      receipt: refundReceipt
    };
    
  } catch (error) {
    console.error('Razorpay refund error:', error);
    throw new Error(`Refund processing failed: ${error.message}`);
  }
};

/**
 * Update order for cancellation
 */
const updateOrderForCancellation = async (order, reason, refundResult, session) => {
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  order.cancellationNotes = refundResult 
    ? `Refund processed: ${refundResult.refundId}`
    : 'No refund required (COD order or payment not captured)';
  
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: 'user',
    reason: `User cancellation: ${reason}`
  });
  
  await order.save({ session });
  return order;
};

/**
 * Restore inventory for cancelled order
 */
const restoreInventory = async (items, session) => {
  for (const item of items) {
    const product = await Product.findOne({ productId: item.productId }).session(session);

    if (product) {
      if (typeof product.stock === 'number') {
        product.stock += item.quantity;
      }

      // if stock is object like { M: 5, L: 3 }
      else if (typeof product.stock === 'object' && product.stock !== null) {
        if (product.stock[item.size] !== undefined) {
          product.stock[item.size] += item.quantity;
        }
      }

      await product.save({ session });
    }
  }
};

/**
 * Admin: Process manual refund
 */
const processManualRefund = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { orderId, refundAmount, reason } = req.body;
    const adminId = req.admin.id;
    
    // Validate input
    if (!orderId || !refundAmount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, refund amount, and reason are required'
      });
    }
    
    // Find order
    const order = await Order.findOne({ 
      orderId,
      isDeleted: { $ne: true }
    }).session(session);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is eligible for refund
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be refunded. Current status: ${order.status}`
      });
    }
    
    // Check if already refunded
    if (order.refundDetails && order.refundDetails.refundStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been refunded'
      });
    }
    
    // Process refund
    const refundResult = await processRazorpayRefund(order, reason, session);
    
    // Update order status if not already cancelled
    if (order.status !== 'cancelled') {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        updatedBy: 'admin',
        reason: `Admin refund: ${reason}`
      });
      await order.save({ session });
    }
    
    await session.commitTransaction();
    
    // Log the admin action
    await logAction('admin_refund', {
      orderId: order.orderId,
      adminId,
      refundAmount,
      reason
    });
    
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundResult
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Manual refund error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the refund',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get refund status
 */
const getRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findOne({ 
      orderId, 
      userId,
      isDeleted: { $ne: true }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      refundDetails: order.refundDetails,
      orderStatus: order.status
    });
    
  } catch (error) {
    console.error('Get refund status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching refund status',
      error: error.message
    });
  }
};

/**
 * Admin: Get all refunds
 */
const getAllRefunds = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {
      'refundDetails.refundId': { $exists: true },
      isDeleted: { $ne: true }
    };
    
    if (status) {
      query['refundDetails.refundStatus'] = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ 'refundDetails.refundedAt': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      refunds: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching refunds',
      error: error.message
    });
  }
};

module.exports = {
  processOrderCancellation,
  processManualRefund,
  getRefundStatus,
  getAllRefunds
};