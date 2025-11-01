const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  webhookHandler,
  getUserOrders,
  getOrderTracking,
  shiprocketWebhook
} = require('../controllers/paymentController');
const codController = require('../controllers/codController');

// Protected routes
router.post('/create-order', auth, createOrder);
router.post('/verify-payment', auth, verifyPayment);
router.post('/create-cod-order', auth, codController.createCODOrder);
router.get('/orders', auth, getUserOrders);
router.get('/orders/:orderId/tracking', auth, getOrderTracking);

// Webhooks (no auth required - verified by signature/IP)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
router.post('/shiprocket-webhook', shiprocketWebhook);

module.exports = router;
