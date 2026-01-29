import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";

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

// Note: All console logging removed from frontend for clean production logs
// Error suppression logic removed to keep code simple

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
