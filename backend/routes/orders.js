const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getUserOrders,
  getOrderById,
  requestReturn,
  cancelOrder,
} = require("../controllers/orderController");

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

module.exports = router;

