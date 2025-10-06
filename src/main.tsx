import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDirectusAutoLogin } from './services/autoLogin';
import './utils/directusRefresh'; // Load refresh utilities for debugging
import './utils/testDirectusSync'; // Load sync test utilities

// Initialize Directus autologin
initializeDirectusAutoLogin().catch(error => {
  console.error('Failed to initialize Directus autologin:', error);
});

// Add postMessage handler for Directus Visual Editor
if (window.parent !== window) {
  // We're in an iframe (likely Directus Visual Editor)
  window.addEventListener('message', (event) => {
    // Accept messages from Directus domain
    const allowedOrigins = [
      'http://localhost:8065',
      'https://keyprog.varrho.com'
    ];
    
    if (allowedOrigins.includes(event.origin)) {
      try {
        const data = event.data;
        
        // Handle specific messages from Directus
        if (data && data.type === 'directus-visual-editor') {
          // Respond to Directus to confirm connection
          if (event.source && 'postMessage' in event.source) {
            (event.source as Window).postMessage(
              { type: 'directus-visual-editor-ready', status: 'ok' },
              event.origin
            );
          }
        }
      } catch (error) {
        console.error('Error handling postMessage:', error);
      }
    }
  });
  
  // Notify parent that we're ready
  try {
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
  } catch (e) {
    console.warn('Could not send ready message to parent:', e);
  }
}

// PERFORMANCE FIX: Disable StrictMode in production to prevent double renders
const isProduction = import.meta.env.PROD;

createRoot(document.getElementById('root')!).render(
  isProduction ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
