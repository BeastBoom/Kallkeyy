/**
 * Centralized stock management for the Kallkeyy backend.
 * Handles stock validation, deduction, and restoration in one place.
 * Eliminates ~25-30 lines × 3-6 duplication across controllers.
 */

const Product = require('../models/Product');
const { isDevelopment, logCritical } = require('./helpers');

/**
 * Validate that all cart items have sufficient stock.
 * 
 * @param {Array} cartItems - Array of { productId, productName, size, quantity }
 * @returns {Promise<Array>} Array of unavailable items (empty if all available)
 */
async function validateStockAvailability(cartItems) {
  const unavailableItems = [];

  for (const item of cartItems) {
    const product = await Product.findOne({ productId: item.productId });

    if (!product) {
      unavailableItems.push({
        productName: item.productName,
        size: item.size,
        reason: 'Product no longer available'
      });
      continue;
    }

    const totalStock = product.stock[item.size] || 0;

    if (totalStock < item.quantity) {
      unavailableItems.push({
        productName: item.productName,
        size: item.size,
        requestedQuantity: item.quantity,
        availableQuantity: totalStock,
        reason: totalStock === 0 ? 'Out of stock' : `Only ${totalStock} available`
      });
    }
  }

  return unavailableItems;
}

/**
 * Deduct stock for each item in an order.
 * Uses atomic $inc to prevent race conditions.
 * Logs warnings if stock would go negative but still processes
 * (payment is already confirmed at this point).
 * 
 * @param {Array} orderItems - Array of { productId, productName, size, quantity }
 * @param {Object} [session] - Optional Mongoose session for transactions
 */
async function deductStock(orderItems, session = null) {
  for (const item of orderItems) {
    const queryOptions = session ? { session } : {};

    const product = await Product.findOne({ productId: item.productId }, null, queryOptions);

    if (!product) {
      if (isDevelopment) {
        console.error(`⚠️  Product ${item.productId} not found during stock deduction`);
      }
      continue;
    }

    const currentStock = product.stock[item.size] || 0;

    if (currentStock < item.quantity) {
      logCritical(
        `Insufficient stock for ${item.productId} size ${item.size} — ` +
        `Required: ${item.quantity}, Available: ${currentStock}. ` +
        `Order will proceed (payment confirmed), stock may go negative.`
      );
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { productId: item.productId },
      { $inc: { [`stock.${item.size}`]: -item.quantity } },
      { new: true, ...queryOptions }
    );

    // Recalculate inStock flag (pre-save hook doesn't fire on findOneAndUpdate)
    if (updatedProduct) {
      const hasStock = Object.values(updatedProduct.stock.toJSON ? updatedProduct.stock.toJSON() : updatedProduct.stock)
        .some(qty => qty > 0);
      if (updatedProduct.inStock !== hasStock) {
        await Product.findOneAndUpdate(
          { productId: item.productId },
          { inStock: hasStock, updatedAt: Date.now() },
          queryOptions
        );
      }
    }
  }
}

/**
 * Restore stock for each item in a cancelled order.
 * Uses atomic $inc for safety.
 * 
 * @param {Array} orderItems - Array of { productId, productName, size, quantity }
 * @param {Object} [session] - Optional Mongoose session for transactions
 */
async function restoreStock(orderItems, session = null) {
  for (const item of orderItems) {
    const queryOptions = session ? { session } : {};

    const product = await Product.findOne({ productId: item.productId }, null, queryOptions);

    if (!product) {
      console.warn(`⚠️  Product ${item.productId} not found during stock restoration`);
      continue;
    }

    if (product.stock && product.stock[item.size] !== undefined) {
      const updatedProduct = await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { [`stock.${item.size}`]: item.quantity } },
        { new: true, ...queryOptions }
      );

      // Recalculate inStock flag (pre-save hook doesn't fire on findOneAndUpdate)
      if (updatedProduct) {
        const hasStock = Object.values(updatedProduct.stock.toJSON ? updatedProduct.stock.toJSON() : updatedProduct.stock)
          .some(qty => qty > 0);
        if (updatedProduct.inStock !== hasStock) {
          await Product.findOneAndUpdate(
            { productId: item.productId },
            { inStock: hasStock, updatedAt: Date.now() },
            queryOptions
          );
        }
      }

      if (isDevelopment) {
        console.log(`✅ Restored ${item.quantity} units of size ${item.size} for product ${item.productId}`);
      }
    } else {
      console.warn(`⚠️  Size ${item.size} not found in product ${item.productId} stock`);
    }
  }
}

module.exports = {
  validateStockAvailability,
  deductStock,
  restoreStock
};
