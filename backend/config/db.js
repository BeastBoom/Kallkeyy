const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // If connection is in progress, wait for it
    if (mongoose.connection.readyState === 2) {
      return new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      });
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Don't exit on error in serverless environments - just log and throw
    // The calling function will handle the error
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;
