import React, { ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { UniversalPageWrapper } from '@/components/universal/UniversalPageWrapper';

interface EditableContentWrapperProps {
  children: ReactNode;
}

/**
 * Routes where inline editing should be disabled
 */
const EXCLUDED_ROUTES = [
  '/forgot-password',
  '/admin',
  '/login',
  '/reset-password',
  '/verify-email',
  '/registo',
  '/checkout',
  '/editor',
];

/**
 * Check if a path matches any excluded route
 */
const isExcludedRoute = (pathname: string): boolean => {
  return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * A wrapper component that adds site-wide inline editing functionality
 * Automatically wraps content with UniversalPageWrapper for allowed routes
 */
const EditableContentWrapper: React.FC<EditableContentWrapperProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if current route should have inline editing disabled
  const shouldDisableEditing = useMemo(() => {
    return isExcludedRoute(location.pathname);
  }, [location.pathname]);
  
  // If editing should be disabled, render children without wrapper
  if (shouldDisableEditing) {
    return <>{children}</>;
  }
  
  // For all other routes, enable inline editing with UniversalPageWrapper
  return (
    <UniversalPageWrapper 
      collection="pages" 
      itemId="1"
      autoDetect={true}
    >
      {children}
    </UniversalPageWrapper>
  );
};

export default EditableContentWrapper;
