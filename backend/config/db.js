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

    // Use MONGODB_URI as-is - don't force a database name
    // MongoDB will use the database name from URI or default to 'test'
    let mongoUri = process.env.MONGODB_URI;
    
    // Only add query parameters if they don't exist
    if (mongoUri && !mongoUri.includes('retryWrites')) {
      const separator = mongoUri.includes('?') ? '&' : '?';
      mongoUri = `${mongoUri}${separator}retryWrites=true&w=majority`;
    }

    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    const connectedDbName = conn.connection.db?.databaseName || conn.connection.name || 'unknown';
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Connected to database: ${connectedDbName}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Don't exit on error in serverless environments - just log and throw
    // The calling function will handle the error
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;
