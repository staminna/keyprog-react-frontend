import { describe, it, expect, beforeEach } from 'vitest';
import {
  listProducts,
  getProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByCollection,
} from '../products';
import { server } from '@/test/mocks/server';
import { mockProduct } from '@/test/mocks/handlers';

describe('Products API Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('listProducts', () => {
    it('should list products with default pagination', async () => {
      const result = await listProducts({
        regionId: 'reg_01',
      });

      expect(result).toBeDefined();
      expect(result.products).toBeDefined();
      expect(Array.isArray(result.products)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    it('should list products with custom pagination', async () => {
      const result = await listProducts({
        pageParam: 2,
        queryParams: { limit: 5 },
        regionId: 'reg_01',
      });

      expect(result).toBeDefined();
      expect(result.products).toBeDefined();
    });

    it('should calculate next page correctly', async () => {
      const result = await listProducts({
        pageParam: 1,
        queryParams: { limit: 12 },
        regionId: 'reg_01',
      });

      expect(result).toHaveProperty('nextPage');
      // With count=1 and limit=12, nextPage should be null
      expect(result.nextPage).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Temporarily override the handler to return an error
      server.use(
        http.get('http://localhost:9000/store/products', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await listProducts({
        regionId: 'reg_01',
      });

      expect(result.products).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.nextPage).toBeNull();
    });
  });

  describe('getProduct', () => {
    it('should get product by ID', async () => {
      const product = await getProduct('prod_01', 'reg_01');

      expect(product).toBeDefined();
      expect(product?.id).toBe('prod_01');
      expect(product?.title).toBe('Test Product');
    });

    it('should get product by handle', async () => {
      const product = await getProduct('test-product', 'reg_01');

      expect(product).toBeDefined();
      expect(product?.handle).toBeDefined();
    });

    it('should return null on error', async () => {
      server.use(
        http.get('http://localhost:9000/store/products/:id', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const product = await getProduct('non_existent', 'reg_01');
      expect(product).toBeNull();
    });

    it('should include variants with pricing', async () => {
      const product = await getProduct('prod_01', 'reg_01');

      expect(product?.variants).toBeDefined();
      expect(product?.variants.length).toBeGreaterThan(0);
      expect(product?.variants[0]).toHaveProperty('calculated_price');
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const products = await searchProducts('test', 'reg_01');

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it('should search with custom limit', async () => {
      const products = await searchProducts('test', 'reg_01', 5);

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it('should return empty array on error', async () => {
      server.use(
        http.get('http://localhost:9000/store/products', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const products = await searchProducts('test', 'reg_01');
      expect(products).toEqual([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should get products by category ID', async () => {
      const result = await getProductsByCategory('cat_01', 'reg_01');

      expect(result).toBeDefined();
      expect(result.products).toBeDefined();
      expect(Array.isArray(result.products)).toBe(true);
    });

    it('should pass additional query parameters', async () => {
      const result = await getProductsByCategory('cat_01', 'reg_01', {
        limit: 20,
      });

      expect(result).toBeDefined();
    });
  });

  describe('getProductsByCollection', () => {
    it('should get products by collection ID', async () => {
      const result = await getProductsByCollection('col_01', 'reg_01');

      expect(result).toBeDefined();
      expect(result.products).toBeDefined();
      expect(Array.isArray(result.products)).toBe(true);
    });

    it('should pass additional query parameters', async () => {
      const result = await getProductsByCollection('col_01', 'reg_01', {
        limit: 10,
      });

      expect(result).toBeDefined();
    });
  });
});

// Need to import http for error handling tests
import { http, HttpResponse } from 'msw';
