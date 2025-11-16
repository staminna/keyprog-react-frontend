import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  retrieveCart,
  getOrSetCart,
  updateCart,
  addToCart,
  updateLineItem,
  deleteLineItem,
  setShippingMethod,
  applyPromotions,
  placeOrder,
  listCartShippingOptions,
} from '../cart';
import { setCartId, getCartId, removeCartId } from '../../client';
import { server } from '@/test/mocks/server';
import { mockCart, mockCartWithItems, mockShippingOption, mockOrder } from '@/test/mocks/handlers';

describe('Cart API Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('retrieveCart', () => {
    it('should retrieve a cart by ID', async () => {
      setCartId('cart_01');
      const cart = await retrieveCart();

      expect(cart).toBeDefined();
      expect(cart?.id).toBe('cart_01');
    });

    it('should return null when no cart ID exists', async () => {
      const cart = await retrieveCart();
      expect(cart).toBeNull();
    });

    it('should retrieve a cart with specific ID', async () => {
      const cart = await retrieveCart('cart_01');

      expect(cart).toBeDefined();
      expect(cart?.id).toBe('cart_01');
    });
  });

  describe('getOrSetCart', () => {
    it('should create a new cart when none exists', async () => {
      const cart = await getOrSetCart('reg_01');

      expect(cart).toBeDefined();
      expect(cart.region_id).toBe('reg_01');
      expect(getCartId()).toBeTruthy();
    });

    it('should return existing cart when one exists', async () => {
      setCartId('cart_01');
      const cart = await getOrSetCart('reg_01');

      expect(cart).toBeDefined();
      expect(cart.id).toBe('cart_01');
    });

    it('should update cart region if different', async () => {
      setCartId('cart_01');
      const cart = await getOrSetCart('reg_02');

      expect(cart).toBeDefined();
    });
  });

  describe('updateCart', () => {
    it('should update cart with new data', async () => {
      setCartId('cart_01');
      const cart = await updateCart({ email: 'test@example.com' });

      expect(cart).toBeDefined();
    });

    it('should throw error when no cart exists', async () => {
      await expect(updateCart({ email: 'test@example.com' }))
        .rejects
        .toThrow('No existing cart found');
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const cart = await addToCart({
        variantId: 'variant_01',
        quantity: 2,
        regionId: 'reg_01',
      });

      expect(cart).toBeDefined();
      expect(cart.items).toBeDefined();
      expect(cart.items.length).toBeGreaterThan(0);
    });

    it('should throw error when variant ID is missing', async () => {
      await expect(addToCart({
        variantId: '',
        quantity: 2,
        regionId: 'reg_01',
      })).rejects.toThrow('Missing variant ID');
    });

    it('should create cart if none exists', async () => {
      const cart = await addToCart({
        variantId: 'variant_01',
        quantity: 1,
        regionId: 'reg_01',
      });

      expect(cart).toBeDefined();
      expect(getCartId()).toBeTruthy();
    });
  });

  describe('updateLineItem', () => {
    it('should update line item quantity', async () => {
      setCartId('cart_01');
      const cart = await updateLineItem({
        lineId: 'item_01',
        quantity: 3,
      });

      expect(cart).toBeDefined();
    });

    it('should throw error when line ID is missing', async () => {
      setCartId('cart_01');
      await expect(updateLineItem({
        lineId: '',
        quantity: 3,
      })).rejects.toThrow('Missing lineItem ID');
    });

    it('should throw error when no cart exists', async () => {
      await expect(updateLineItem({
        lineId: 'item_01',
        quantity: 3,
      })).rejects.toThrow('Missing cart ID');
    });
  });

  describe('deleteLineItem', () => {
    it('should delete line item from cart', async () => {
      setCartId('cart_01');
      const cart = await deleteLineItem('item_01');

      expect(cart).toBeDefined();
    });

    it('should throw error when line ID is missing', async () => {
      setCartId('cart_01');
      await expect(deleteLineItem('')).rejects.toThrow('Missing lineItem ID');
    });

    it('should throw error when no cart exists', async () => {
      await expect(deleteLineItem('item_01')).rejects.toThrow('Missing cart ID');
    });
  });

  describe('setShippingMethod', () => {
    it('should set shipping method for cart', async () => {
      await expect(setShippingMethod({
        cartId: 'cart_01',
        shippingMethodId: 'so_01',
      })).resolves.not.toThrow();
    });
  });

  describe('listCartShippingOptions', () => {
    it('should list available shipping options', async () => {
      setCartId('cart_01');
      const options = await listCartShippingOptions();

      expect(options).toBeDefined();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveProperty('id');
    });

    it('should return empty array when no cart exists', async () => {
      const options = await listCartShippingOptions();
      expect(options).toEqual([]);
    });
  });

  describe('applyPromotions', () => {
    it('should apply promotion codes to cart', async () => {
      setCartId('cart_01');
      const cart = await applyPromotions(['SAVE10']);

      expect(cart).toBeDefined();
    });

    it('should throw error when no cart exists', async () => {
      await expect(applyPromotions(['SAVE10']))
        .rejects
        .toThrow('No existing cart found');
    });
  });

  describe('placeOrder', () => {
    it('should complete cart and place order', async () => {
      setCartId('cart_01');
      const result = await placeOrder();

      expect(result).toBeDefined();
      expect(result.type).toBe('order');

      if (result.type === 'order') {
        expect(result.order).toBeDefined();
        expect(result.order.id).toBeTruthy();
      }

      // Cart ID should be removed after successful order
      expect(getCartId()).toBeNull();
    });

    it('should throw error when no cart exists', async () => {
      await expect(placeOrder()).rejects.toThrow('No existing cart found');
    });

    it('should use provided cart ID', async () => {
      const result = await placeOrder('cart_01');
      expect(result).toBeDefined();
    });
  });
});
