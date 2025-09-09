import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient()

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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
