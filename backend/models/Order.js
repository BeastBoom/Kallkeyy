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
    enum: ['created', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'created'
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
  trackingUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
