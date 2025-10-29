const axios = require("axios");
const dns = require("dns").promises;

// Multiple Mailboxlayer API keys (rotate when one reaches limit)
const MAILBOXLAYER_API_KEYS = [
  process.env.MAILBOXLAYER_KEY_1,
  process.env.MAILBOXLAYER_KEY_2,
  process.env.MAILBOXLAYER_KEY_3,
].filter(Boolean); // Remove undefined keys

let currentKeyIndex = 0;

// Enhanced basic email format validation (fallback)
function basicEmailValidation(email) {
  // More comprehensive email regex that validates:
  // - Local part (before @): alphanumeric, dots, hyphens, underscores
  // - Domain part (after @): alphanumeric, dots, hyphens
  // - TLD: at least 2 characters
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional checks
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;

  // Check local part
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
  if (localPart.includes("..")) return false;

  // Check domain
  if (domain.length === 0 || domain.length > 255) return false;
  if (domain.startsWith("-") || domain.endsWith("-")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..")) return false;

  // Must have at least one dot in domain
  if (!domain.includes(".")) return false;

  return true;
}

// Check MX records using DNS (additional validation)
async function checkMXRecords(domain) {
  try {
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}

// Validate email using Mailboxlayer API
async function validateEmailWithAPI(email) {
  // Step 1: Basic email format check (STRICT)
  if (!basicEmailValidation(email)) {
    return {
      valid: false,
      message: "Invalid email format. Please enter a valid email address.",
    };
  }

  // Extract domain for MX check
  const domain = email.split("@")[1];

  // Step 2: If no API keys configured, use DNS MX record check as fallback
  if (MAILBOXLAYER_API_KEYS.length === 0) {
    const mxValid = await checkMXRecords(domain);
    if (!mxValid) {
      return {
        valid: false,
        message: "Email domain does not exist or cannot receive emails.",
      };
    }

    return { valid: true, message: "Email validated (DNS check)" };
  }

  // Step 3: Try API validation with all available keys
  let lastApiError = null;

  for (let attempt = 0; attempt < MAILBOXLAYER_API_KEYS.length; attempt++) {
    const apiKey = MAILBOXLAYER_API_KEYS[currentKeyIndex];

    try {
      const response = await axios.get("https://apilayer.net/api/check", {
        params: {
          access_key: apiKey,
          email: email,
          smtp: 1, // Enable SMTP check
          format: 1, // Get formatted response
        },
        timeout: 10000, // 10 second timeout
      });

      const data = response.data;

      // Check if API returned an error
      if (data.error) {
        const errorCode = data.error.code;

        // API key exhausted (code 104) - try next key
        if (errorCode === 104) {
          currentKeyIndex =
            (currentKeyIndex + 1) % MAILBOXLAYER_API_KEYS.length;
          lastApiError = `API key exhausted`;
          continue;
        }

        // Invalid email error (code 302) - reject immediately
        if (errorCode === 302) {
          return {
            valid: false,
            message: "Invalid email address format.",
          };
        }

        // Other API errors - try next key
        currentKeyIndex = (currentKeyIndex + 1) % MAILBOXLAYER_API_KEYS.length;
        lastApiError = data.error.info;
        continue;
      }

      // Step 4: STRICT validation checks

      // Check 1: Format validity (STRICT)
      if (data.format_valid === false) {
        return {
          valid: false,
          message: "Invalid email format. Please check your email address.",
        };
      }

      // Check 2: MX records (STRICT)
      if (data.mx_found === false) {
        return {
          valid: false,
          message: "Email domain does not exist or cannot receive emails.",
        };
      }

      // Check 3: Disposable email (STRICT)
      if (data.disposable === true) {
        return {
          valid: false,
          message:
            "Disposable email addresses are not allowed. Please use a permanent email.",
        };
      }

      // Check 4: SMTP check (STRICT - but allow if catch_all is true)
      if (data.smtp_check === false && data.catch_all !== true) {
        return {
          valid: false,
          message: "Email address does not exist. Please check your email.",
        };
      }

      return {
        valid: true,
        message: "Email validated successfully",
        score: data.score,
        qualityScore: data.quality_score,
        isFree: data.free,
        isRole: data.role,
      };
    } catch (error) {
      console.error(
        `⚠ Network error (Key ${currentKeyIndex + 1}):`,
        error.message
      );
      // Try next key
      currentKeyIndex = (currentKeyIndex + 1) % MAILBOXLAYER_API_KEYS.length;
      lastApiError = error.message;
      continue;
    }
  }

  // Step 5: All API keys failed - use DNS MX as final fallback
  const mxValid = await checkMXRecords(domain);
  if (!mxValid) {
    return {
      valid: false,
      message:
        "Unable to verify email. Please check your email address or try again later.",
    };
  }

  return {
    valid: true,
    message: "Email validated (DNS fallback)",
    note: "Full validation unavailable, used DNS check",
  };
}

module.exports = { validateEmailWithAPI };
