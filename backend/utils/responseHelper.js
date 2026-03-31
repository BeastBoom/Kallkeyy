const { setCorsHeaders } = require('./corsHelper');

/**
 * Log an action for audit purposes.
 * Currently logs to console; can be extended to write to a database audit log.
 * 
 * @param {string} action - The action name (e.g. 'order_cancellation', 'admin_refund')
 * @param {Object} details - Action details
 */
const logAction = async (action, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`📋 [ACTION LOG] ${timestamp} | ${action} | ${JSON.stringify(details)}`);
};

// Wrapper to ensure CORS headers are set before sending JSON response
function sendResponse(req, res, statusCode, jsonData) {
  setCorsHeaders(req, res);
  return res.status(statusCode).json(jsonData);
}

module.exports = {
  setCorsHeaders,
  sendResponse,
  logAction
};

