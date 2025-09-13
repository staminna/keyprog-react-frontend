/**
 * Configuration for connecting to the Directus MCP server
 */

// MCP Server configuration
export const MCP_CONFIG = {
  // Directus MCP server URL
  SERVER_URL: process.env.VITE_MCP_SERVER_URL || 'http://localhost:3001',
  
  // Directus instance URL (should match the one in MCP server config)
  DIRECTUS_URL: process.env.VITE_DIRECTUS_URL || 'http://localhost:8065',
  
  // Connection timeout in milliseconds
  TIMEOUT: 30000,
  
  // Number of retries for failed requests
  RETRIES: 3,
  
  // Delay between retries in milliseconds
  RETRY_DELAY: 1000,
  
  // Maximum retry delay in milliseconds
  MAX_RETRY_DELAY: 10000,
  
  // Enable WebSocket for real-time updates
  WEBSOCKET_ENABLED: true,
};

// Editable content configuration
export const EDITABLE_CONFIG = {
  // Default collections for different content types
  COLLECTIONS: {
    PAGES: 'pages',
    SERVICES: 'services',
    PRODUCTS: 'products',
    NEWS: 'news',
    SETTINGS: 'settings',
    HERO: 'hero',
  },
  
  // Default fields for different content types
  FIELDS: {
    TITLE: 'title',
    CONTENT: 'content',
    DESCRIPTION: 'description',
    IMAGE: 'image',
    STATUS: 'status',
  },
  
  // Authentication settings
  AUTH: {
    // Whether to require authentication for editing in React (outside Directus)
    REQUIRE_AUTH: true,
    
    // Whether to allow editing in Directus Visual Editor mode
    ALLOW_DIRECTUS_EDITOR: true,
    
    // Whether to allow editing when authenticated with Directus
    ALLOW_DIRECTUS_AUTH: true,
  },
};

// Export default configuration
export default {
  MCP: MCP_CONFIG,
  EDITABLE: EDITABLE_CONFIG,
};
