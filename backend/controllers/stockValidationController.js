const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { setCorsHeaders } = require('../utils/responseHelper');

// Helper function to get available stock (total stock minus reserved)
const getAvailableStock = async (productId, size) => {
  try {
    const product = await Product.findOne({ productId });
    if (!product) return 0;
    
    const totalStock = product.stock[size] || 0;
    // For now, just return total stock (can be enhanced with reservation logic later)
    return totalStock;
  } catch (error) {
    console.error('Error getting available stock:', error);
    return 0;
  }
};

/**
 * Validate cart items against current stock before checkout
 * Returns stock status for each item (don't remove from cart)
 */
exports.validateCartStock = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      setCorsHeaders(req, res);
      return res.status(200).json({
        success: true,
        allItemsAvailable: true,
        itemsWithStock: []
      });
    }

    const itemsWithStock = [];

    // Check each item's availability
    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      
      if (!product) {
        // Product doesn't exist anymore
        itemsWithStock.push({
          ...item.toObject(),
          inStock: false,
          availableQuantity: 0,
          reason: 'Product no longer available'
        });
        continue;
      }

      const totalStock = product.stock[item.size] || 0;

      // Check if stock is sufficient for this item
      const inStock = totalStock >= item.quantity;

      itemsWithStock.push({
        ...item.toObject(),
        inStock,
        availableQuantity: totalStock,
        reason: inStock 
          ? 'In stock' 
          : totalStock === 0 
          ? 'Out of stock' 
          : `Only ${totalStock} available`
      });
    }

    // Check if all items are available
    const allItemsAvailable = itemsWithStock.every(item => item.inStock);

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      allItemsAvailable,
      itemsWithStock
    });

  } catch (error) {
    console.error('Cart stock validation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart stock',
      error: error.message
    });
  }
};

/**
 * Validate individual item stock before adding/updating cart
 */
exports.validateItemStock = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      setCorsHeaders(req, res);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const product = await Product.findOne({ productId });
    
    if (!product) {
      setCorsHeaders(req, res);
      return res.status(404).json({
        success: false,
        isAvailable: false,
        message: 'Product not found'
      });
    }

    const totalStock = product.stock[size] || 0;
    const availableStock = await getAvailableStock(productId, size);

    const isAvailable = availableStock >= quantity;

    setCorsHeaders(req, res);
    res.status(200).json({
      success: true,
      isAvailable,
      totalStock,
      availableStock,
      requestedQuantity: quantity
    });

  } catch (error) {
    console.error('Item stock validation error:', error);
    setCorsHeaders(req, res);
    res.status(500).json({
      success: false,
      message: 'Failed to validate item stock',
      error: error.message
    });
  }
};

module.exports = exports;

