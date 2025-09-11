import { directus, type DirectusSchema, type DirectusProduct } from '@/lib/directus';
import { DirectusService } from './directusService';
import { FallbackService } from './fallbackService';
import { readItems, readItem, createItem, updateItem } from '@directus/sdk';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  slug: string;
  category?: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  inventory_count?: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags?: string[];
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_category?: string;
  sort_order?: number;
}

export interface ProductFilter {
  category?: string;
  price_min?: number;
  price_max?: number;
  tags?: string[];
  featured?: boolean;
  status?: string;
  search?: string;
}

export class ProductService {
  static async getProducts(filter?: ProductFilter, limit = 50, offset = 0): Promise<Product[]> {
    try {
      await DirectusService.authenticate();
      
      const queryFilter: Record<string, unknown> = {};
      
      if (filter) {
        if (filter.category) queryFilter.category = { _eq: filter.category };
        if (filter.price_min !== undefined) queryFilter.price = { _gte: filter.price_min };
        if (filter.price_max !== undefined) {
          queryFilter.price = { ...(queryFilter.price as Record<string, unknown> || {}), _lte: filter.price_max };
        }
        if (filter.tags && filter.tags.length > 0) {
          queryFilter.tags = { _intersects: filter.tags };
        }
        if (filter.featured !== undefined) queryFilter.featured = { _eq: filter.featured };
        if (filter.status) queryFilter.status = { _eq: filter.status };
      }

      const products = await directus.request(
        readItems('products', {
          filter: queryFilter,
          limit,
          offset,
          sort: ['-created_at'],
          _fields: ['*', 'category.name', 'category.slug'] as readonly string[],
          get fields() {
            return this._fields;
          },  
          set fields(value) {
            this._fields = value;
          },
          meta: ['filter_count']
        })
      );

      return products as unknown as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback product data');
      const fallbackProducts = FallbackService.getProducts();
      
      // Apply filters to fallback data
      let filteredProducts = [...fallbackProducts];
      
      if (filter) {
        if (filter.category) {
          filteredProducts = filteredProducts.filter(p => p.category?.toString() === filter.category);
        }
        if (filter.price_min !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price >= filter.price_min!);
        }
        if (filter.price_max !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price <= filter.price_max!);
        }
        if (filter.featured !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.featured === filter.featured);
        }
        if (filter.status) {
          filteredProducts = filteredProducts.filter(p => p.status === filter.status);
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description?.toLowerCase().includes(searchLower)
          );
        }
      }
      
      // Apply pagination
      return filteredProducts.slice(offset, offset + limit) as unknown as Product[];
    }
  }

  static async getProduct(slug: string): Promise<Product | null> {
    try {
      await DirectusService.authenticate();
      
      const product = await directus.request(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readItem('products' as any, slug, {
          fields: ['*', 'category.name', 'category.slug']
        })
      );

      return product as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback product data');
      const fallbackProducts = FallbackService.getProducts();
      const product = fallbackProducts.find(p => p.id === slug || p.slug === slug);
      return product as Product || null;
    }
  }

  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    return this.getProducts({ featured: true, status: 'published' }, limit);
  }

  static async getProductsByCategory(categorySlug: string, limit = 20): Promise<Product[]> {
    return this.getProducts({ category: categorySlug, status: 'published' }, limit);
  }

  static async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await DirectusService.authenticate();
      
      const products = await directus.request(
        readItems('products', {
          filter: {
            _or: [
              { slug: { _eq: query } },
              { name: { _contains: query } },
              { description: { _contains: query } }
            ]
          },
          _fields_1: ['*', 'category.name', 'category.slug'] as readonly string[],
          get fields() {
            return this._fields_1;
          },
          set fields(value) {
            this._fields_1 = value;
          },
          limit: limit
        })
      );

      return products as unknown as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      await DirectusService.authenticate();
      
      const newProduct = await directus.request(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createItem('products' as any, {
          ...productData,
          status: productData.status || 'draft'
        })
      );

      return newProduct as unknown as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      await DirectusService.authenticate();
      
      const updatedProduct = await directus.request(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateItem('products' as any, id, productData)
      );

      return updatedProduct as unknown as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<ProductCategory[]> {
    try {
      await DirectusService.authenticate();
      
      const categories = await directus.request(
        readItems('categories', {
          sort: ['title', 'id'],
          fields: ['*']
        })
      );

      return categories.map((category: Record<string, unknown>) => ({
        id: category.id as string,
        name: (category.title as string) || '',
        title: category.title as string,
        slug: category.slug as string,
        image: category.image as string
      })) as ProductCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback category data');
      const fallbackCategories = FallbackService.getCategories();
      return fallbackCategories.map(category => ({
        id: category.id as string,
        name: category.title || '',
        title: category.title || '',
        slug: category.slug as string,
        image: category.image as string
      })) as ProductCategory[];
    }
  }

  static async getCategory(slug: string): Promise<ProductCategory | null> {
    try {
      await DirectusService.authenticate();
      
      const categories = await directus.request(
        readItems('categories', {
          filter: { slug: { _eq: slug } }
        })
      );

      const category = categories[0];
      if (!category) return null;
      
      return {
        id: category.id as string,
        name: (category.title as string) || '',
        title: category.title as string,
        slug: category.slug as string,
        image: category.image as string
      } as ProductCategory;
    } catch (error) {
      console.error('Error fetching category:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback category data');
      const fallbackCategory = FallbackService.getCategory(slug);
      if (!fallbackCategory) return null;
      
      return {
        id: fallbackCategory.id as string,
        name: fallbackCategory.title || '',
        title: fallbackCategory.title || '',
        slug: fallbackCategory.slug as string,
        image: fallbackCategory.image as string
      } as ProductCategory;
    }
  }

  static getImageUrl(imageId: string): string {
    return DirectusService.getImageUrl(imageId);
  }
}
