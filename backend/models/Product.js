const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['hoodie', 'tshirt'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  material: [{
    type: String
  }],
  stock: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  tag: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update inStock based on stock levels
productSchema.pre('save', function(next) {
  const hasStock = Object.values(this.stock).some(qty => qty > 0);
  this.inStock = hasStock;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
