/**
 * Medusa SDK Configuration
 * Initializes the Medusa client for API communication
 * Adapted from Next.js storefront for React/Vite
 */

import Medusa from "@medusajs/js-sdk";

// Get backend URL from environment variables
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;

// Initialize Medusa SDK
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: import.meta.env.DEV,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
});

// Export configuration
export const config = {
  backendUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
};
