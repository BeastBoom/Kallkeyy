const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  webhookHandler,
  getUserOrders
} = require('../controllers/paymentController');

// Protected routes
router.post('/create-order', auth, createOrder);
router.post('/verify-payment', auth, verifyPayment);
router.get('/orders', auth, getUserOrders);

// Webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

module.exports = router;
