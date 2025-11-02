/**
 * Debug utilities for Google Analytics
 * Use this to verify GA is working correctly
 */

export const checkGAStatus = () => {
  if (typeof window === 'undefined') {
    console.log('❌ Window not available');
    return;
  }

  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const hasDataLayer = !!window.dataLayer;
  const hasGtag = !!window.gtag;
  const hasScript = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');

  console.log('🔍 Google Analytics Status Check:');
  console.log('  Measurement ID:', measurementId || '❌ NOT SET');
  console.log('  dataLayer exists:', hasDataLayer ? '✅' : '❌');
  console.log('  gtag function exists:', hasGtag ? '✅' : '❌');
  console.log('  Script loaded:', hasScript ? '✅' : '❌');
  
  if (hasDataLayer) {
    console.log('  dataLayer contents:', window.dataLayer);
  }

  // Test if we can send an event
  if (hasGtag && measurementId) {
    try {
      window.gtag('event', 'test_event', {
        event_category: 'debug',
        event_label: 'status_check',
      });
      console.log('  ✅ Test event sent successfully');
    } catch (error) {
      console.error('  ❌ Failed to send test event:', error);
    }
  }

  return {
    measurementId,
    hasDataLayer,
    hasGtag,
    hasScript,
  };
};

// Make it available globally for debugging (only in development)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).checkGAStatus = checkGAStatus;
  console.log('💡 Debug: Run checkGAStatus() in console to check GA status');
}


