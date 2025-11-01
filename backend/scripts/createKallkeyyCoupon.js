require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const connectDB = require('../config/db');

async function createKallkeyyCoupon() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: 'KALLKEYY10' });
    if (existingCoupon) {
      console.log('⚠️  Coupon KALLKEYY10 already exists');
      console.log('   ID:', existingCoupon._id);
      console.log('   Active:', existingCoupon.isActive);
      console.log('   Used:', existingCoupon.usedCount, 'times');
      return;
    }

    // Create the coupon
    const coupon = await Coupon.create({
      code: 'KALLKEYY10',
      name: 'KALLKEYY10 - First Time Purchase',
      description: '10% discount on overall bill for first-time customers',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 0,
      maxDiscountAmount: null, // No max limit
      usageLimit: null, // Unlimited uses (but first-time only rule applies)
      isActive: true,
      validFrom: new Date(),
      validUntil: null, // No expiration
      rules: {
        firstTimePurchaseOnly: true,
        oncePerAccount: true, // Also ensure once per account
        applyToShipping: false
      }
    });

    console.log('✅ Coupon KALLKEYY10 created successfully!');
    console.log('   Code:', coupon.code);
    console.log('   Discount:', coupon.discountValue + '%');
    console.log('   Rules: First-time purchase only, Once per account');
    console.log('   Status: Active');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    process.exit(1);
  }
}

createKallkeyyCoupon();

