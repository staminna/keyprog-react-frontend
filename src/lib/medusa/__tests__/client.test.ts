import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAuthHeaders,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  isAuthenticated,
  getCartId,
  setCartId,
  removeCartId,
  getCacheId,
  setCacheId,
  clearMedusaStorage,
} from '../client';

describe('Medusa Client Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Authentication Token Management', () => {
    it('should set and get auth token', () => {
      const token = 'test_token_12345';
      setAuthToken(token);
      expect(getAuthToken()).toBe(token);
    });

    it('should return auth headers when token exists', () => {
      const token = 'test_token_12345';
      setAuthToken(token);
      const headers = getAuthHeaders();
      expect(headers).toEqual({ authorization: `Bearer ${token}` });
    });

    it('should return empty object when no token exists', () => {
      const headers = getAuthHeaders();
      expect(headers).toEqual({});
    });

    it('should remove auth token', () => {
      const token = 'test_token_12345';
      setAuthToken(token);
      expect(getAuthToken()).toBe(token);

      removeAuthToken();
      expect(getAuthToken()).toBeNull();
    });

    it('should check if user is authenticated', () => {
      expect(isAuthenticated()).toBe(false);

      setAuthToken('test_token');
      expect(isAuthenticated()).toBe(true);

      removeAuthToken();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Cart ID Management', () => {
    it('should set and get cart ID', () => {
      const cartId = 'cart_12345';
      setCartId(cartId);
      expect(getCartId()).toBe(cartId);
    });

    it('should remove cart ID', () => {
      const cartId = 'cart_12345';
      setCartId(cartId);
      expect(getCartId()).toBe(cartId);

      removeCartId();
      expect(getCartId()).toBeNull();
    });

    it('should return null when no cart ID exists', () => {
      expect(getCartId()).toBeNull();
    });
  });

  describe('Cache ID Management', () => {
    it('should set and get cache ID', () => {
      const cacheId = 'cache_12345';
      setCacheId(cacheId);
      expect(getCacheId()).toBe(cacheId);
    });

    it('should return null when no cache ID exists', () => {
      expect(getCacheId()).toBeNull();
    });
  });

  describe('Clear Storage', () => {
    it('should clear all Medusa-related data', () => {
      setAuthToken('test_token');
      setCartId('cart_12345');
      setCacheId('cache_12345');

      expect(getAuthToken()).toBe('test_token');
      expect(getCartId()).toBe('cart_12345');
      expect(getCacheId()).toBe('cache_12345');

      clearMedusaStorage();

      expect(getAuthToken()).toBeNull();
      expect(getCartId()).toBeNull();
      expect(getCacheId()).toBeNull();
    });
  });
});
