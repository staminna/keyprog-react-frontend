/**
 * Medusa API Client
 * Client-side utilities for authentication and storage
 * Adapted from Next.js server-side cookies to client-side localStorage
 */

// Storage keys
const AUTH_TOKEN_KEY = "_medusa_jwt";
const CART_ID_KEY = "_medusa_cart_id";
const CACHE_ID_KEY = "_medusa_cache_id";

/**
 * Get authentication headers for API requests
 * @returns Authorization header object or empty object
 */
export const getAuthHeaders = (): { authorization: string } | Record<string, never> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return {};
  }

  return { authorization: `Bearer ${token}` };
};

/**
 * Set authentication token in localStorage
 * @param token - JWT token from Medusa
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Get current authentication token
 * @returns Token string or null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns True if token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get cart ID from localStorage
 * @returns Cart ID or null
 */
export const getCartId = (): string | null => {
  return localStorage.getItem(CART_ID_KEY);
};

/**
 * Set cart ID in localStorage
 * @param cartId - Cart ID from Medusa
 */
export const setCartId = (cartId: string): void => {
  localStorage.setItem(CART_ID_KEY, cartId);
};

/**
 * Remove cart ID from localStorage
 */
export const removeCartId = (): void => {
  localStorage.removeItem(CART_ID_KEY);
};

/**
 * Get cache ID for cache invalidation
 * @returns Cache ID or null
 */
export const getCacheId = (): string | null => {
  return localStorage.getItem(CACHE_ID_KEY);
};

/**
 * Set cache ID in localStorage
 * @param cacheId - Cache ID
 */
export const setCacheId = (cacheId: string): void => {
  localStorage.setItem(CACHE_ID_KEY, cacheId);
};

/**
 * Clear all Medusa-related data from localStorage
 * Useful for logout or reset operations
 */
export const clearMedusaStorage = (): void => {
  removeAuthToken();
  removeCartId();
  localStorage.removeItem(CACHE_ID_KEY);
};
