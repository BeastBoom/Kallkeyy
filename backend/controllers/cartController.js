const Cart = require('../models/Cart');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Add item to cart (no reservation, just add)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, productName, size, quantity, price, image } = req.body;
    
    if (!productId || !productName || !size || !quantity || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [], savedForLater: [] });
    }
    
    // Check if item already exists (same product + size)
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.size === size
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        productName,
        size,
        quantity,
        price,
        image
      });
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.size === size
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(
      item => !(item.productId === productId && item.size === size)
    );
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Move item to "Save for Later"
exports.saveForLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.size === size
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Move item to savedForLater
    const item = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);
    
    // Check if already in savedForLater
    const savedIndex = cart.savedForLater.findIndex(
      saved => saved.productId === productId && saved.size === size
    );
    
    if (savedIndex > -1) {
      // Update quantity if already exists
      cart.savedForLater[savedIndex].quantity += item.quantity;
    } else {
      cart.savedForLater.push(item);
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item moved to Save for Later',
      cart
    });
  } catch (error) {
    console.error('Save for later error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save for later',
      error: error.message
    });
  }
};

// Move item from "Save for Later" back to cart
exports.moveToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item in savedForLater
    const savedIndex = cart.savedForLater.findIndex(
      item => item.productId === productId && item.size === size
    );
    
    if (savedIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in Save for Later'
      });
    }
    
    // Move item to cart
    const item = cart.savedForLater[savedIndex];
    cart.savedForLater.splice(savedIndex, 1);
    
    // Check if already in cart
    const cartIndex = cart.items.findIndex(
      cartItem => cartItem.productId === productId && cartItem.size === size
    );
    
    if (cartIndex > -1) {
      // Update quantity if already exists
      cart.items[cartIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item moved to cart',
      cart
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move to cart',
      error: error.message
    });
  }
};

// Remove item from "Save for Later"
exports.removeFromSaved = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.savedForLater = cart.savedForLater.filter(
      item => !(item.productId === productId && item.size === size)
    );
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from Save for Later',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};
