import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Initialize Google Analytics
if (typeof window !== 'undefined') {
  initGA();
}

// Suppress Instagram CORS errors from cluttering the console
if (typeof window !== 'undefined') {
  const isInstagramError = (text: string) => 
    text.includes('instagram.com') || 
    text.includes('cdninstagram.com') ||
    text.includes('ERR_BLOCKED_BY_RESPONSE') ||
    text.includes('NotSameOrigin');

  // Suppress console errors and warnings
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    if (!isInstagramError(args.join(' '))) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args: any[]) => {
    if (!isInstagramError(args.join(' '))) {
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
