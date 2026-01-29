const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getUserOrders,
  getOrderById,
  requestReturn,
  cancelOrder,
} = require("../controllers/orderController");
const { getOrderTracking } = require("../controllers/paymentController");
const { createCODTokenOrder, verifyCODTokenPayment } = require("../controllers/codTokenController");

// @route   GET /api/orders
// @desc    Get all orders for logged in user
// @access  Private
router.get("/", auth, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", auth, getOrderById);

// @route   POST /api/orders/:id/return
// @desc    Request a return for an order
// @access  Private
router.post("/:id/return", auth, requestReturn);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put("/:id/cancel", auth, cancelOrder);

// @route   GET /api/orders/:id/tracking
// @desc    Get order tracking information
// @access  Private
router.get("/:id/tracking", auth, getOrderTracking);

// @route   POST /api/orders/create-cod-token-order
// @desc    Create COD token order (₹100) through Razorpay
// @access  Private
router.post("/create-cod-token-order", auth, createCODTokenOrder);

// @route   POST /api/orders/verify-cod-token-payment
// @desc    Verify COD token payment and create actual COD order
// @access  Private
router.post("/verify-cod-token-payment", auth, verifyCODTokenPayment);

module.exports = router;

