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
    enum: ['razorpay', 'cod'],
    default: 'razorpay'
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
  coupon: {
    code: String,
    name: String,
    discountType: String,
    discountValue: Number,
    discountAmount: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
