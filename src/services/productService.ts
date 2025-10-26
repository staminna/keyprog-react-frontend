import { directus } from '@/lib/directus';
import { DirectusService } from './directusService';
import { FallbackService } from './fallbackService';
import { readItems, readItem, createItem, updateItem } from '@directus/sdk';

// Define the Directus types that match your schema
type DirectusFile = {
  id: string;
};

type DirectusProductImage = {
  id: number;
  directus_files_id: string | DirectusFile;
  sort: number;
  products_id?: number;
};

type DirectusProduct = {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  status?: 'draft' | 'published' | 'archived';
  category?: number;
  stock?: number;
  images?: DirectusProductImage[];
};

export interface ProductImage {
  id: number;
  directus_files_id: {
    id: string;
  };
  sort: number;
}

export interface Product {
  id: number; // Matches Directus integer ID
  name: string;
  description?: string;
  price: number;
  images: ProductImage[]; // Multiple images via M2M relationship
  status?: 'draft' | 'published' | 'archived';
  category?: number; // Foreign key to categories (integer)
  stock?: number; // Available stock count from Directus
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
  static getImageUrl(imageId: string, width = 400, height = 400, quality = 80): string {
    if (!imageId) return '';
    return `${DirectusService.getBaseUrl()}/assets/${imageId}?width=${width}&height=${height}&quality=${quality}&fit=cover`;
  }
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
        if (filter.status) queryFilter.status = { _eq: filter.status };
      }

      const products = await directus.request(
        readItems('products' as const, {
          filter: queryFilter,
          limit,
          offset,
          sort: ['id'],
          fields: [
            'id', 'name', 'description', 'price', 'status', 'category', 'stock',
            { images: ['id', 'sort', { directus_files_id: ['id'] }] }
          ]
        })
      ) as unknown as DirectusProduct[];

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

  static async getProduct(id: number): Promise<Product | null> {
    try {
      await DirectusService.authenticate();
      
      const product = await directus.request(
        readItem('products' as const, id, {
          fields: [
            'id', 'name', 'description', 'price', 'status', 'category', 'stock',
            { images: ['id', 'sort', { directus_files_id: ['id'] }] }
          ]
        })
      ) as unknown as DirectusProduct | null;

      if (!product) return null;

      // Convert DirectusProduct to Product
      return {
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        images: (product.images || []).map(img => ({
          id: img.id,
          directus_files_id: {
            id: typeof img.directus_files_id === 'string' 
              ? img.directus_files_id 
              : img.directus_files_id?.id || ''
          },
          sort: img.sort || 0
        }))
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback product data');
      const fallbackProducts = FallbackService.getProducts();
      const product = fallbackProducts.find(p => p.id === id);
      return product as Product || null;
    }
  }

  static async getProductsByCategory(categoryId: number, limit = 20): Promise<Product[]> {
    return this.getProducts({ category: categoryId.toString(), status: 'published' }, limit);
  }

  static async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await DirectusService.authenticate();
      
      const products = await directus.request(
        readItems('products', {
          filter: {
            _or: [
              { name: { _contains: query } },
              { description: { _contains: query } }
            ]
          },
          fields: [
            'id', 'name', 'description', 'price', 'image', 'status', 'category', 'stock',
            'images.directus_files_id.*'
          ],
          limit: limit
        })
      );

      return products as unknown as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async createProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      await DirectusService.authenticate();
      
      const { images, ...productWithoutImages } = productData;
      
      const newProduct = await directus.request(
        createItem('products' as const, {
          ...productWithoutImages,
          status: productData.status || 'draft',
          stock: productData.stock || 0
        })
      ) as unknown as DirectusProduct;

      // If there are images to associate, create the relationships
      if (images && images.length > 0) {
        for (const img of images) {
          await directus.request(
            createItem('products_images' as const, {
              products_id: newProduct.id,
              directus_files_id: img.directus_files_id.id,
              sort: img.sort || 0
            })
          );
        }
      }

      return this.getProduct(newProduct.id);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
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

  /**
   * Get all product images (handles both single image and M2M images)
   * @param product - Product object
   * @returns Array of image UUIDs
   */
  static getProductImages(product: Product): string[] {
    if (!product.images || product.images.length === 0) return [];
    
    return product.images
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map(img => 
        typeof img.directus_files_id === 'string' 
          ? img.directus_files_id 
          : img.directus_files_id?.id || ''
      )
      .filter(Boolean);
  }

  /**
   * Get primary product image (first image)
   * @param product - Product object
   * @returns Image UUID or null
   */
  static getPrimaryImage(product: Product): string | null {
    const images = this.getProductImages(product);
    return images[0] || null;
  }

  /**
   * Get all image URLs for display
   * @param product - Product object
   * @returns Array of full image URLs
   */
  static getProductImageUrls(product: Product): string[] {
    return this.getProductImages(product).map(imageId => 
      DirectusService.getImageUrl(imageId)
    );
  }
}
