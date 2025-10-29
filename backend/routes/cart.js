const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  saveForLater,
  moveToCart,
  removeFromSaved
} = require('../controllers/cartController');
const {
  validateCartStock,
  validateItemStock
} = require('../controllers/stockValidationController');

// All routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

// Save for Later routes
router.post('/save-for-later', saveForLater);
router.post('/move-to-cart', moveToCart);
router.delete('/remove-saved', removeFromSaved);

// Stock validation routes
router.post('/validate', validateCartStock);
router.post('/validate-item', validateItemStock);

module.exports = router;
