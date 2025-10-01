import { useUnifiedAuth } from './useUnifiedAuth';

/**
 * @deprecated Use useUnifiedAuth instead
 * This hook is kept for backward compatibility but now uses UnifiedAuthContext
 */
export const useRolePermissions = () => {
  const { isAuthenticated, user, canEdit, canAdmin } = useUnifiedAuth();

  return {
    userRole: user?.role || 'public',
    isLoading: false,
    canEditContent: () => canEdit,
    canEditCollection: () => canEdit,
    isAdmin: canAdmin,
    isEditor: canEdit,
    isAuthenticated
  };
};

export default useRolePermissions;
