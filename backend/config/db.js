const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Don't reconnect if already connected or connecting
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      console.log('✅ MongoDB already connected/connecting');
      return;
    }

    // MongoDB Atlas connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: true, // Buffer commands when not connected (default: true)
      bufferMaxEntries: 0, // Disable mongoose buffering limit (0 = unlimited)
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB Atlas Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);

    // Connection event handlers for better monitoring
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
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

module.exports = connectDB;
