/**
 * Shopping Cart Context
 * Manages cart state across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CART_STORAGE_KEY } from './cartUtils';

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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product_id === product.product_id
      );

      if (existingItem) {
        // Update quantity if item already in cart
        return currentItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item to cart
      return [...currentItems, { ...product, quantity }];
    });
  };

  const removeItem = (productId: number | string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product_id !== productId)
    );
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const isInCart = (productId: number | string): boolean => {
    return items.some((item) => item.product_id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
