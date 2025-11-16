/**
 * Product price calculation utilities
 * Handles variant pricing, original prices, and discount calculations
 * Extracted from Medusa storefront
 */

import { HttpTypes } from "@medusajs/types";
import { getPercentageDiff } from "./percentage";
import { convertToLocale } from "./money";

export type PriceData = {
  calculated_price_number: number;
  calculated_price: string;
  original_price_number: number;
  original_price: string;
  currency_code: string;
  price_type: string;
  percentage_diff: string;
};

/**
 * Get pricing information for a product variant
 * @param variant - The product variant with calculated price data
 * @returns Formatted price data or null if no price available
 */
export const getPricesForVariant = (variant: any): PriceData | null => {
  if (!variant?.calculated_price?.calculated_amount) {
    return null;
  }

  return {
    calculated_price_number: variant.calculated_price.calculated_amount,
    calculated_price: convertToLocale({
      amount: variant.calculated_price.calculated_amount,
      currency_code: variant.calculated_price.currency_code,
    }),
    original_price_number: variant.calculated_price.original_amount,
    original_price: convertToLocale({
      amount: variant.calculated_price.original_amount,
      currency_code: variant.calculated_price.currency_code,
    }),
    currency_code: variant.calculated_price.currency_code,
    price_type: variant.calculated_price.calculated_price.price_list_type,
    percentage_diff: getPercentageDiff(
      variant.calculated_price.original_amount,
      variant.calculated_price.calculated_amount
    ),
  };
};

/**
 * Get pricing information for a product
 * Can return cheapest variant price or specific variant price
 * @param product - The product to get pricing for
 * @param variantId - Optional variant ID to get specific variant price
 * @returns Object containing product and pricing information
 */
export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct;
  variantId?: string;
}) {
  if (!product || !product.id) {
    throw new Error("No product provided");
  }

  const cheapestPrice = (): PriceData | null => {
    if (!product || !product.variants?.length) {
      return null;
    }

    const cheapestVariant: any = product.variants
      .filter((v: any) => !!v.calculated_price)
      .sort((a: any, b: any) => {
        return (
          a.calculated_price.calculated_amount -
          b.calculated_price.calculated_amount
        );
      })[0];

    return getPricesForVariant(cheapestVariant);
  };

  const variantPrice = (): PriceData | null => {
    if (!product || !variantId) {
      return null;
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    );

    if (!variant) {
      return null;
    }

    return getPricesForVariant(variant);
  };

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  };
}
