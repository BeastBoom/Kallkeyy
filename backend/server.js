const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app FIRST
const app = express();

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

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      // In development, log blocked origins for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS: Origin not allowed:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
}));

// Middleware
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

  // Try to connect using cached connection pattern
  try {
    await connectDB();
  } catch (error) {
    console.error('⚠️ DB connection error in middleware:', error.message);
    // Continue anyway - let individual routes handle errors
  }
  
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

module.exports = app;

// const PORT = process.env.PORT || 5000;
// if (!process.env.VERCEL) {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Allowed origins:`, allowedOrigins);
//   });
// }
