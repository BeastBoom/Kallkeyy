const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  webhookHandler,
  shiprocketWebhook
} = require('../controllers/paymentController');
const codController = require('../controllers/codController');

// Protected routes
router.post('/create-order', auth, createOrder);
router.post('/verify-payment', auth, verifyPayment);
router.post('/create-cod-order', auth, codController.createCODOrder);

// NOTE: getUserOrders and getOrderTracking have been removed.
// Use /api/orders and /api/orders/:id/tracking routes instead (see routes/orders.js).

// Webhooks (no auth required - verified by signature/IP)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
router.post('/shiprocket-webhook', shiprocketWebhook);

module.exports = router;
