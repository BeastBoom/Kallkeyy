// Helper to ensure CORS headers are always set before sending responses
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    const allowedPatterns = [
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
      /^https:\/\/.*\.kallkeyy\.com$/,
      /^http:\/\/localhost:\d+$/
    ];
    const allowedOrigins = [
      'https://kallkeyy.com',
      'https://www.kallkeyy.com',
      'https://kallkeyy.vercel.app',
      'https://kallkeyy-admin.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin) || allowedPatterns.some(p => p.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
      res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
  }
}

// Wrapper to ensure CORS headers are set before sending JSON response
function sendResponse(req, res, statusCode, jsonData) {
  setCorsHeaders(req, res);
  return res.status(statusCode).json(jsonData);
}

module.exports = {
  setCorsHeaders,
  sendResponse
};

