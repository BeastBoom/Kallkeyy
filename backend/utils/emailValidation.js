const axios = require('axios');

// Multiple Mailboxlayer API keys (rotate when one reaches limit)
const MAILBOXLAYER_API_KEYS = [
  process.env.MAILBOXLAYER_KEY_1,
  process.env.MAILBOXLAYER_KEY_2,
  process.env.MAILBOXLAYER_KEY_3
].filter(Boolean); // Remove undefined keys

let currentKeyIndex = 0;

// Validate email using Mailboxlayer API
async function validateEmailWithAPI(email) {
  if (MAILBOXLAYER_API_KEYS.length === 0) {
    console.warn('No Mailboxlayer API keys configured');
    return { valid: true, message: 'Email validation skipped' }; // Skip if no keys
  }

  for (let attempt = 0; attempt < MAILBOXLAYER_API_KEYS.length; attempt++) {
    const apiKey = MAILBOXLAYER_API_KEYS[currentKeyIndex];
    
    try {
      const response = await axios.get('https://apilayer.net/api/check', {
        params: {
          access_key: apiKey,
          email: email,
          smtp: 1, // Enable SMTP check
          format: 1 // Get formatted response
        },
        timeout: 5000 // 5 second timeout
      });

      const data = response.data;

      // Check if API key is exhausted
      if (data.error && data.error.code === 104) {
        console.log(`Mailboxlayer API key ${currentKeyIndex + 1} exhausted, trying next...`);
        currentKeyIndex = (currentKeyIndex + 1) % MAILBOXLAYER_API_KEYS.length;
        continue; // Try next key
      }

      // Validate email based on API response
      if (!data.format_valid) {
        return { valid: false, message: 'Invalid email format' };
      }

      if (!data.mx_found) {
        return { valid: false, message: 'Email domain does not exist' };
      }

      if (data.disposable) {
        return { valid: false, message: 'Disposable email addresses are not allowed' };
      }

      // Email is valid
      return { 
        valid: true, 
        message: 'Email validated',
        score: data.score,
        isFree: data.free
      };

    } catch (error) {
      console.error(`Mailboxlayer API error (Key ${currentKeyIndex + 1}):`, error.message);
      // Try next key
      currentKeyIndex = (currentKeyIndex + 1) % MAILBOXLAYER_API_KEYS.length;
      continue;
    }
  }

  // All keys failed, allow registration but log warning
  console.warn('All Mailboxlayer API keys failed, skipping validation');
  return { valid: true, message: 'Email validation unavailable' };
}

module.exports = { validateEmailWithAPI };
