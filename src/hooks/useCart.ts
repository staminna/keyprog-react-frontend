/**
 * useCart hook
 * Access cart context
 */

import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';
import type { CartContextType } from '@/contexts/CartContext';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
