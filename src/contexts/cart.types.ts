/**
 * Shopping Cart Types and Context Definition
 */

import { createContext } from 'react';

export interface CartItem {
  product_id: number | string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number | string) => boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
