import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Add a small delay to ensure any pending authentication has completed
    const checkAuthTimer = setTimeout(() => {
      checkAuthorization();
    }, 50);
    
    return () => clearTimeout(checkAuthTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Re-check when route changes

  const checkAuthorization = async () => {
    try {
      // Check if user is authenticated
      const user = await DirectusService.getCurrentUser();
      
      if (!user) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Get user's role ID
      const userRoleId = user?.roleId || user?.role;
      const userRoleName = user?.role;
      
      console.log('🔒 ProtectedRoute authorization check:', {
        pathname: location.pathname,
        userRoleId,
        userRoleName,
        requiredRoles,
        userObject: user
      });
      
      // SECURITY: Explicitly block Cliente role from accessing protected routes
      const clienteRoleId = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID;
      if (userRoleId === clienteRoleId) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // If no specific roles required, just check authentication (but Cliente is still blocked)
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user has required role
      const hasRequiredRole = requiredRoles.some(role => {
        // Match by UUID (role ID)
        if (userRoleId === role) {
          console.log('✅ Role matched by ID:', role);
          return true;
        }
        
        // Match by role name (case-insensitive)
        if (userRoleName?.toLowerCase() === role.toLowerCase()) {
          console.log('✅ Role matched by name (exact):', role);
          return true;
        }
        
        // Match common role names
        if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator') {
          const matches = userRoleName?.toLowerCase().includes('admin');
          console.log('🔍 Admin check:', { role, userRoleName, matches });
          return matches;
        }
        
        if (role.toLowerCase() === 'editor' || role.toLowerCase() === 'editor-user') {
          const matches = userRoleName?.toLowerCase().includes('editor');
          console.log('🔍 Editor check:', { role, userRoleName, matches });
          return matches;
        }
        
        console.log('❌ No match for role:', role);
        return false;
      });

      console.log('🎯 Authorization result:', { hasRequiredRole, willAuthorize: hasRequiredRole });
      setIsAuthorized(hasRequiredRole);
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to login page or home with return URL
    return <Navigate to={`/login?return=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
