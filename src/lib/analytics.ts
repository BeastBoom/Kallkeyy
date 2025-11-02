/**
 * Google Analytics 4 (GA4) Integration
 * Handles page views, events, and e-commerce tracking
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer?: any[];
  }
}

// Get GA4 Measurement ID from environment variable
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') {
    console.warn('Google Analytics Measurement ID not found. Set VITE_GA4_MEASUREMENT_ID environment variable.');
    return;
  }

  // Load gtag.js script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });

  console.log('Google Analytics initialized:', GA4_MEASUREMENT_ID);
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (!window.gtag || !GA4_MEASUREMENT_ID) return;

  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
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
  if (!window.gtag || !GA4_MEASUREMENT_ID) return;

  window.gtag('event', eventName, {
    ...parameters,
    event_category: parameters?.event_category || 'engagement',
  });
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

