const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Cache connection for serverless (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Set global mongoose buffer timeout (default is 10s, increase to 30s)
mongoose.set('bufferTimeoutMS', 30000);

const connectDB = async () => {
  try {
    // If already connected, return cached connection
    if (cached.conn) {
      console.log('✅ MongoDB using cached connection');
      return cached.conn;
    }

    // If connection is in progress, wait for it
    if (!cached.promise) {
      const opts = {
        serverSelectionTimeoutMS: 10000, // Timeout after 10s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        connectTimeoutMS: 10000, // Connection timeout
        bufferCommands: false, // Disable buffering for serverless
        bufferMaxEntries: 0, // Disable mongoose buffering limit (0 = unlimited)
      };

      cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ MongoDB Atlas Connected:', mongoose.connection.host);
        console.log('📊 Database:', mongoose.connection.name);
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Please check your MONGODB_URI in .env file');
    
    // Don't exit process on Vercel - let it retry on next request
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    
    // Re-throw error so it can be caught by caller
    throw error;
  }
};

// Connection event handlers for better monitoring
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

module.exports = connectDB;
