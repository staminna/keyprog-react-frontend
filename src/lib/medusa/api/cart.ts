/**
 * Cart API Functions
 * Client-side cart operations for Medusa
 * Adapted from Next.js server actions to client-side API calls
 */

import { sdk } from "../config";
import { getAuthHeaders, getCartId, setCartId, removeCartId } from "../client";
import { HttpTypes } from "@medusajs/types";

/**
 * Retrieves a cart by its ID
 * @param cartId - Optional cart ID, defaults to stored cart ID
 * @returns Cart object or null if not found
 */
export async function retrieveCart(cartId?: string): Promise<HttpTypes.StoreCart | null> {
  const id = cartId || getCartId();

  if (!id) {
    return null;
  }

  const headers = getAuthHeaders();

  try {
    const response = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${id}`,
      {
        method: "GET",
        query: {
          fields:
            "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
        },
        headers,
      }
    );
    return response.cart;
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return null;
  }
}

/**
 * Get or create a cart for a specific region
 * @param regionId - Region ID
 * @returns Cart object
 */
export async function getOrSetCart(regionId: string): Promise<HttpTypes.StoreCart> {
  let cart = await retrieveCart();

  const headers = getAuthHeaders();

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: regionId },
      {},
      headers
    );
    cart = cartResp.cart;
    setCartId(cart.id);
  }

  if (cart && cart.region_id !== regionId) {
    await sdk.store.cart.update(cart.id, { region_id: regionId }, {}, headers);
    cart = await retrieveCart(cart.id);
  }

  return cart!;
}

/**
 * Update cart with new data
 * @param data - Cart update data
 * @returns Updated cart
 */
export async function updateCart(
  data: HttpTypes.StoreUpdateCart
): Promise<HttpTypes.StoreCart> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating");
  }

  const headers = getAuthHeaders();

  const { cart } = await sdk.store.cart.update(cartId, data, {}, headers);
  return cart;
}

/**
 * Add item to cart
 * @param variantId - Product variant ID
 * @param quantity - Quantity to add
 * @param regionId - Region ID
 * @returns Updated cart
 */
export async function addToCart({
  variantId,
  quantity,
  regionId,
}: {
  variantId: string;
  quantity: number;
  regionId: string;
}): Promise<HttpTypes.StoreCart> {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart");
  }

  const cart = await getOrSetCart(regionId);

  if (!cart) {
    throw new Error("Error retrieving or creating cart");
  }

  const headers = getAuthHeaders();

  await sdk.store.cart.createLineItem(
    cart.id,
    {
      variant_id: variantId,
      quantity,
    },
    {},
    headers
  );

  // Retrieve updated cart
  const updatedCart = await retrieveCart(cart.id);
  return updatedCart!;
}

/**
 * Update line item quantity
 * @param lineId - Line item ID
 * @param quantity - New quantity
 * @returns Updated cart
 */
export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}): Promise<HttpTypes.StoreCart> {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item");
  }

  const cartId = getCartId();

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item");
  }

  const headers = getAuthHeaders();

  await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, {}, headers);

  const updatedCart = await retrieveCart(cartId);
  return updatedCart!;
}

/**
 * Delete line item from cart
 * @param lineId - Line item ID to delete
 * @returns Updated cart
 */
export async function deleteLineItem(lineId: string): Promise<HttpTypes.StoreCart> {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item");
  }

  const cartId = getCartId();

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item");
  }

  const headers = getAuthHeaders();

  await sdk.store.cart.deleteLineItem(cartId, lineId, headers);

  const updatedCart = await retrieveCart(cartId);
  return updatedCart!;
}

/**
 * Set shipping method for cart
 * @param cartId - Cart ID
 * @param shippingMethodId - Shipping method/option ID
 */
export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string;
  shippingMethodId: string;
}): Promise<void> {
  const headers = getAuthHeaders();

  await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: shippingMethodId },
    {},
    headers
  );
}

/**
 * Initiate payment session for cart
 * @param cart - Cart object
 * @param data - Payment provider data
 * @returns Payment session response
 */
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string;
    context?: Record<string, unknown>;
  }
) {
  const headers = getAuthHeaders();

  return sdk.store.payment.initiatePaymentSession(cart, data, {}, headers);
}

/**
 * Apply promotion codes to cart
 * @param codes - Array of promo codes
 * @returns Updated cart
 */
export async function applyPromotions(codes: string[]): Promise<HttpTypes.StoreCart> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error("No existing cart found");
  }

  const headers = getAuthHeaders();

  const { cart } = await sdk.store.cart.update(
    cartId,
    { promo_codes: codes },
    {},
    headers
  );

  return cart;
}

/**
 * Complete cart and place order
 * @param cartId - Optional cart ID, defaults to stored cart ID
 * @returns Order or cart response
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || getCartId();

  if (!id) {
    throw new Error("No existing cart found when placing an order");
  }

  const headers = getAuthHeaders();

  const cartRes = await sdk.store.cart.complete(id, {}, headers);

  if (cartRes?.type === "order") {
    removeCartId();
    return { type: "order", order: cartRes.order };
  }

  return { type: "cart", cart: cartRes.cart };
}

/**
 * List available shipping options for cart
 * @returns Shipping options
 */
export async function listCartShippingOptions(): Promise<
  HttpTypes.StoreCartShippingOption[]
> {
  const cartId = getCartId();
  const headers = getAuthHeaders();

  if (!cartId) {
    return [];
  }

  const response = await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[];
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    headers,
  });

  return response.shipping_options;
}
