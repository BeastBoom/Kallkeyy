const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Stock check (public, read-only)
router.get('/check/stock', productController.checkStock);

// Public routes (read-only)
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

// NOTE: Product creation, updates, and stock management are handled
// exclusively through the admin panel API (see routes/admin.js).
// No public mutation endpoints are exposed.

module.exports = router;
