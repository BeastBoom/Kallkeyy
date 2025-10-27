const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
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

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 }
      );

      // Create Shiprocket order (optional, can be done in background)
      if (process.env.SHIPROCKET_ENABLED === 'true') {
        await createShiprocketOrder(order);
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

// Helper function to create Shiprocket order
// Optimized Shiprocket helper function
async function createShiprocketOrder(order) {
  try {
    const axios = require('axios');

    // Authenticate with Shiprocket
    const authResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      }
    );

    const token = authResponse.data.token;

    // Create order payload (optimized for streetwear)
    const orderPayload = {
      order_id: order.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: "",
      comment: "KALLKEYY Order",
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
      length: 30,  // Typical for clothing
      breadth: 25,
      height: 5,
      weight: 0.5  // Adjust based on your products
    };

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

    // Update order with Shiprocket details
    await Order.findByIdAndUpdate(order._id, {
      shiprocketOrderId: shiprocketResponse.data.order_id,
      shiprocketShipmentId: shiprocketResponse.data.shipment_id,
      status: 'processing'
    });

    console.log('✅ Shiprocket order created:', shiprocketResponse.data.order_id);
    return shiprocketResponse.data;
  } catch (error) {
    console.error('❌ Shiprocket error:', error.response?.data || error.message);
    // Don't throw - log and continue (order still valid even if Shiprocket fails)
  }
}
