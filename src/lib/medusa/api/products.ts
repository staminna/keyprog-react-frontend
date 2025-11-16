/**
 * Products API Functions
 * Client-side product operations for Medusa
 * Adapted from Next.js server actions
 */

import { sdk } from "../config";
import { getAuthHeaders } from "../client";
import { HttpTypes } from "@medusajs/types";

export type ProductListParams = HttpTypes.FindParams & HttpTypes.StoreProductParams;

export type ProductListResponse = {
  products: HttpTypes.StoreProduct[];
  count: number;
  nextPage: number | null;
};

/**
 * List products with pagination
 * @param pageParam - Page number (1-indexed)
 * @param queryParams - Query parameters for filtering and pagination
 * @param regionId - Region ID for pricing
 * @returns Product list with pagination info
 */
export async function listProducts({
  pageParam = 1,
  queryParams,
  regionId,
}: {
  pageParam?: number;
  queryParams?: ProductListParams;
  regionId: string;
}): Promise<ProductListResponse> {
  const limit = queryParams?.limit || 12;
  const _pageParam = Math.max(pageParam, 1);
  const offset = (_pageParam - 1) * limit;

  const headers = getAuthHeaders();

  try {
    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
      count: number;
    }>(`/store/products`, {
      method: "GET",
      query: {
        limit,
        offset,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
        ...queryParams,
      },
      headers,
    });

    const { products, count } = response;
    const nextPage = count > offset + limit ? pageParam + 1 : null;

    return {
      products,
      count,
      nextPage,
    };
  } catch (error) {
    console.error("Error listing products:", error);
    return {
      products: [],
      count: 0,
      nextPage: null,
    };
  }
}

/**
 * Get a single product by ID or handle
 * @param idOrHandle - Product ID or handle
 * @param regionId - Region ID for pricing
 * @returns Product object or null
 */
export async function getProduct(
  idOrHandle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | null> {
  const headers = getAuthHeaders();

  try {
    const response = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(
      `/store/products/${idOrHandle}`,
      {
        method: "GET",
        query: {
          region_id: regionId,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
        },
        headers,
      }
    );

    return response.product;
  } catch (error) {
    console.error(`Error getting product ${idOrHandle}:`, error);
    return null;
  }
}

/**
 * Search products
 * @param query - Search query string
 * @param regionId - Region ID for pricing
 * @param limit - Number of results to return
 * @returns Array of matching products
 */
export async function searchProducts(
  query: string,
  regionId: string,
  limit = 20
): Promise<HttpTypes.StoreProduct[]> {
  const headers = getAuthHeaders();

  try {
    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[];
    }>(`/store/products`, {
      method: "GET",
      query: {
        q: query,
        region_id: regionId,
        limit,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      headers,
    });

    return response.products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

/**
 * Get products by category
 * @param categoryId - Category ID
 * @param regionId - Region ID for pricing
 * @param queryParams - Additional query parameters
 * @returns Product list
 */
export async function getProductsByCategory(
  categoryId: string,
  regionId: string,
  queryParams?: ProductListParams
): Promise<ProductListResponse> {
  return listProducts({
    queryParams: {
      ...queryParams,
      category_id: [categoryId],
    },
    regionId,
  });
}

/**
 * Get products by collection
 * @param collectionId - Collection ID
 * @param regionId - Region ID for pricing
 * @param queryParams - Additional query parameters
 * @returns Product list
 */
export async function getProductsByCollection(
  collectionId: string,
  regionId: string,
  queryParams?: ProductListParams
): Promise<ProductListResponse> {
  return listProducts({
    queryParams: {
      ...queryParams,
      collection_id: [collectionId],
    },
    regionId,
  });
}
