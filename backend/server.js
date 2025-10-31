const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app FIRST
const app = express();
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
  'https://kallkeyy.com',
  'https://www.kallkeyy.com',
  'https://kallkeyy.vercel.app',
  'https://kallkeyy-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:3001',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ADMIN_PANEL_URL) {
  allowedOrigins.push(process.env.ADMIN_PANEL_URL);
}

const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/.*\.kallkeyy\.com$/
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
}

// Helper function to set CORS headers (used everywhere)
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
  } else if (origin && process.env.NODE_ENV === 'development') {
    // Debug logging in development
    console.log('CORS: Origin not allowed:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
  }
}

// ===== CRITICAL: CORS MUST BE FIRST =====
app.use((req, res, next) => {
  try {
    setCorsHeaders(req, res);

    // Handle OPTIONS immediately - BEFORE routes
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  } catch (error) {
    // Even if CORS fails, set headers and continue
    console.error('CORS middleware error:', error);
    setCorsHeaders(req, res);
    next();
  }
});

// Middleware AFTER CORS
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure mongoose connection is ready before handling requests
// This middleware checks DB connection and waits if needed (skip health check)
app.use(async (req, res, next) => {
  // Skip health check - it should work even without DB
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // Check if mongoose is connected
  const readyState = mongoose.connection.readyState;
  
  if (readyState === 0 || readyState === 3) {
    // Disconnected or disconnecting - try to connect
    try {
      // Start connection (don't await if on Vercel to avoid blocking)
      if (!process.env.VERCEL) {
        // Local: wait for connection
        await connectDB();
      } else {
        // Vercel: start connection in background (non-blocking)
        // Mongoose will queue operations automatically
        connectDB().catch(err => {
          console.error('❌ Background DB connection error:', err.message);
        });
        // Give it a moment to start connecting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('❌ Database connection error in middleware:', error.message);
      // Continue anyway - mongoose will queue operations
    }
  } else if (readyState === 2) {
    // Connecting - just wait a bit (connection is in progress)
    // Mongoose will handle queued operations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Always continue - mongoose can queue operations if not connected
  next();
});

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
  res.status(200).json({ success: true, message: 'API root' });
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

// Error handling - ALWAYS set CORS headers before responding
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // CRITICAL: Set CORS headers before error response
  setCorsHeaders(req, res);
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler - ALWAYS set CORS headers
app.use((req, res) => {
  setCorsHeaders(req, res);
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to database (non-blocking for Vercel)
// Don't block server startup if DB connection fails on Vercel
if (process.env.VERCEL) {
  // On Vercel, connect but don't block - mongoose will retry automatically
  connectDB().catch(err => {
    console.error('❌ Database connection failed (non-blocking):', err.message);
    console.log('💡 MongoDB will retry connection on next request');
  });
} else {
  // On local, connect normally
  connectDB();
}

module.exports = app;

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed origins:`, allowedOrigins);
  });
}
