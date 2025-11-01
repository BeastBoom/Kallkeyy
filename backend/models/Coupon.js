const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null, // null means no max limit
    min: 0
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: 0
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null // null means no expiration
  },
  rules: {
    firstTimePurchaseOnly: {
      type: Boolean,
      default: false
    },
    oncePerAccount: {
      type: Boolean,
      default: false
    },
    applyToShipping: {
      type: Boolean,
      default: false // Discount on shipping charges
    }
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  if (this.validUntil && new Date() > this.validUntil) {
    return true;
  }
  return false;
});

// Virtual to check if usage limit reached
couponSchema.virtual('isUsageLimitReached').get(function() {
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return true;
  }
  return false;
});

module.exports = mongoose.model('Coupon', couponSchema);

