const Product = require('../models/Product');
const { setCorsHeaders } = require('../utils/responseHelper');

// Get all products (public, read-only)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID (public, read-only)
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });
    
    if (!product) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Check product stock for specific size (public, read-only)
exports.checkStock = async (req, res) => {
  try {
    const { productId, size } = req.query;
    
    if (!productId || !size) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Product ID and size are required'
      });
    }
    
    const product = await Product.findOne({ productId });
    
    if (!product) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const stockQuantity = product.stock[size] || 0;
    
    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      inStock: stockQuantity > 0,
      quantity: stockQuantity,
      productId: product.productId,
      size
    });
  } catch (error) {
    console.error('Check stock error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock',
      error: error.message
    });
  }
};

// NOTE: createOrUpdateProduct and updateStock have been removed.
// All product mutations are handled exclusively through the admin API
// (see controllers/adminProductController.js and routes/admin.js).
