const express = require('express');
const router = express.Router();
const { adminAuth, checkRole } = require('../middleware/adminAuth');

// Import controllers
const adminAuthController = require('../controllers/adminAuthController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminProductController = require('../controllers/adminProductController');
const adminUserController = require('../controllers/adminUserController');
const adminOrderController = require('../controllers/adminOrderController');
const adminSubscriberController = require('../controllers/adminSubscriberController');
const adminCouponController = require('../controllers/adminCouponController');

// ==========================================
// AUTH ROUTES (No authentication required)
// ==========================================
router.post('/auth/login', adminAuthController.adminLogin);
router.post('/auth/logout', adminAuthController.adminLogout);
router.get('/auth/verify-cookie', adminAuthController.verifyAdminCookie);

// ==========================================
// ADMIN MANAGEMENT (Founder/Developer only)
// ==========================================
router.post('/admins', adminAuth, checkRole('founder', 'developer'), adminAuthController.createAdmin);
router.get('/admins', adminAuth, checkRole('founder', 'developer'), adminAuthController.listAdmins);
router.put('/admins/:adminId/deactivate', adminAuth, checkRole('founder'), adminAuthController.deactivateAdmin);
router.get('/auth/me', adminAuth, adminAuthController.getCurrentAdmin);

// ==========================================
// DASHBOARD ANALYTICS (All admins)
// ==========================================
router.get('/dashboard/overview', adminAuth, adminDashboardController.getDashboardOverview);
router.get('/dashboard/cart-analytics', adminAuth, adminDashboardController.getCartAnalytics);
router.get('/dashboard/product-analytics', adminAuth, adminDashboardController.getProductAnalytics);
router.get('/dashboard/user-analytics', adminAuth, adminDashboardController.getUserAnalytics);
router.get('/dashboard/order-analytics', adminAuth, adminDashboardController.getOrderAnalytics);

// ==========================================
// PRODUCT MANAGEMENT (All admins)
// ==========================================
router.get('/products', adminAuth, adminProductController.getAllProducts);
router.get('/products/:productId', adminAuth, adminProductController.getProductById);
router.post('/products', adminAuth, adminProductController.createProduct);
router.put('/products/:productId', adminAuth, adminProductController.updateProduct);
router.put('/products/:productId/stock', adminAuth, adminProductController.updateStock);
router.post('/products/bulk-stock-update', adminAuth, adminProductController.bulkUpdateStock);
router.delete('/products/:productId', adminAuth, checkRole('founder', 'developer'), adminProductController.deleteProduct);

// ==========================================
// USER MANAGEMENT (All admins)
// ==========================================
router.get('/users', adminAuth, adminUserController.getAllUsers);
router.get('/users/:userId', adminAuth, adminUserController.getUserDetails);
router.put('/users/:userId', adminAuth, adminUserController.updateUser);
router.delete('/users/:userId', adminAuth, checkRole('founder', 'developer'), adminUserController.deleteUser);
router.get('/users/export/csv', adminAuth, adminUserController.exportUsers);

// ==========================================
// ORDER MANAGEMENT (All admins)
// ==========================================
router.get('/orders', adminAuth, adminOrderController.getAllOrders);
router.get('/orders/:orderId', adminAuth, adminOrderController.getOrderDetails);
router.put('/orders/:orderId/status', adminAuth, adminOrderController.updateOrderStatus);
router.put('/orders/:orderId/shipping', adminAuth, adminOrderController.updateShippingDetails);
router.put('/orders/:orderId/cancel', adminAuth, adminOrderController.cancelOrder);
router.get('/orders/stats/overview', adminAuth, adminOrderController.getOrderStatistics);
router.get('/orders/export/csv', adminAuth, adminOrderController.exportOrders);

// ==========================================
// SUBSCRIBER MANAGEMENT (All admins)
// ==========================================
router.get('/subscribers', adminAuth, adminSubscriberController.getAllSubscribers);
router.get('/subscribers/stats', adminAuth, adminSubscriberController.getSubscriberStats);
router.post('/subscribers', adminAuth, adminSubscriberController.addSubscriber);
router.put('/subscribers/:id/toggle', adminAuth, adminSubscriberController.toggleSubscriberStatus);
router.delete('/subscribers/:id', adminAuth, adminSubscriberController.deleteSubscriber);
router.delete('/subscribers/bulk/inactive', adminAuth, checkRole('founder', 'developer'), adminSubscriberController.bulkDeleteInactive);
router.get('/subscribers/export/csv', adminAuth, adminSubscriberController.exportSubscribers);

// ==========================================
// COUPON MANAGEMENT (All admins)
// ==========================================
router.get('/coupons', adminAuth, adminCouponController.getAllCoupons);
router.get('/coupons/:couponId', adminAuth, adminCouponController.getCouponDetails);
router.post('/coupons', adminAuth, adminCouponController.createCoupon);
router.put('/coupons/:couponId', adminAuth, adminCouponController.updateCoupon);
router.delete('/coupons/:couponId', adminAuth, adminCouponController.deleteCoupon);
router.put('/coupons/:couponId/toggle-status', adminAuth, adminCouponController.toggleCouponStatus);

module.exports = router;

