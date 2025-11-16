/**
 * Auth utility functions
 */

import { sessionDirectus } from '@/lib/directus';

// Helper function to clear session
export const clearAuthSession = async () => {
  try {
    // Clear token via SDK (this will call the storage.set(null))
    await sessionDirectus.setToken(null);

    // Also clear localStorage keys directly for safety
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('directus_auth_data');
      localStorage.removeItem('directus_session_token'); // Legacy key
    }
  } catch (error) {
    console.error('Error clearing auth session:', error);

    // Force clear localStorage even on error
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('directus_auth_data');
      localStorage.removeItem('directus_session_token'); // Legacy key
    }
  }
};
