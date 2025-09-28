/**
 * Visual Editor Bridge - Establishes communication between Directus Visual Editor and the React app
 * This script is loaded in the React app and provides authentication between the two contexts
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're in an iframe (likely Directus Visual Editor)
  const isIframe = window.parent !== window;
  
  if (!isIframe) {
    // Not in iframe, no need for bridge
    return;
  }
  
  console.log('📡 Visual Editor Bridge: Initializing communication with parent');
  
  // Setup message handler to listen for Directus parent messages
  window.addEventListener('message', (event) => {
    // Validate message is from parent
    if (event.source !== window.parent) {
      return;
    }
    
    // Process messages from Directus parent
    if (event.data && typeof event.data === 'object') {
      // Handle auth token from parent
      if (event.data.type === 'directus:auth' && event.data.token) {
        console.log('🔑 Visual Editor Bridge: Received auth token');
        
        // Store token for use in API requests
        localStorage.setItem('directus_visual_editor_token', event.data.token);
        
        // Create global directus object for API access
        window.directus = {
          getToken: () => event.data.token,
          isVisualEditor: true
        };
        
        // Dispatch custom event for other scripts to react to authentication
        window.dispatchEvent(new CustomEvent('directus:authenticated', {
          detail: { token: event.data.token }
        }));
      }
      
      // Handle initialization from parent
      if (event.data.type === 'directus:init') {
        console.log('🚀 Visual Editor Bridge: Directus parent initialized');
        
        // Notify parent that iframe is ready
        window.parent.postMessage({
          type: 'iframe:ready',
          source: 'react-frontend'
        }, '*');
      }
    }
  });
  
  // Notify parent that iframe is loading
  try {
    window.parent.postMessage({
      type: 'iframe:loading',
      source: 'react-frontend'
    }, '*');
    console.log('📣 Visual Editor Bridge: Sent loading notification');
  } catch (error) {
    console.warn('⚠️ Visual Editor Bridge: Failed to send loading message', error);
  }
  
  // Check URL parameters for token (fallback method)
  const searchParams = new URLSearchParams(window.location.search);
  const tokenParam = searchParams.get('directus_token');
  
  if (tokenParam) {
    console.log('🔑 Visual Editor Bridge: Found token in URL parameters');
    localStorage.setItem('directus_visual_editor_token', tokenParam);
    
    // Create global directus object for API access
    window.directus = {
      getToken: () => tokenParam,
      isVisualEditor: true
    };
    
    // Dispatch custom event for other scripts to react to authentication
    window.dispatchEvent(new CustomEvent('directus:authenticated', {
      detail: { token: tokenParam }
    }));
  }
});
