# 🚀 Shiprocket Integration Setup Guide for KALLKEYY Streetwear

This guide will walk you through setting up Shiprocket integration for your clothing e-commerce site.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Shiprocket Account Setup](#shiprocket-account-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Webhook Setup](#webhook-setup)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, ensure you have:
- [x] A registered business in India
- [x] GSTIN (GST Identification Number)
- [x] Active bank account
- [x] Valid identity proof (Aadhaar/PAN)
- [x] Your website is live with Razorpay payment gateway working

---

## 🏢 Shiprocket Account Setup

### Step 1: Create Shiprocket Account

1. **Visit Shiprocket Website**
   - Go to [https://www.shiprocket.in](https://www.shiprocket.in)
   - Click on "Sign Up" or "Get Started"

2. **Fill Registration Details**
   ```
   Business Name: KALLKEYY
   Email: your-business-email@domain.com
   Phone: Your business phone number
   ```

3. **Complete KYC**
   - Upload GSTIN
   - Upload PAN Card
   - Upload Bank Details
   - Upload Identity Proof
   - *Note: KYC verification takes 24-48 hours*

4. **Wait for Account Activation**
   - You'll receive an email once your account is activated
   - Login to your Shiprocket dashboard

### Step 2: Configure Pickup Location

1. **Login to Shiprocket Dashboard**
   - Go to Settings → Pickup Locations

2. **Add Your Pickup Location**
   ```
   Pickup Location Name: Primary (or your custom name)
   Address: Your warehouse/store address
   Contact Person: Your name
   Phone: Contact number
   Pincode: Your area pincode
   City: Your city
   State: Your state
   ```

3. **Save and Activate**
   - Mark as "Active"
   - Note down the **Pickup Location Name** (you'll need this for env variables)

### Step 3: Get API Credentials

1. **Navigate to API Settings**
   - Go to Settings → API
   - Or visit [Shiprocket API Settings](https://app.shiprocket.in/api/settings)

2. **API Credentials**
   - You'll use your **Email** and **Password** for API authentication
   - Shiprocket uses email/password login, not API keys
   - **Important:** Store these securely!

3. **Test API Access**
   ```bash
   curl -X POST "https://apiv2.shiprocket.in/v1/external/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
          "email": "your-shiprocket-email@domain.com",
          "password": "your-shiprocket-password"
        }'
   ```
   - If successful, you'll receive a token in response

---

## ⚙️ Environment Variables Configuration

### Step 1: Locate Your `.env` File

Navigate to your backend directory:
```bash
cd backend
```

### Step 2: Add Shiprocket Variables

Add the following to your `backend/.env` file:

```env
# ==========================================
# SHIPROCKET CONFIGURATION
# ==========================================

# Enable/Disable Shiprocket Integration
# Set to 'true' to enable, 'false' to disable
SHIPROCKET_ENABLED=true

# Shiprocket Login Credentials
# Use the email and password you use to login to Shiprocket dashboard
SHIPROCKET_EMAIL=your-shiprocket-email@domain.com
SHIPROCKET_PASSWORD=your-shiprocket-password

# Pickup Location Name
# This must EXACTLY match the pickup location name in your Shiprocket dashboard
# Default: "Primary" (if you named it "Primary" in Shiprocket)
SHIPROCKET_PICKUP_LOCATION=Primary
```

### Step 3: Verify Environment Variables

Create a test script to verify:

```javascript
// test-shiprocket-config.js
require('dotenv').config();

console.log('Shiprocket Configuration:');
console.log('========================');
console.log('Enabled:', process.env.SHIPROCKET_ENABLED);
console.log('Email:', process.env.SHIPROCKET_EMAIL ? '✅ Set' : '❌ Missing');
console.log('Password:', process.env.SHIPROCKET_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('Pickup Location:', process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary (default)');
```

Run it:
```bash
node test-shiprocket-config.js
```

### Step 4: Example `.env` File

Here's a complete example:

```env
# Backend Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-jwt-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email Service (if using)
MAILBOXLAYER_API_KEY=your-mailboxlayer-key

# ==========================================
# SHIPROCKET CONFIGURATION
# ==========================================
SHIPROCKET_ENABLED=true
SHIPROCKET_EMAIL=youremail@yourdomain.com
SHIPROCKET_PASSWORD=YourStrongPassword123!
SHIPROCKET_PICKUP_LOCATION=Primary
```

---

## 🧪 Testing the Integration

### Test 1: API Authentication

Create `test-shiprocket-auth.js`:

```javascript
const axios = require('axios');
require('dotenv').config();

async function testShiprocketAuth() {
  try {
    console.log('🔐 Testing Shiprocket Authentication...');
    
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    console.log('✅ Authentication Successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Authentication Failed:', error.response?.data || error.message);
    return false;
  }
}

testShiprocketAuth();
```

Run:
```bash
cd backend
node test-shiprocket-auth.js
```

**Expected Output:**
```
🔐 Testing Shiprocket Authentication...
✅ Authentication Successful!
Token: eyJhbGciOiJIUzI1NiIs...
```

### Test 2: End-to-End Order Flow

1. **Place a Test Order**
   - Login to your website
   - Add a product to cart
   - Complete checkout with test payment
   - Verify payment succeeds

2. **Check Backend Logs**
   ```
   Look for these logs in your server console:
   
   🚀 Creating Shiprocket order for: order_1234567890
   📦 Shiprocket payload: {...}
   ✅ Shiprocket response: {...}
   ✅ Shiprocket order created successfully: { orderId: ..., shipmentId: ... }
   ```

3. **Verify in Shiprocket Dashboard**
   - Login to [Shiprocket Dashboard](https://app.shiprocket.in)
   - Go to "Orders"
   - Your test order should appear!

4. **Check Database**
   ```javascript
   // In MongoDB
   db.orders.findOne({ orderId: "order_1234567890" })
   
   // Should have:
   {
     shiprocketOrderId: "123456",
     shiprocketShipmentId: "78910",
     status: "processing"
   }
   ```

### Test 3: Disable Shiprocket (Fallback Test)

1. Set in `.env`:
   ```env
   SHIPROCKET_ENABLED=false
   ```

2. Restart server

3. Place an order - should work WITHOUT creating Shiprocket order

4. Check logs - should NOT see Shiprocket creation logs

5. Re-enable:
   ```env
   SHIPROCKET_ENABLED=true
   ```

---

## 🔔 Webhook Setup

Webhooks allow Shiprocket to notify your server about shipment status updates.

### Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://your-domain.com/api/payment/shiprocket-webhook
```

**For Development (ngrok):**
1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 5000`
3. Copy the HTTPS URL: `https://abc123.ngrok.io`
4. Your webhook URL: `https://abc123.ngrok.io/api/payment/shiprocket-webhook`

### Step 2: Configure Webhook in Shiprocket

1. **Login to Shiprocket Dashboard**
   - Go to Settings → Webhooks
   - Or visit [Shiprocket Webhooks](https://app.shiprocket.in/webhooks)

2. **Add New Webhook**
   ```
   Webhook URL: https://your-domain.com/api/payment/shiprocket-webhook
   Events: Select all shipping events:
     - Order Shipped
     - In Transit
     - Out for Delivery
     - Delivered
     - RTO Initiated
     - RTO Delivered
     - Cancelled
   ```

3. **Test Webhook**
   - Shiprocket provides a "Test" button
   - Check your server logs for webhook receipt

### Step 3: Verify Webhook

Watch your server logs:
```bash
# You should see:
📨 Shiprocket webhook received: {
  "order_id": 123456,
  "current_status": "SHIPPED",
  "awb_code": "1234567890",
  "courier_name": "Delhivery"
}
✅ Order order_1234567890 updated: { status: 'shipped', awbCode: '1234567890', ... }
```

---

## 🐛 Troubleshooting

### Issue 1: "Authentication Failed"

**Symptoms:**
```
❌ Shiprocket authentication failed: Invalid credentials
```

**Solutions:**
1. Verify email/password in `.env` match Shiprocket login
2. Check for trailing spaces in `.env`
3. Try logging into Shiprocket dashboard with same credentials
4. Reset password if needed

### Issue 2: "Pickup Location Not Found"

**Symptoms:**
```
❌ Shiprocket order creation failed: Pickup location 'Primary' not found
```

**Solutions:**
1. Login to Shiprocket → Settings → Pickup Locations
2. Check the EXACT name of your pickup location
3. Update `SHIPROCKET_PICKUP_LOCATION` in `.env` to match exactly
4. Ensure pickup location is marked as "Active"

### Issue 3: Orders Not Appearing in Shiprocket

**Checklist:**
- [ ] `SHIPROCKET_ENABLED=true` in `.env`
- [ ] Server restarted after changing `.env`
- [ ] Payment is completing successfully
- [ ] Check server logs for Shiprocket errors
- [ ] Verify Shiprocket account is active (not suspended)

**Debug:**
```javascript
// Add more logging in backend/controllers/paymentController.js
console.log('Shiprocket Enabled:', process.env.SHIPROCKET_ENABLED);
console.log('Shiprocket Email:', process.env.SHIPROCKET_EMAIL);
```

### Issue 4: Webhook Not Receiving Updates

**Solutions:**
1. Verify webhook URL is correct in Shiprocket
2. Check if URL is publicly accessible (use ngrok for local testing)
3. Check server logs for incoming webhooks
4. Verify webhook events are selected in Shiprocket
5. Test webhook using Shiprocket's test feature

### Issue 5: Stock Not Deducting

**This is now FIXED!** The latest update includes:
- Stock deduction happens in `verifyPayment` after successful payment
- Stock is reduced BEFORE Shiprocket order creation
- Check logs for: `🔥 CRITICAL: Deduct stock from products`

---

## 📊 Integration Flow Diagram

```
User Places Order
      ↓
Payment via Razorpay
      ↓
Payment Verification (backend)
      ↓
Stock Deduction ✅
      ↓
Cart Cleared
      ↓
[If SHIPROCKET_ENABLED=true]
      ↓
Create Shiprocket Order
      ↓
Get Shiprocket Order ID & Shipment ID
      ↓
Update Order in Database
      ↓
Shiprocket Picks Up & Ships
      ↓
Webhook Updates Order Status
      ↓
Customer Can Track Order
```

---

## 🎯 Next Steps

After successful setup:

1. **Test in Production**
   - Place real orders
   - Verify Shiprocket integration works
   - Monitor for any errors

2. **Monitor Orders**
   - Check Shiprocket dashboard daily
   - Ensure orders are being picked up
   - Track delivery performance

3. **Customer Communication**
   - Build order tracking page (frontend)
   - Send tracking emails to customers
   - Update order status in real-time

4. **Optimize Settings**
   - Adjust package dimensions in code if needed
   - Update weight based on your products
   - Configure shipping charges if applicable

---

## 📞 Support

- **Shiprocket Support:** [https://www.shiprocket.in/support/](https://www.shiprocket.in/support/)
- **Shiprocket API Docs:** [https://apidocs.shiprocket.in/](https://apidocs.shiprocket.in/)
- **Your Backend Code:** `backend/controllers/paymentController.js`

---

## ✅ Final Checklist

Before going live:

- [ ] Shiprocket account is KYC verified
- [ ] Pickup location is configured and active
- [ ] Environment variables are set correctly
- [ ] Test authentication passes
- [ ] Test order creates successfully in Shiprocket
- [ ] Webhook is configured and tested
- [ ] Stock deduction is working
- [ ] Order tracking endpoint works
- [ ] Production domain is set up (not ngrok)

**Status:** Ready for Production 🚀

---

**Last Updated:** October 29, 2025  
**Version:** 2.0.0

