const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/check/stock', productController.checkStock);

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

// Admin routes (add auth middleware when ready)
router.post('/', productController.createOrUpdateProduct);
router.patch('/:productId/stock', productController.updateStock);

module.exports = router;
