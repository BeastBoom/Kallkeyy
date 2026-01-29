const express = require('express');
const router = express.Router();
const { 
  processOrderCancellation, 
  processManualRefund, 
  getRefundStatus, 
  getAllRefunds 
} = require('../controllers/refundController');
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// User routes
router.post('/cancel', auth, processOrderCancellation);
router.get('/status/:orderId', auth, getRefundStatus);

// Admin routes
router.post('/admin/refund', adminAuth, processManualRefund);
router.get('/admin/all', adminAuth, getAllRefunds);

module.exports = router;