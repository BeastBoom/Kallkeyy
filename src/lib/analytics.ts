/**
 * Google Analytics 4 (GA4) Integration
 * Handles page views, events, and e-commerce tracking
 */

declare global {
  interface Window {
    gtag?: {
      (command: 'config' | 'event' | 'set', targetId: string | Date, config?: any): void;
      (command: 'js', date: Date): void;
    };
    dataLayer?: any[];
  }
}

// Get GA4 Measurement ID from environment variable
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

// Log measurement ID status in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  if (GA4_MEASUREMENT_ID) {
    console.log('✅ GA4 Measurement ID found:', GA4_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ GA4 Measurement ID NOT found in environment variables');
    console.warn('   Add VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX to your .env file');
  }
}

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!GA4_MEASUREMENT_ID) {
    console.warn('⚠️ Google Analytics Measurement ID not found. Set VITE_GA4_MEASUREMENT_ID environment variable.');
    console.warn('   Format: VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX');
    return;
  }

  // Validate Measurement ID format (should start with G-)
  if (!GA4_MEASUREMENT_ID.startsWith('G-')) {
    console.error('❌ Invalid GA4 Measurement ID format. Should start with "G-" (e.g., G-XXXXXXXXXX)');
    console.error('   Current value:', GA4_MEASUREMENT_ID);
    return;
  }

  // Prevent double initialization - check if script already exists
  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
  if (existingScript) {
    console.log('✅ Google Analytics script already loaded');
    // Ensure gtag function exists (it should already be defined in index.html)
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }
    return;
  }

  // If gtag was already defined in index.html, use it; otherwise define it
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }

  // Initialize dataLayer first (before script loads) - matches Google's official code
  window.dataLayer = window.dataLayer || [];

  // Set initial configuration (matches Google's official code)
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  
  // Add error handling for script load
  script.onerror = () => {
    console.error('❌ Failed to load Google Analytics script');
  };
  
  script.onload = () => {
    console.log('✅ Google Analytics script loaded successfully:', GA4_MEASUREMENT_ID);
    console.log('✅ You should see data in GA Real-time reports within 1-2 minutes');
    
    // Verify gtag is now properly available
    if (typeof window.gtag === 'function') {
      console.log('✅ gtag function is ready');
      
      // Send initial page view after script loads
      window.gtag('config', GA4_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
      
      // Test event to verify everything works
      window.gtag('event', 'analytics_initialized', {
        event_category: 'system',
        event_label: 'GA4_loaded',
      });
      console.log('✅ Test event sent - check GA Real-time reports');
    } else {
      console.error('❌ gtag function not available after script load');
    }
  };
  
  document.head.appendChild(script);

  console.log('🚀 Google Analytics initialization started:', GA4_MEASUREMENT_ID);
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('⚠️ GA4 Measurement ID not found for page view tracking');
    return;
  }

  // Initialize dataLayer if not already done
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag if not exists (fallback) - matches Google's official pattern
    if (!window.gtag) {
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }

    // Track page view
    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });

    console.log('📊 Page view tracked:', { path, title: title || document.title });
  }
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  parameters?: {
    [key: string]: any;
  }
) => {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('⚠️ GA4 Measurement ID not found for event tracking:', eventName);
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // Initialize dataLayer if not already done
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag if not exists (fallback)
  if (!window.gtag) {
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
  }

  const eventParams = {
    ...parameters,
    event_category: parameters?.event_category || 'engagement',
  };

  window.gtag('event', eventName, eventParams);
  console.log('📈 Event tracked:', eventName, eventParams);
};

/**
 * E-commerce: Track product view
 */
export const trackProductView = (product: {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
}) => {
  trackEvent('view_item', {
    currency: product.currency || 'INR',
    value: product.price || 0,
    items: [
      {
        item_id: product.item_id,
        item_name: product.item_name,
        item_category: product.item_category,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
};

/**
 * E-commerce: Track add to cart
 */
export const trackAddToCart = (product: {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
}) => {
  trackEvent('add_to_cart', {
    currency: product.currency || 'INR',
    value: product.price ? product.price * (product.quantity || 1) : 0,
    items: [
      {
        item_id: product.item_id,
        item_name: product.item_name,
        item_category: product.item_category,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
};

/**
 * E-commerce: Track remove from cart
 */
export const trackRemoveFromCart = (product: {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
}) => {
  trackEvent('remove_from_cart', {
    currency: product.currency || 'INR',
    value: product.price ? product.price * (product.quantity || 1) : 0,
    items: [
      {
        item_id: product.item_id,
        item_name: product.item_name,
        item_category: product.item_category,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
};

/**
 * E-commerce: Track begin checkout
 */
export const trackBeginCheckout = (items: Array<{
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}>, value: number, currency: string = 'INR') => {
  trackEvent('begin_checkout', {
    currency,
    value,
    items: items.map(item => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * E-commerce: Track purchase
 */
export const trackPurchase = (transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  tax?: number;
  shipping?: number;
  items: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
}) => {
  trackEvent('purchase', {
    transaction_id: transaction.transaction_id,
    currency: transaction.currency || 'INR',
    value: transaction.value,
    tax: transaction.tax || 0,
    shipping: transaction.shipping || 0,
    items: transaction.items.map(item => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

/**
 * Track sign up
 */
export const trackSignUp = (method: string = 'email') => {
  trackEvent('sign_up', {
    method,
  });
};

/**
 * Track login
 */
export const trackLogin = (method: string = 'email') => {
  trackEvent('login', {
    method,
  });
};

