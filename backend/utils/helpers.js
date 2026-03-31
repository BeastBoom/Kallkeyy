/**
 * Shared helper utilities for the Kallkeyy backend.
 * Extracted from paymentController, codController, codTokenController
 * to eliminate duplication.
 */

// Check if verbose logging should be enabled (development only)
// Note: VERCEL_ENV can be 'development', 'preview', or 'production'
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';

/**
 * Log critical errors that should ALWAYS be logged in production.
 * @param {string} message - Description of the error
 * @param {Error|null} error - The error object (optional)
 */
const logCritical = (message, error = null) => {
  console.error(`🚨 CRITICAL: ${message}`);
  if (error) {
    console.error(`   Error: ${error.message || error}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    if (error.stack && isDevelopment) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
};

/**
 * Retry an async operation with exponential backoff.
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of attempts (default: 3)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise<*>} Result of the operation
 */
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      if (isDevelopment) {
        console.log(`⚠️  Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

module.exports = {
  isDevelopment,
  logCritical,
  retryOperation
};
