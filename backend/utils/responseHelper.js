const { setCorsHeaders } = require('./corsHelper');

// Wrapper to ensure CORS headers are set before sending JSON response
function sendResponse(req, res, statusCode, jsonData) {
  setCorsHeaders(req, res);
  return res.status(statusCode).json(jsonData);
}

module.exports = {
  setCorsHeaders,
  sendResponse
};

