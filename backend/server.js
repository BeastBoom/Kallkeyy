const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const connectDB = require('./config/db');

// Initialize express app
const app = express();
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
  'https://kallkeyy.com',
  'https://www.kallkeyy.com',
  'https://kallkeyy.vercel.app',
  'https://kallkeyy-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.ADMIN_PANEL_URL) allowedOrigins.push(process.env.ADMIN_PANEL_URL);

const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/.*\.kallkeyy\.com$/
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
}

// CORS MUST BE FIRST - Handle ALL responses including errors
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle OPTIONS immediately before ANY other middleware
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Middleware AFTER CORS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database AFTER app setup
connectDB();

// Routes
const subscriberRoutes = require('./routes/subscribers');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const otpRoutes = require('./routes/otp');
const addressRoutes = require('./routes/address');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Kallkeyy API - v1.0', health: '/api/health' });
});

app.use('/api/subscribers', subscriberRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Export for Vercel
module.exports = app;

// Start locally
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
  });
}
