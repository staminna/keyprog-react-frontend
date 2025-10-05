/**
 * Auth utility functions
 */

import { sessionDirectus } from '@/lib/directus';

// Helper function to clear session
export const clearAuthSession = async () => {
  try {
    await sessionDirectus.setToken(null);
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
};
