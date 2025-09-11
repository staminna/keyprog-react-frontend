import { DirectusService } from './directusService';

/**
 * Initialize autologin for Directus
 * This should be called early in the application lifecycle
 */
export async function initializeDirectusAutoLogin(): Promise<boolean> {
  try {
    console.log('🔄 Initializing Directus autologin...');
    const success = await DirectusService.autoLogin();
    
    if (success) {
      console.log('✅ Directus autologin initialized successfully');
      
      // Optionally get current user info to verify authentication
      const user = await DirectusService.getCurrentUser();
      if (user) {
        console.log('👤 Authenticated as:', user.email);
      }
    } else {
      console.warn('⚠️ Directus autologin failed - manual authentication may be required');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error during Directus autologin initialization:', error);
    return false;
  }
}

/**
 * Check if Directus is currently authenticated
 */
export async function isDirectusAuthenticated(): Promise<boolean> {
  try {
    const user = await DirectusService.getCurrentUser();
    return !!user?.authenticated;
  } catch (error) {
    console.error('Error checking Directus authentication status:', error);
    return false;
  }
}

/**
 * Force re-authentication with Directus
 */
export async function forceDirectusReauth(email?: string, password?: string): Promise<boolean> {
  try {
    console.log('🔄 Forcing Directus re-authentication...');
    return await DirectusService.authenticate(email, password);
  } catch (error) {
    console.error('❌ Error during forced re-authentication:', error);
    return false;
  }
}
