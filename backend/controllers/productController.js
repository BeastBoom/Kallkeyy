const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Check product stock for specific size
exports.checkStock = async (req, res) => {
  try {
    const { productId, size } = req.query;
    
    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and size are required'
      });
    }
    
    const product = await Product.findOne({ productId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const stockQuantity = product.stock[size] || 0;
    
    res.status(200).json({
      success: true,
      inStock: stockQuantity > 0,
      quantity: stockQuantity,
      productId: product.productId,
      size
    });
  } catch (error) {
    console.error('Check stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock',
      error: error.message
    });
  }
};

// Update product stock (for admin)
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, quantity } = req.body;
    
    if (!size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Size and quantity are required'
      });
    }
    
    const product = await Product.findOne({ productId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.stock[size] = quantity;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Create or update product (for initialization)
exports.createOrUpdateProduct = async (req, res) => {
  try {
    const { productId, name, price, category, description, images, material, stock, tag } = req.body;
    
    let product = await Product.findOne({ productId });
    
    if (product) {
      // Update existing product
      Object.assign(product, { name, price, category, description, images, material, stock, tag });
      await product.save();
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product
      });
    } else {
      // Create new product
      product = await Product.create({
        productId, name, price, category, description, images, material, stock, tag
      });
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    }
  } catch (error) {
    console.error('Create/Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update product',
      error: error.message
    });
  }
};
