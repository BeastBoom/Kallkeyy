import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";
// Debug utilities only loaded in development
if (import.meta.env.DEV) {
  import("./lib/analytics-debug");
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Initialize Google Analytics as early as possible
if (typeof window !== 'undefined') {
  // Use DOMContentLoaded to ensure DOM is ready, but if already loaded, run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGA();
    });
  } else {
    // DOM already loaded
    initGA();
  }
}

// Suppress Instagram CORS errors from cluttering the console
if (typeof window !== 'undefined') {
  const isInstagramError = (text: string) => 
    text.includes('instagram.com') || 
    text.includes('cdninstagram.com') ||
    text.includes('ERR_BLOCKED_BY_RESPONSE') ||
    text.includes('NotSameOrigin');

  // Suppress console errors and warnings (but allow Google Analytics messages)
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!isInstagramError(message) && !message.includes('Failed to load Google Analytics')) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    // Don't suppress GA warnings - they're important for debugging
    if (!isInstagramError(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Suppress resource loading errors
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    const text = (event.message || (target as any)?.src || '').toString();
    
    if ((target?.tagName === 'IMG' || target?.tagName === 'SCRIPT') && isInstagramError(text)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Suppress promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const text = (event.reason?.message || event.reason || '').toString();
    if (isInstagramError(text)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
