import { useContext } from 'react';
import { UnifiedAuthContext } from '@/contexts/UnifiedAuthContext';

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};
