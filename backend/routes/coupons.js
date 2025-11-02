const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateCoupon, getAvailableCoupons } = require('../controllers/couponController');

// Protected routes
router.get('/available', auth, getAvailableCoupons);
router.post('/validate', auth, validateCoupon);

module.exports = router;

