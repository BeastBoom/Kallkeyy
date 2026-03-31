/**
 * Shared Razorpay utilities for the Kallkeyy backend.
 * Provides a singleton Razorpay instance and shared payment verification.
 * 
 * Extracted from paymentController.js and codTokenController.js
 * to eliminate duplication (each had its own instance + verifyPaymentWithRazorpay).
 */

const Razorpay = require('razorpay');

// Singleton Razorpay instance — reused across all controllers
let razorpayInstance = null;

/**
 * Get (or create) the shared Razorpay instance.
 * @returns {Razorpay}
 */
function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

/**
 * Verify a payment with Razorpay API by fetching the payment
 * and checking that it's captured and matches the order.
 * 
 * @param {string} razorpay_order_id - The Razorpay order ID
 * @param {string} razorpay_payment_id - The Razorpay payment ID
 * @returns {Promise<{ verified: boolean, paymentDetails?: object, error?: string }>}
 */
async function verifyPaymentWithRazorpay(razorpay_order_id, razorpay_payment_id) {
  try {
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      throw new Error('Payment order ID mismatch');
    }

    if (payment.status !== 'captured') {
      throw new Error(`Payment not captured. Status: ${payment.status}`);
    }

    return { verified: true, paymentDetails: payment };
  } catch (error) {
    console.error('❌ Razorpay payment verification failed:', error.message);
    return { verified: false, error: error.message };
  }
}

module.exports = {
  getRazorpay,
  verifyPaymentWithRazorpay
};
