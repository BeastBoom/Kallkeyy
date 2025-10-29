/**
 * Script to create the first founder admin account
 * Run this ONCE to create your initial admin account
 * 
 * Usage: node scripts/createFounder.js
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createFounder = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if founder already exists
    const existingFounder = await Admin.findOne({ role: 'founder' });

    if (existingFounder) {
      console.log('⚠️  A founder account already exists:');
      console.log(`   Username: ${existingFounder.username}`);
      console.log(`   Email: ${existingFounder.email}`);
      console.log(`   Full Name: ${existingFounder.fullName}`);
      console.log('\n💡 If you forgot your password, contact a developer to reset it.');
      process.exit(0);
    }

    // Create founder account
    const founder = new Admin({
      username: 'founder',
      email: 'founder@kallkeyy.com', // CHANGE THIS!
      password: 'Kallkeyy@2025', // CHANGE THIS IMMEDIATELY!
      fullName: 'KALLKEYY Founder',
      role: 'founder',
      isActive: true
    });

    await founder.save();

    console.log('\n🎉 Founder account created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Username: founder');
    console.log('   Email: founder@kallkeyy.com');
    console.log('   Password: Kallkeyy@2025');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Change the email and password IMMEDIATELY');
    console.log('   2. Login to admin portal at: http://localhost:5000/admin');
    console.log('   3. Create additional admin accounts from the admin panel');
    console.log('   4. Never share these credentials');
    console.log('\n✅ You can now login to the admin portal!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    process.exit(1);
  }
};

createFounder();

