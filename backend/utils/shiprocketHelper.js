/**
 * Shiprocket integration helper for the Kallkeyy backend.
 * Centralizes all Shiprocket API interactions:
 * - Token management (with caching)
 * - Order creation
 * - Order cancellation
 * - Helper functions (name splitting, phone formatting, package dimensions)
 * 
 * Extracted from paymentController.js to eliminate duplication
 * and provide a single source of truth.
 */

const axios = require('axios');
const Order = require('../models/Order');
const { isDevelopment, logCritical, retryOperation } = require('./helpers');

// Shiprocket token cache (to avoid fetching token on every order)
let shiprocketTokenCache = null;
let shiprocketTokenExpiry = null;

/**
 * Get Shiprocket auth token (with caching).
 * Tokens are cached for 20 hours (they typically last 24 hours).
 * @returns {Promise<string>} The auth token
 */
async function getShiprocketToken() {
  try {
    // Return cached token if still valid
    if (shiprocketTokenCache && shiprocketTokenExpiry && Date.now() < shiprocketTokenExpiry) {
      return shiprocketTokenCache;
    }

    // Validate credentials exist
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials not configured');
    }

    const authResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    if (!authResponse.data || !authResponse.data.token) {
      throw new Error('Invalid token response from Shiprocket');
    }

    // Cache token for 20 hours
    shiprocketTokenCache = authResponse.data.token;
    shiprocketTokenExpiry = Date.now() + (20 * 60 * 60 * 1000);

    return shiprocketTokenCache;
  } catch (error) {
    console.error('❌ Shiprocket authentication failed');
    shiprocketTokenCache = null;
    shiprocketTokenExpiry = null;
    throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Split a full name into first and last name.
 * @param {string} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }

  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
}

/**
 * Format phone number (remove spaces, ensure 10 digits).
 * @param {string} phone
 * @returns {string} Formatted 10-digit phone number
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  // If starts with country code (91), remove it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.substring(2);
  }
  return cleaned.slice(-10);
}

/**
 * Calculate package dimensions and weight based on items.
 * @param {Array} items - Array of order items with quantity
 * @returns {{ length: number, breadth: number, height: number, weight: number }}
 */
function calculatePackageDetails(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const baseLength = 30;  // cm
  const baseBreadth = 25; // cm
  const baseHeight = 5;   // cm
  const baseWeight = 0.3; // kg per item

  const maxLength = 45;
  const maxBreadth = 35;
  const maxHeight = 15;

  let length = baseLength;
  let breadth = baseBreadth;
  let height = baseHeight;
  let weight = baseWeight * totalItems;

  if (totalItems > 1) {
    height = Math.min(baseHeight * Math.ceil(totalItems / 2), maxHeight);
    if (totalItems > 4) {
      length = Math.min(baseLength + 10, maxLength);
      breadth = Math.min(baseBreadth + 10, maxBreadth);
    }
  }

  weight = Math.max(weight, 0.2);

  return { length, breadth, height, weight };
}

/**
 * Clear the Shiprocket token cache (e.g. on auth errors).
 */
function clearTokenCache() {
  shiprocketTokenCache = null;
  shiprocketTokenExpiry = null;
  console.log('🔄 Cleared Shiprocket token cache');
}

/**
 * Create a Shiprocket order.
 * @param {Object} order - The order document from MongoDB
 * @returns {Promise<Object|null>} Shiprocket response data or null if disabled
 */
async function createShiprocketOrder(order) {
  try {
    // Validate Shiprocket is enabled
    if (process.env.SHIPROCKET_ENABLED !== 'true') {
      if (isDevelopment) {
        console.log('⚠️  Shiprocket is disabled, skipping order creation');
      }
      return null;
    }

    // Validate required environment variables
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials not configured in environment variables');
    }

    // Validate order data
    if (!order || !order.shippingAddress) {
      throw new Error('Invalid order data: missing shipping address');
    }

    const shippingAddress = order.shippingAddress;

    // Validate required fields
    const requiredFields = ['fullName', 'address', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required shipping fields: ${missingFields.join(', ')}`);
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(shippingAddress.phone);
    if (!formattedPhone || formattedPhone.length !== 10) {
      throw new Error(`Invalid phone number: ${shippingAddress.phone}. Must be exactly 10 digits.`);
    }
    if (!/^\d{10}$/.test(formattedPhone)) {
      throw new Error(`Invalid phone number format: ${shippingAddress.phone}. Must contain only digits.`);
    }

    // Validate pincode
    const pincode = shippingAddress.pincode.trim().replace(/\D/g, '');
    if (pincode.length !== 6) {
      throw new Error(`Invalid pincode: ${shippingAddress.pincode}. Must be 6 digits.`);
    }

    // Split full name
    const { firstName, lastName } = splitFullName(shippingAddress.fullName);

    // Get user email
    let customerEmail = shippingAddress.email;
    if (!customerEmail && order.userId) {
      try {
        const User = require('../models/User');
        const user = await User.findById(order.userId);
        customerEmail = user?.email;
      } catch (userError) {
        if (isDevelopment) {
          console.error('Failed to fetch user email');
        }
      }
    }

    if (!customerEmail) {
      customerEmail = 'customer@kallkeyy.com';
      if (isDevelopment) {
        console.warn('⚠️  No email found for order, using fallback email');
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new Error(`Invalid email format: ${customerEmail}`);
    }

    // Get auth token
    const token = await getShiprocketToken();

    // Calculate package dimensions
    const packageDetails = calculatePackageDetails(order.items);

    // Create SKU with size information
    const orderItems = order.items.map(item => ({
      name: `${item.productName} (Size: ${item.size})`,
      sku: `${item.productId}_${item.size}`,
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: 0
    }));

    // Determine payment method
    let shiprocketPaymentMethod = 'Prepaid';
    if (order.paymentMethod === 'cod' || order.paymentMethod === 'cod_token') {
      shiprocketPaymentMethod = 'COD';
    }

    // Create order payload
    const orderPayload = {
      order_id: order.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: "",
      comment: `KALLKEYY Streetwear Order - Order ID: ${order.orderId}`,
      billing_customer_name: firstName,
      billing_last_name: lastName || '',
      billing_address: shippingAddress.address.trim(),
      billing_address_2: "",
      billing_city: shippingAddress.city.trim(),
      billing_pincode: pincode,
      billing_state: shippingAddress.state.trim(),
      billing_country: 'India',
      billing_email: customerEmail.trim().toLowerCase(),
      billing_phone: formattedPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: shiprocketPaymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.amount,
      length: packageDetails.length,
      breadth: packageDetails.breadth,
      height: packageDetails.height,
      weight: packageDetails.weight
    };

    // Create Shiprocket order
    const shiprocketResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      orderPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Validate response
    if (!shiprocketResponse.data) {
      throw new Error('Empty response from Shiprocket API');
    }

    const responseData = shiprocketResponse.data;

    if (responseData.message && !responseData.order_id) {
      throw new Error(`Shiprocket API error: ${responseData.message}`);
    }

    if (!responseData.order_id) {
      throw new Error('Shiprocket response missing order_id');
    }

    // Update order with Shiprocket details
    const updateData = {
      shiprocketOrderId: responseData.order_id,
      shiprocketPaymentMethod: shiprocketPaymentMethod
    };

    if (responseData.shipment_id) {
      updateData.shiprocketShipmentId = responseData.shipment_id;
    }

    await Order.findByIdAndUpdate(order._id, updateData);

    return responseData;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const errorDetails = error.response?.data;

    logCritical(`Shiprocket order creation failed for order ${order.orderId}`, error);
    console.error(`   Order Amount: ₹${order.amount}`);
    console.error(`   Order Payment Method: ${order.paymentMethod || 'N/A'}`);
    console.error(`   Shiprocket Payment Method: ${order.paymentMethod === 'cod' || order.paymentMethod === 'cod_token' ? 'COD' : 'Prepaid'}`);

    if (error.response?.status === 400 && error.response?.data) {
      console.error('📋 Shiprocket 400 Error Details:', JSON.stringify(error.response.data, null, 2));
      if (errorDetails.message) console.error(`   Error Message: ${errorDetails.message}`);
      if (errorDetails.errors) console.error(`   Validation Errors:`, JSON.stringify(errorDetails.errors, null, 2));
      if (order.amount <= 0) console.error('   ⚠️  Issue: Order amount is 0 or negative.');
      if (order.amount < 100 && (order.paymentMethod === 'cod' || order.paymentMethod === 'cod_token')) {
        console.error('   ⚠️  Issue: COD orders with very low amounts (<₹100) may be rejected.');
      }
    }

    // Clear token cache on auth errors
    if (error.response?.status === 401 || error.message?.includes('authentication')) {
      clearTokenCache();
    }

    // Update order to note Shiprocket failure
    try {
      const errorNote = errorDetails
        ? `Shiprocket creation failed: ${errorMessage}${errorDetails.errors ? ` - Details: ${JSON.stringify(errorDetails.errors)}` : ''}`
        : `Shiprocket creation failed: ${errorMessage}`;

      await Order.findByIdAndUpdate(order._id, {
        $push: { notes: errorNote }
      });
    } catch (updateError) {
      console.error('Failed to update order with error note:', updateError.message);
    }

    // Log specific error types
    if (error.response?.data) {
      const apiError = error.response.data;
      if (apiError.message?.toLowerCase().includes('pickup')) console.error('🔧 Issue: Check SHIPROCKET_PICKUP_LOCATION in .env');
      if (apiError.message?.toLowerCase().includes('phone')) console.error('🔧 Issue: Invalid phone number format.');
      if (apiError.message?.toLowerCase().includes('pincode')) console.error('🔧 Issue: Invalid pincode.');
      if (apiError.message?.toLowerCase().includes('email')) console.error('🔧 Issue: Invalid email format.');
    }

    throw error;
  }
}

/**
 * Cancel a Shiprocket order.
 * @param {string|number} orderId - The Shiprocket order ID
 * @returns {Promise<Object|null>} Response data or null if disabled
 */
async function cancelShiprocketOrder(orderId) {
  try {
    if (process.env.SHIPROCKET_ENABLED !== 'true') {
      if (isDevelopment) {
        console.log('⚠️  Shiprocket is disabled, skipping cancellation');
      }
      return null;
    }

    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials not configured in environment variables');
    }

    const token = await getShiprocketToken();

    const cancelResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/cancel',
      { ids: [Number(orderId)] },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!cancelResponse.data) {
      throw new Error('Empty response from Shiprocket API');
    }

    const responseData = cancelResponse.data;

    if (responseData.message && responseData.message.toLowerCase().includes('success')) {
      return responseData;
    } else if (responseData.success === true || responseData.success === 'true') {
      return responseData;
    } else if (responseData.message) {
      return responseData;
    } else {
      throw new Error(`Shiprocket API error: ${responseData.message || 'Unknown error'}`);
    }
  } catch (error) {
    logCritical(`Shiprocket order cancellation failed for order ${orderId}`, error);

    console.error(`❌ Shiprocket Cancellation Error Details:`);
    console.error(`   Error Type: ${error.constructor.name}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Error Code: ${error.code}`);

    if (error.response) {
      console.error(`   Response Status: ${error.response.status}`);
      console.error(`   Response Data:`, error.response.data);
    }

    if (error.response?.status === 401 || error.message?.includes('authentication')) {
      clearTokenCache();
    }

    throw error;
  }
}

/**
 * Create a Shiprocket order with retry, logging the result back to the order doc.
 * This is the convenience wrapper used by all order flows.
 * 
 * @param {Object} order - Order document
 * @param {string} label - Label for logging (e.g. 'COD', 'Razorpay', 'Recovery')
 */
async function createShiprocketOrderWithRetry(order, label = 'Order') {
  if (process.env.SHIPROCKET_ENABLED !== 'true') {
    if (isDevelopment) {
      console.log('⚠️  Shiprocket is disabled (SHIPROCKET_ENABLED != true)');
    }
    return null;
  }

  if (!order || !order._id) {
    console.error(`❌ No order object available for Shiprocket creation`);
    return null;
  }

  console.log(`🚀 Creating Shiprocket order for ${label}: ${order.orderId}`);

  try {
    const result = await retryOperation(
      () => createShiprocketOrder(order),
      3,
      2000
    );

    if (result && result.order_id) {
      console.log(`✅ Shiprocket ${label} order created successfully for order ${order.orderId}`);
      console.log(`   Shiprocket Order ID: ${result.order_id}`);
      console.log(`   Shiprocket Shipment ID: ${result.shipment_id || 'N/A'}`);
    } else {
      throw new Error('Shiprocket order creation returned null/undefined result');
    }

    return result;
  } catch (shiprocketError) {
    console.error(`❌ Shiprocket ${label} order creation failed for order ${order.orderId}:`);
    console.error(`   Error: ${shiprocketError.message}`);

    try {
      const errorDetails = shiprocketError.response?.data
        ? `Shiprocket API Error: ${shiprocketError.response.data.message || shiprocketError.message}`
        : `Shiprocket Error: ${shiprocketError.message}`;

      await Order.findByIdAndUpdate(order._id, {
        $push: { notes: errorDetails }
      });
    } catch (noteError) {
      console.error(`❌ Failed to update order notes:`, noteError.message);
    }

    console.warn(`⚠️  ${label} order ${order.orderId} created but Shiprocket integration failed. Manual Shiprocket order required.`);
    return null;
  }
}

module.exports = {
  getShiprocketToken,
  splitFullName,
  formatPhoneNumber,
  calculatePackageDetails,
  createShiprocketOrder,
  cancelShiprocketOrder,
  createShiprocketOrderWithRetry,
  clearTokenCache
};
