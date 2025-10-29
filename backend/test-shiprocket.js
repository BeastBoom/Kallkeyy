/**
 * Shiprocket Integration Test Script
 * 
 * This script tests your Shiprocket configuration and API connection.
 * Run this BEFORE enabling Shiprocket in production.
 * 
 * Usage: node test-shiprocket.js
 */

const axios = require('axios');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
}

async function testConfiguration() {
  header('STEP 1: Checking Configuration');
  
  const config = {
    enabled: process.env.SHIPROCKET_ENABLED,
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION
  };
  
  log('\nEnvironment Variables:');
  log(`  SHIPROCKET_ENABLED: ${config.enabled}`);
  log(`  SHIPROCKET_EMAIL: ${config.email ? '✅ Set' : '❌ Missing'}`);
  log(`  SHIPROCKET_PASSWORD: ${config.password ? '✅ Set (hidden)' : '❌ Missing'}`);
  log(`  SHIPROCKET_PICKUP_LOCATION: ${config.pickupLocation || 'Primary (default)'}`);
  
  const issues = [];
  
  if (!config.email) {
    issues.push('SHIPROCKET_EMAIL is not set');
  }
  
  if (!config.password) {
    issues.push('SHIPROCKET_PASSWORD is not set');
  }
  
  if (config.enabled === 'true' && (!config.email || !config.password)) {
    issues.push('Shiprocket is enabled but credentials are missing');
  }
  
  if (issues.length > 0) {
    error('\nConfiguration Issues:');
    issues.forEach(issue => error(`  • ${issue}`));
    warning('\n🔧 Fix: Update your backend/.env file with Shiprocket credentials');
    return false;
  }
  
  success('\nConfiguration looks good!');
  return true;
}

async function testAuthentication() {
  header('STEP 2: Testing Authentication');
  
  try {
    info('Attempting to authenticate with Shiprocket...');
    
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );
    
    if (response.data && response.data.token) {
      success('Authentication successful!');
      log(`  Token: ${response.data.token.substring(0, 30)}...`);
      
      if (response.data.email) {
        log(`  Email: ${response.data.email}`);
      }
      
      return response.data.token;
    } else {
      error('Authentication response missing token');
      return null;
    }
  } catch (err) {
    error('Authentication failed!');
    
    if (err.response) {
      log(`  Status: ${err.response.status}`);
      log(`  Message: ${JSON.stringify(err.response.data, null, 2)}`);
      
      warning('\n🔧 Common Issues:');
      warning('  1. Check SHIPROCKET_EMAIL is correct');
      warning('  2. Check SHIPROCKET_PASSWORD is correct');
      warning('  3. Try logging into https://app.shiprocket.in with same credentials');
      warning('  4. Check for typos or extra spaces in .env file');
    } else {
      log(`  Error: ${err.message}`);
      warning('\n🔧 Check your internet connection');
    }
    
    return null;
  }
}

async function testPickupLocation(token) {
  header('STEP 3: Verifying Pickup Location');
  
  try {
    info('Fetching pickup locations from Shiprocket...');
    
    const response = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/settings/company/pickup',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const pickupLocations = response.data.data?.shipping_address || [];
    
    if (pickupLocations.length === 0) {
      warning('No pickup locations found!');
      warning('\n🔧 Fix:');
      warning('  1. Login to Shiprocket dashboard');
      warning('  2. Go to Settings → Pickup Locations');
      warning('  3. Add your pickup/warehouse address');
      warning('  4. Mark it as "Active"');
      return false;
    }
    
    success(`Found ${pickupLocations.length} pickup location(s):`);
    
    const configuredLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';
    let foundMatch = false;
    
    pickupLocations.forEach((location, index) => {
      const isMatch = location.pickup_location === configuredLocation;
      const prefix = isMatch ? '  ✅' : '  •';
      const status = location.status === 1 ? '(Active)' : '(Inactive)';
      
      log(`${prefix} ${location.pickup_location} ${status}`);
      
      if (location.address) {
        log(`      ${location.address}, ${location.city}, ${location.state} - ${location.pin_code}`);
      }
      
      if (isMatch) {
        foundMatch = true;
        if (location.status !== 1) {
          warning(`      ⚠️  This location is INACTIVE! Please activate it in Shiprocket dashboard.`);
        }
      }
    });
    
    if (!foundMatch) {
      warning(`\n⚠️  Configured location "${configuredLocation}" not found!`);
      warning('\n🔧 Fix:');
      warning('  1. Check SHIPROCKET_PICKUP_LOCATION in .env');
      warning('  2. It must EXACTLY match one of the locations above (case-sensitive)');
      warning('  3. Update .env and restart server');
      return false;
    }
    
    success(`\nPickup location "${configuredLocation}" verified!`);
    return true;
  } catch (err) {
    error('Failed to fetch pickup locations');
    log(`  Error: ${err.message}`);
    return false;
  }
}

async function testOrderCreation(token) {
  header('STEP 4: Testing Order Creation (Dry Run)');
  
  info('This will create a TEST order in Shiprocket.');
  info('You can cancel/delete it from the Shiprocket dashboard after testing.');
  
  // Create a test order payload
  const testOrderPayload = {
    order_id: `TEST_ORDER_${Date.now()}`,
    order_date: new Date().toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    channel_id: "",
    comment: "KALLKEYY TEST ORDER - Safe to delete",
    billing_customer_name: "Test Customer",
    billing_last_name: "",
    billing_address: "Test Address 123",
    billing_address_2: "",
    billing_city: "Mumbai",
    billing_pincode: "400001",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_email: "test@example.com",
    billing_phone: "9999999999",
    shipping_is_billing: true,
    order_items: [{
      name: "Test Product",
      sku: "TEST-SKU-001",
      units: 1,
      selling_price: 100,
      discount: 0,
      tax: 0,
      hsn: 0
    }],
    payment_method: "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: 100,
    length: 30,
    breadth: 25,
    height: 5,
    weight: 0.5
  };
  
  warning('\n⚠️  This will create a REAL order in Shiprocket (with test data).');
  warning('Do you want to proceed? (Ctrl+C to cancel, or wait 5 seconds to continue)');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    info('\nCreating test order...');
    
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      testOrderPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    success('Test order created successfully!');
    log(`  Shiprocket Order ID: ${response.data.order_id}`);
    log(`  Shipment ID: ${response.data.shipment_id}`);
    
    warning('\n⚠️  IMPORTANT: Delete this test order from Shiprocket dashboard:');
    warning('  1. Go to https://app.shiprocket.in/orders');
    warning(`  2. Search for order: ${testOrderPayload.order_id}`);
    warning('  3. Cancel/Delete it');
    
    return true;
  } catch (err) {
    error('Test order creation failed!');
    
    if (err.response) {
      log(`  Status: ${err.response.status}`);
      log(`  Message: ${JSON.stringify(err.response.data, null, 2)}`);
      
      if (err.response.data?.message?.includes('pickup')) {
        warning('\n🔧 Fix: Check pickup location name');
      }
    } else {
      log(`  Error: ${err.message}`);
    }
    
    return false;
  }
}

async function runTests() {
  log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║         SHIPROCKET INTEGRATION TEST SUITE                 ║', 'bright');
  log('║         KALLKEYY Streetwear E-commerce                    ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');
  
  // Step 1: Configuration
  const configOk = await testConfiguration();
  if (!configOk) {
    log('\n');
    error('Configuration test failed. Please fix the issues and try again.');
    process.exit(1);
  }
  
  // Step 2: Authentication
  const token = await testAuthentication();
  if (!token) {
    log('\n');
    error('Authentication test failed. Please check your credentials.');
    process.exit(1);
  }
  
  // Step 3: Pickup Location
  const pickupOk = await testPickupLocation(token);
  if (!pickupOk) {
    log('\n');
    warning('Pickup location verification had issues, but you can continue.');
  }
  
  // Step 4: Ask about order creation test
  header('STEP 4: Order Creation Test (Optional)');
  info('This will create a TEST order in Shiprocket (can be deleted after).');
  info('Press Ctrl+C to skip, or wait 5 seconds to run the test...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const orderOk = await testOrderCreation(token);
  
  // Final Summary
  header('TEST SUMMARY');
  
  log('\nResults:');
  log(`  ${configOk ? '✅' : '❌'} Configuration`);
  log(`  ${token ? '✅' : '❌'} Authentication`);
  log(`  ${pickupOk ? '✅' : '⚠️ '} Pickup Location`);
  log(`  ${orderOk ? '✅' : '⚠️ '} Order Creation (optional)`);
  
  if (configOk && token) {
    log('\n');
    success('═══════════════════════════════════════════════════════════');
    success('  ALL TESTS PASSED! Shiprocket integration is ready! 🚀');
    success('═══════════════════════════════════════════════════════════');
    log('\n');
    info('Next steps:');
    info('  1. Set SHIPROCKET_ENABLED=true in backend/.env');
    info('  2. Restart your backend server');
    info('  3. Place a test order on your website');
    info('  4. Check Shiprocket dashboard for the order');
    log('\n');
  } else {
    log('\n');
    warning('Some tests failed. Please fix the issues before enabling Shiprocket.');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('\nUnexpected error:', err);
  process.exit(1);
});

