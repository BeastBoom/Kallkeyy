const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const axios = require('axios');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Get cart items
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // CRITICAL: Validate stock availability before creating order
    const unavailableItems = [];
    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      
      if (!product) {
        unavailableItems.push({
          productName: item.productName,
          size: item.size,
          reason: 'Product no longer available'
        });
        continue;
      }

      const totalStock = product.stock[item.size] || 0;

      if (totalStock < item.quantity) {
        unavailableItems.push({
          productName: item.productName,
          size: item.size,
          requestedQuantity: item.quantity,
          availableQuantity: totalStock,
          reason: totalStock === 0 ? 'Out of stock' : `Only ${totalStock} available`
        });
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available',
        unavailableItems
      });
    }

    // Calculate total amount
    const amount = cart.totalPrice;

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = await Order.create({
      userId,
      orderId: razorpayOrder.receipt,
      razorpayOrderId: razorpayOrder.id,
      items: cart.items,
      shippingAddress,
      amount,
      currency: 'INR',
      status: 'created',
      paymentStatus: 'pending'
    });

    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id
      },
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update order
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: 'completed',
          status: 'paid'
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // 🔥 CRITICAL: Deduct stock from products
      for (const item of order.items) {
        await Product.findOneAndUpdate(
          { productId: item.productId },
          {
            $inc: {
              [`stock.${item.size}`]: -item.quantity
            }
          }
        );
      }

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 }
      );

      // Create Shiprocket order (if enabled)
      if (process.env.SHIPROCKET_ENABLED === 'true') {
        // Run in background - don't wait for response
        createShiprocketOrder(order).catch(err => {
          console.error('⚠️  Shiprocket order creation failed (non-blocking):', err.message);
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'failed'
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Webhook handler for Razorpay
exports.webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature === expectedSignature) {
      const event = req.body.event;
      const payload = req.body.payload.payment.entity;

      if (event === 'payment.captured') {
        // Update order status
        await Order.findOneAndUpdate(
          { razorpayPaymentId: payload.id },
          { 
            paymentStatus: 'completed',
            status: 'paid'
          }
        );
      } else if (event === 'payment.failed') {
        await Order.findOneAndUpdate(
          { razorpayOrderId: payload.order_id },
          { 
            paymentStatus: 'failed',
            status: 'failed'
          }
        );
      }

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Helper function to get Shiprocket auth token
async function getShiprocketToken() {
  try {
    const authResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );
    return authResponse.data.token;
  } catch (error) {
    console.error('❌ Shiprocket authentication failed:', error.response?.data || error.message);
    throw new Error('Shiprocket authentication failed');
  }
}

// Helper function to create Shiprocket order
async function createShiprocketOrder(order) {
  try {
    console.log(`🚀 Creating Shiprocket order for: ${order.orderId}`);
    
    // Get auth token
    const token = await getShiprocketToken();

    // Create order payload (optimized for streetwear)
    const orderPayload = {
      order_id: order.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: "",
      comment: "KALLKEYY Streetwear Order",
      billing_customer_name: order.shippingAddress.fullName,
      billing_last_name: "",
      billing_address: order.shippingAddress.address,
      billing_address_2: "",
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.shippingAddress.email,
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.productName,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 0
      })),
      payment_method: 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.amount,
      length: 30,  // Typical for clothing (cm)
      breadth: 25,
      height: 5,
      weight: 0.5  // kg - adjust based on your products
    };

    console.log('📦 Shiprocket payload:', JSON.stringify(orderPayload, null, 2));

    // Create Shiprocket order
    const shiprocketResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      orderPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Shiprocket response:', JSON.stringify(shiprocketResponse.data, null, 2));

    // Update order with Shiprocket details
    await Order.findByIdAndUpdate(order._id, {
      shiprocketOrderId: shiprocketResponse.data.order_id,
      shiprocketShipmentId: shiprocketResponse.data.shipment_id,
      status: 'processing'
    });

    console.log(`✅ Shiprocket order created successfully:`, {
      orderId: shiprocketResponse.data.order_id,
      shipmentId: shiprocketResponse.data.shipment_id
    });

    return shiprocketResponse.data;
  } catch (error) {
    console.error('❌ Shiprocket order creation failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Update order to note Shiprocket failure
    await Order.findByIdAndUpdate(order._id, {
      $push: {
        notes: `Shiprocket creation failed: ${error.response?.data?.message || error.message}`
      }
    }).catch(err => console.error('Failed to update order with error note:', err));
    
    // Don't throw - log and continue (order still valid even if Shiprocket fails)
    throw error;
  }
}

// Get order tracking details from Shiprocket
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // If Shiprocket is not enabled or no shipment ID, return basic order info
    if (!order.shiprocketShipmentId) {
      return res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingAvailable: false
        }
      });
    }

    // Fetch tracking from Shiprocket
    try {
      const token = await getShiprocketToken();
      
      const trackingResponse = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocketShipmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingAvailable: true,
          tracking: trackingResponse.data
        }
      });
    } catch (trackingError) {
      // If tracking fetch fails, return order without tracking
      console.error('Failed to fetch Shiprocket tracking:', trackingError.message);
      
      res.status(200).json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          awbCode: order.awbCode,
          courierName: order.courierName,
          trackingUrl: order.trackingUrl,
          trackingAvailable: false,
          trackingError: 'Unable to fetch live tracking'
        }
      });
    }
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking',
      error: error.message
    });
  }
};

// Shiprocket webhook handler
exports.shiprocketWebhook = async (req, res) => {
  try {
    console.log('📨 Shiprocket webhook received:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;
    
    // Find order by Shiprocket order ID
    const order = await Order.findOne({ 
      shiprocketOrderId: webhookData.order_id 
    });

    if (!order) {
      console.log(`⚠️  Order not found for Shiprocket ID: ${webhookData.order_id}`);
      return res.status(200).json({ success: true, message: 'Order not found' });
    }

    // Update order based on webhook event
    const updates = {};

    // Handle different webhook events
    switch (webhookData.current_status) {
      case 'PICKUP SCHEDULED':
      case 'PICKUP QUEUED':
        updates.status = 'processing';
        break;
      
      case 'SHIPPED':
      case 'IN TRANSIT':
        updates.status = 'shipped';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
      case 'OUT FOR DELIVERY':
        updates.status = 'shipped';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
      case 'DELIVERED':
        updates.status = 'delivered';
        updates.awbCode = webhookData.awb_code;
        updates.courierName = webhookData.courier_name;
        break;
      
      case 'CANCELED':
      case 'RTO INITIATED':
      case 'RTO DELIVERED':
        updates.status = 'cancelled';
        break;
    }

    // Add tracking URL if available
    if (webhookData.awb_code) {
      updates.trackingUrl = `https://shiprocket.co/tracking/${webhookData.awb_code}`;
    }

    if (Object.keys(updates).length > 0) {
      await Order.findByIdAndUpdate(order._id, updates);
      console.log(`✅ Order ${order.orderId} updated:`, updates);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Shiprocket webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
