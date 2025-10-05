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
 * Initialize autologin for Directus - ONLY for Visual Editor context
 * Regular users should NOT be auto-logged in with .env credentials
 */
export async function initializeDirectusAutoLogin(): Promise<boolean> {
  try {
    console.log('🔄 Initializing Directus autologin...');
    
    // ONLY auto-login in Directus Visual Editor context
    if (isInDirectusEditor()) {
      const envEmail = import.meta.env.VITE_DIRECTUS_EMAIL;
      const envPassword = import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (envEmail && envPassword) {
        console.log('🎯 Directus Editor detected - attempting admin auto-login');
        const sessionAuth = await DirectusService.authenticate(envEmail, envPassword);
        
        if (sessionAuth) {
          const user = await DirectusService.getCurrentUser();
          if (user) {
            console.log('✅ Visual Editor authentication successful');
            console.log('👤 Authenticated as:', user.email, '| Role:', user.role);
            return true;
          }
        }
      }
    }
    
    // For regular users: just use static token for read-only operations
    // DO NOT auto-authenticate with admin credentials
    console.log('👥 Regular user context - skipping auto-login');
    const success = await DirectusService.autoLogin();
    
    if (success) {
      console.log('✅ Static token initialized for read-only operations');
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
