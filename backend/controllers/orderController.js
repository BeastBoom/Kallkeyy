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

// @desc    Cancel an order
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

    // Check if order can be cancelled (only pending or processing orders)
    if (order.status !== "pending" && order.status !== "processing") {
      setCorsHeaders(req, res);
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Update order status
    order.status = "cancelled";
    order.cancelledAt = Date.now();

    await order.save();

    // TODO: Restore product stock if needed
    // for (const item of order.items) {
    //   await Product.findByIdAndUpdate(item.product, {
    //     $inc: { [`sizes.${item.size}.stock`]: item.quantity },
    //   });
    // }

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

