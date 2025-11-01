/**
 * Centralized CORS helper for backend
 * Dynamically handles localhost origins based on environment
 */

const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;

// Helper to get allowed origins and patterns
function getAllowedOrigins() {
  const allowedOrigins = [
    'https://kallkeyy.com',
    'https://www.kallkeyy.com',
    'https://kallkeyy.vercel.app',
    'https://kallkeyy-admin.vercel.app',
  ];

  // Add environment-based URLs
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
  if (process.env.ADMIN_PANEL_URL) allowedOrigins.push(process.env.ADMIN_PANEL_URL);

  // Add localhost origins only in development
  if (isDevelopment) {
    if (process.env.FRONTEND_PORT) {
      allowedOrigins.push(`http://localhost:${process.env.FRONTEND_PORT}`);
    }
    if (process.env.ADMIN_PORT) {
      allowedOrigins.push(`http://localhost:${process.env.ADMIN_PORT}`);
    }
    // Fallback to common development ports if not specified
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001');
  }

  return allowedOrigins;
}

function getAllowedPatterns() {
  const allowedPatterns = [
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
    /^https:\/\/.*\.kallkeyy\.com$/
  ];

  // Add localhost pattern only in development
  if (isDevelopment) {
    allowedPatterns.push(/^http:\/\/localhost:\d+$/);
  }

  return allowedPatterns;
}

// Helper to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    const allowedOrigins = getAllowedOrigins();
    const allowedPatterns = getAllowedPatterns();
    
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

module.exports = {
  setCorsHeaders,
  getAllowedOrigins,
  getAllowedPatterns,
  isDevelopment
};

