import { DirectusService } from './directusService';

/**
 * Check if we're in Directus Visual Editor context
 */
function isInDirectusEditor(): boolean {
  try {
    const isInIframe = window.self !== window.top;
    const referrer = document.referrer;
    const isFromDirectus = referrer.includes('localhost:8065') || referrer.includes('/admin/');
    return isInIframe && isFromDirectus;
  } catch {
    return false;
  }
}

/**
 * Initialize autologin for Directus - OPTIMIZED version
 * ONLY for Visual Editor context, regular users use static token
 */
export async function initializeDirectusAutoLogin(): Promise<boolean> {
  try {
    // ONLY auto-login in Directus Visual Editor context
    if (isInDirectusEditor()) {
      const envEmail = import.meta.env.VITE_DIRECTUS_EMAIL;
      const envPassword = import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (envEmail && envPassword) {
        const sessionAuth = await DirectusService.authenticate(envEmail, envPassword);
        
        if (sessionAuth) {
          const user = await DirectusService.getCurrentUser();
          if (user) {
            // Only log in development
            if (import.meta.env.DEV) {
              console.log('✅ Visual Editor auth:', user.email);
            }
            return true;
          }
        }
      }
    }
    
    // For regular users: use static token for read-only operations
    const success = await DirectusService.autoLogin();
    return success;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Autologin error:', error);
    }
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
    return false;
  }
}

/**
 * Force re-authentication with Directus
 */
export async function forceDirectusReauth(email?: string, password?: string): Promise<boolean> {
  try {
    return await DirectusService.authenticate(email, password);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Re-auth error:', error);
    }
    return false;
  }
}
