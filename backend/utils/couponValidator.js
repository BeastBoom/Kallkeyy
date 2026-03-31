/**
 * Shared coupon validation and discount calculation.
 * Extracted from paymentController, codController, codTokenController, couponController
 * to eliminate ~70 lines × 4 duplication.
 */

const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

/**
 * Validate a coupon code and calculate the discount amount.
 * 
 * @param {string} couponCode - The coupon code to validate
 * @param {number} baseAmount - The cart total before discount
 * @param {string} userId - The user's ID (for per-user rules)
 * @returns {Promise<{ couponData: object|null, discountAmount: number }>}
 * @throws {Object} { status: number, message: string } on validation failure
 */
async function validateAndCalculateDiscount(couponCode, baseAmount, userId) {
  // No coupon provided — return zero discount
  if (!couponCode || !couponCode.trim()) {
    return { couponData: null, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase().trim(),
    isActive: true
  });

  if (!coupon) {
    throw { status: 400, message: 'Invalid coupon code' };
  }

  // Check if coupon is expired
  if (coupon.validUntil && new Date() > coupon.validUntil) {
    throw { status: 400, message: 'This coupon has expired' };
  }

  // Check if coupon is valid yet
  if (coupon.validFrom && new Date() < coupon.validFrom) {
    throw { status: 400, message: 'This coupon is not yet valid' };
  }

  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw { status: 400, message: 'This coupon has reached its usage limit' };
  }

  // Check minimum purchase amount
  if (baseAmount < coupon.minPurchaseAmount) {
    throw { status: 400, message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} is required for this coupon` };
  }

  // Check first-time purchase rule
  if (coupon.rules.firstTimePurchaseOnly) {
    const existingOrders = await Order.countDocuments({
      userId: userId,
      paymentStatus: 'completed'
    });

    if (existingOrders > 0) {
      throw { status: 400, message: 'This coupon is valid only for first-time purchases' };
    }
  }

  // Check once per account rule
  if (coupon.rules.oncePerAccount) {
    const hasUsedCoupon = coupon.usedBy.some(
      usage => usage.userId.toString() === userId.toString()
    );

    if (hasUsedCoupon) {
      throw { status: 400, message: 'You have already used this coupon' };
    }
  }

  // Calculate discount
  let discountAmount = 0;

  if (coupon.discountType === 'percentage') {
    discountAmount = (baseAmount * coupon.discountValue) / 100;
    // Apply max discount limit if set
    if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // Fixed discount
    discountAmount = coupon.discountValue;
    // Don't allow discount more than cart total
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }
  }

  const couponData = {
    code: coupon.code,
    name: coupon.name,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: discountAmount
  };

  return { couponData, discountAmount };
}

module.exports = {
  validateAndCalculateDiscount
};
