const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createFounder() {
  try {
    // Connect to MongoDB Atlas
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI not found in environment variables');
      console.error('💡 Please ensure your .env file is configured properly');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.name);
    console.log('');

    // Check if founder already exists
    const existingFounder = await Admin.findOne({ role: 'founder' });
    if (existingFounder) {
      console.log('⚠️  Founder account already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Username:', existingFounder.username);
      console.log('Email:', existingFounder.email);
      console.log('Role:', existingFounder.role);
      console.log('Active:', existingFounder.isActive);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('Use these credentials to login at: http://localhost:3001');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create founder account
    const founder = new Admin({
      username: 'founder',
      email: 'founder@kallkeyy.com',
      password: 'Kallkeyykeliye1!', // Will be hashed automatically by pre-save hook
      fullName: 'Dhruv Gupta',
      role: 'founder',
      isActive: true
    });

    await founder.save();

    console.log('✅ Founder account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', founder.username);
    console.log('Email:', founder.email);
    console.log('Password:', 'Kallkeyykeliye1!');
    console.log('Role:', founder.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 You can now login at: http://localhost:3001');
    console.log('');
    console.log('Login Credentials:');
    console.log('  Username: founder');
    console.log('  Password: Kallkeyykeliye1!');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating founder:', error.message);
    if (error.code === 11000) {
      console.error('');
      console.error('Duplicate key error: An admin with this username or email already exists.');
      console.error('Try using different credentials or delete the existing admin first.');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

createFounder();

