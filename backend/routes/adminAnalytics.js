const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalyticsController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Dashboard analytics
router.get('/dashboard', authenticateAdmin, adminAnalyticsController.getDashboardAnalytics);

// Payment reconciliation
router.get('/reconciliation', authenticateAdmin, adminAnalyticsController.getPaymentReconciliation);

// Inventory report
router.get('/inventory', authenticateAdmin, adminAnalyticsController.getInventoryReport);

// Refund analytics
router.get('/refunds', authenticateAdmin, adminAnalyticsController.getRefundAnalytics);

// Manual order reconciliation
router.post('/reconcile/:orderId', authenticateAdmin, adminAnalyticsController.reconcileOrders);

module.exports = router;