const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const {
  getUserOrders,
  getOrderById,
  requestReturn,
  cancelOrder,
} = require("../controllers/orderController");
const { getOrderTracking } = require("../controllers/paymentController");
const { createCODTokenOrder, verifyCODTokenPayment } = require("../controllers/codTokenController");

// ─── Static routes MUST come before parameterized /:id routes ───

// @route   GET /api/orders
// @desc    Get all orders for logged in user
// @access  Private
router.get("/", auth, getUserOrders);

// @route   POST /api/orders/create-cod-token-order
// @desc    Create COD token order (₹100) through Razorpay
// @access  Private
router.post("/create-cod-token-order", auth, createCODTokenOrder);

// @route   POST /api/orders/verify-cod-token-payment
// @desc    Verify COD token payment and create actual COD order
// @access  Private
router.post("/verify-cod-token-payment", auth, verifyCODTokenPayment);

// ─── Parameterized routes ───
// Middleware to validate :id is a valid MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }
  next();
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", auth, validateObjectId, getOrderById);

// @route   POST /api/orders/:id/return
// @desc    Request a return for an order
// @access  Private
router.post("/:id/return", auth, validateObjectId, requestReturn);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put("/:id/cancel", auth, validateObjectId, cancelOrder);

// @route   GET /api/orders/:id/tracking
// @desc    Get order tracking information
// @access  Private
router.get("/:id/tracking", auth, validateObjectId, getOrderTracking);

module.exports = router;

