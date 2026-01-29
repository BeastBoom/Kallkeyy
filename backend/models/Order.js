const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  size: String,
  quantity: Number,
  price: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'confirmed', 'paid', 'failed', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'return_requested'],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod_token'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  awbCode: String,
  courierName: String,
  trackingUrl: String,
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String
  },
  returnComments: {
    type: String
  },
  returnRequestedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  notes: [{
    type: String
  }],
  // 24-hour cancellation window fields
  cancellationWindowEndsAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from creation
    }
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      enum: ['user', 'admin', 'shiprocket', 'system'],
      default: 'system'
    },
    reason: String
  }],
  coupon: {
    code: String,
    name: String,
    discountType: String,
    discountValue: Number,
    discountAmount: Number
  },
  // Refund tracking fields
  refundDetails: {
    refundId: String,
    refundAmount: Number, // in paise
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'completed'],
      default: 'pending'
    },
    refundReason: String,
    refundedAt: Date,
    refundNotes: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
