import { DirectusService } from './directusService';

// Only these roles should auto-login with .env credentials
const ALLOWED_AUTO_LOGIN_ROLES = [
  '0582d74b-a83f-4076-849f-b588e627c868', // Administrator
  '97ef35d8-3d16-458d-8c93-78e35b7105a4', // Editor-user
];

/**
 * Initialize autologin for Directus - ONLY for Editor/Admin roles
 * Cliente users must login manually via the login form
 */
export async function initializeDirectusAutoLogin(): Promise<boolean> {
  try {
    console.log('🔄 Initializing Directus autologin (Editor/Admin only)...');
    
    // Try session-based authentication first using .env credentials
    const envEmail = import.meta.env.VITE_DIRECTUS_EMAIL;
    const envPassword = import.meta.env.VITE_DIRECTUS_PASSWORD;
    
    if (envEmail && envPassword) {
      console.log('🔑 Attempting session login with .env credentials');
      const sessionAuth = await DirectusService.authenticate(envEmail, envPassword);
      
      if (sessionAuth) {
        // Check if the authenticated user has an allowed role
        const user = await DirectusService.getCurrentUser();
        if (user && user.roleId) {
          if (ALLOWED_AUTO_LOGIN_ROLES.includes(user.roleId)) {
            console.log('✅ Session authentication successful');
            console.log('👤 Authenticated as:', user.email, '| Role:', user.role);
            return true;
          } else {
            // User authenticated but doesn't have editor/admin role
            console.log('⚠️ User authenticated but not an editor/admin - logging out');
            await DirectusService.logout();
            return false;
          }
        }
      } else {
        console.warn('⚠️ Session authentication failed - credentials may be incorrect');
      }
    }
    
    // Fallback to static token autologin (read-only)
    const success = await DirectusService.autoLogin();
    
    if (success) {
      console.log('✅ Directus autologin initialized with static token (read-only mode)');
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
