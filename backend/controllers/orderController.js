const Order = require("../models/Order");
const Product = require("../models/Product");
const { setCorsHeaders } = require('../utils/responseHelper');

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    setCorsHeaders(req, res);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      setCorsHeaders(req, res);
      return res.status(404).json({ message: "Order not found" });
    }

    // Make sure user can only see their own order
    if (order.userId.toString() !== req.user._id.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    setCorsHeaders(req, res);
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: "Server error fetching order" });
  }
};

// @desc    Request a return for an order
// @route   POST /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res) => {
  try {
    const { reason, comments } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      setCorsHeaders(req, res);
      return res.status(404).json({ message: "Order not found" });
    }

    // Make sure user can only request return for their own order
    if (order.userId.toString() !== req.user._id.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is eligible for return
    if (order.status === "cancelled" || order.status === "returned") {
      setCorsHeaders(req, res);
      return res.status(400).json({ message: "Order is not eligible for return" });
    }

    // Check if order was delivered within return window (e.g., 7 days)
    if (order.status === "delivered") {
      const deliveryDate = order.deliveredAt || order.updatedAt;
      const daysSinceDelivery = Math.floor(
        (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceDelivery > 7) {
        setCorsHeaders(req, res);
        return res.status(400).json({
          message: "Return window has expired. Returns are only accepted within 7 days of delivery.",
        });
      }
    }

    // Update order with return request
    order.returnRequested = true;
    order.returnReason = reason;
    order.returnComments = comments;
    order.returnRequestedAt = Date.now();
    order.status = "return_requested";

    await order.save();

    setCorsHeaders(req, res);
    res.json({
      message: "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error("Error requesting return:", error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: "Server error processing return request" });
  }
};

// @desc    Cancel an order with refund processing
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      setCorsHeaders(req, res);
      return res.status(404).json({ message: "Order not found" });
    }

    // Make sure user can only cancel their own order
    if (order.userId.toString() !== req.user._id.toString()) {
      setCorsHeaders(req, res);
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order can be cancelled (only pending, confirmed, or processing orders)
    if (order.status !== "pending" && order.status !== "confirmed" && order.status !== "processing") {
      setCorsHeaders(req, res);
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Check 24-hour cancellation window
    const now = new Date();
    const cancellationWindowEnds = order.cancellationWindowEndsAt || new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000);
    
    if (now > cancellationWindowEnds) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        message: "24-hour cancellation window has expired. Please contact support for assistance.",
        cancellationWindowEndsAt: cancellationWindowEnds
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      setCorsHeaders(req, res);
      return res.status(400).json({
        message: "Order has already been cancelled",
        order
      });
    }

    // Check if payment was successful for refund processing
    const isPaymentSuccessful = order.paymentStatus === 'completed' && order.status === 'paid';
    
    // If payment was successful, redirect to refund endpoint
    if (isPaymentSuccessful) {
      req.body = { orderId: order.orderId, reason: "User cancelled order" };
      return require('./refundController').processOrderCancellation(req, res);
    }


    // For COD orders or failed payments, proceed with regular cancellation
    // Cancel Shiprocket order if it exists
    if (order.shiprocketOrderId) {
      console.log(`🔄 Attempting to cancel Shiprocket order for order: ${order.orderId}`);
      console.log(`   Shiprocket Order ID: ${order.shiprocketOrderId}`);
      console.log(`   Order Status: ${order.status}`);
      
      // Check if order can be cancelled via Shiprocket API
      // Shiprocket only allows cancellation for orders in "pending" or "confirmed" status
      // Orders in "processing" status (picked up) cannot be cancelled via API
      if (order.status === 'processing') {
        console.log(`⚠️  Order status is 'processing' - cannot cancel via Shiprocket API`);
        console.log(`ℹ️  Order will be cancelled in our system but Shiprocket order remains active`);
        
        // Log this for admin review
        try {
          await Order.findByIdAndUpdate(order._id, {
            $push: {
              notes: `Order status is 'processing' - Shiprocket cancellation not allowed via API. Manual cancellation required in Shiprocket dashboard.`
            }
          });
          console.log(`📝 Note added to order: ${order.orderId}`);
        } catch (noteError) {
          console.error(`❌ Failed to log status note:`, noteError.message);
        }
      } else {
        // Order can be cancelled via Shiprocket API
        try {
          const { cancelShiprocketOrder } = require('./paymentController');
          console.log(`   Calling cancelShiprocketOrder function...`);
          
          const result = await cancelShiprocketOrder(order.shiprocketOrderId);
          console.log(`✅ Shiprocket order cancelled successfully for order: ${order.orderId}`);
          console.log(`   Shiprocket Response:`, result);
        } catch (shiprocketError) {
          console.error(`❌ Failed to cancel Shiprocket order for order ${order.orderId}:`);
          console.error(`   Error Type: ${shiprocketError.constructor.name}`);
          console.error(`   Error Message: ${shiprocketError.message}`);
          console.error(`   Error Stack:`, shiprocketError.stack);
          
          if (shiprocketError.response) {
            console.error(`   Shiprocket Response Status: ${shiprocketError.response.status}`);
            console.error(`   Shiprocket Response Data:`, shiprocketError.response.data);
          }
          
          // Don't fail the order cancellation if Shiprocket cancellation fails
          // Log the error for admin review
          try {
            await Order.findByIdAndUpdate(order._id, {
              $push: {
                notes: `Shiprocket cancellation failed: ${shiprocketError.message}. Manual cancellation required.`
              }
            });
            console.log(`📝 Error logged to order notes for order: ${order.orderId}`);
          } catch (noteError) {
            console.error(`❌ Failed to log error to order notes:`, noteError.message);
          }
        }
      }
    } else {
      console.log(`ℹ️  No Shiprocket order ID found for order: ${order.orderId}`);
    }

    // Update order status for non-refundable orders
    order.status = "cancelled";
    order.cancelledAt = Date.now();
    order.cancellationReason = req.body.reason || 'User cancelled order';
    order.cancellationNotes = 'No refund required (COD order or payment not captured)';
    
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: 'user',
      reason: `User cancellation: ${order.cancellationReason}`
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (product) {
        // Check if the size exists in the stock object
        if (product.stock && product.stock[item.size] !== undefined) {
          product.stock[item.size] += item.quantity;
          await product.save();
          console.log(`✅ Restored ${item.quantity} units of size ${item.size} for product ${item.productId}`);
        } else {
          console.warn(`⚠️  Size ${item.size} not found in product ${item.productId} stock`);
        }
      } else {
        console.warn(`⚠️  Product ${item.productId} not found during stock restoration`);
      }
    }

    setCorsHeaders(req, res);
    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    setCorsHeaders(req, res);
    res.status(500).json({ message: "Server error cancelling order" });
  }
};

