import { http, HttpResponse } from 'msw';

const MEDUSA_BASE_URL = 'http://localhost:9000';

// Mock data
export const mockRegion = {
  id: 'reg_01',
  name: 'US',
  currency_code: 'usd',
  countries: [{ iso_2: 'us', name: 'United States' }],
};

export const mockProduct = {
  id: 'prod_01',
  title: 'Test Product',
  handle: 'test-product',
  description: 'A test product',
  thumbnail: 'https://via.placeholder.com/150',
  variants: [
    {
      id: 'variant_01',
      title: 'Default Variant',
      calculated_price: {
        calculated_amount: 2000,
        currency_code: 'usd',
      },
      inventory_quantity: 100,
    },
  ],
  metadata: {},
  tags: [],
};

export const mockCart = {
  id: 'cart_01',
  region_id: 'reg_01',
  items: [],
  region: mockRegion,
  total: 0,
  subtotal: 0,
  tax_total: 0,
  shipping_total: 0,
  discount_total: 0,
};

export const mockCartWithItems = {
  ...mockCart,
  items: [
    {
      id: 'item_01',
      variant_id: 'variant_01',
      quantity: 2,
      total: 4000,
      subtotal: 4000,
      product: mockProduct,
      variant: mockProduct.variants[0],
    },
  ],
  total: 4000,
  subtotal: 4000,
};

export const mockShippingOption = {
  id: 'so_01',
  name: 'Standard Shipping',
  price_incl_tax: 500,
  amount: 500,
};

export const mockPaymentSession = {
  id: 'ps_stripe_01',
  provider_id: 'stripe',
  data: {
    client_secret: 'pi_test_secret_12345',
  },
  status: 'pending',
};

export const mockOrder = {
  id: 'order_01',
  cart_id: 'cart_01',
  status: 'pending',
  total: 4500,
  items: mockCartWithItems.items,
  shipping_total: 500,
  payment_status: 'awaiting',
};

// MSW handlers
export const handlers = [
  // Get regions
  http.get(`${MEDUSA_BASE_URL}/store/regions`, () => {
    return HttpResponse.json({
      regions: [mockRegion],
      count: 1,
    });
  }),

  // Get single region
  http.get(`${MEDUSA_BASE_URL}/store/regions/:id`, () => {
    return HttpResponse.json({
      region: mockRegion,
    });
  }),

  // List products
  http.get(`${MEDUSA_BASE_URL}/store/products`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    return HttpResponse.json({
      products: [mockProduct],
      count: 1,
    });
  }),

  // Get single product
  http.get(`${MEDUSA_BASE_URL}/store/products/:id`, () => {
    return HttpResponse.json({
      product: mockProduct,
    });
  }),

  // Create cart
  http.post(`${MEDUSA_BASE_URL}/store/carts`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      cart: { ...mockCart, region_id: body.region_id },
    });
  }),

  // Get cart
  http.get(`${MEDUSA_BASE_URL}/store/carts/:id`, () => {
    // Return cart with items by default for testing
    return HttpResponse.json({
      cart: mockCartWithItems,
    });
  }),

  // Update cart
  http.post(`${MEDUSA_BASE_URL}/store/carts/:id`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      cart: { ...mockCart, ...body },
    });
  }),

  // Add line item
  http.post(`${MEDUSA_BASE_URL}/store/carts/:id/line-items`, async () => {
    // Return empty cart since the test will fetch updated cart separately
    return HttpResponse.json({
      cart: mockCart,
    });
  }),

  // Update line item
  http.post(`${MEDUSA_BASE_URL}/store/carts/:cartId/line-items/:itemId`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      cart: {
        ...mockCartWithItems,
        items: mockCartWithItems.items.map(item =>
          item.id === 'item_01' ? { ...item, quantity: body.quantity } : item
        ),
      },
    });
  }),

  // Delete line item
  http.delete(`${MEDUSA_BASE_URL}/store/carts/:cartId/line-items/:itemId`, () => {
    return HttpResponse.json({
      cart: mockCart,
    });
  }),

  // Get shipping options
  http.get(`${MEDUSA_BASE_URL}/store/shipping-options`, () => {
    return HttpResponse.json({
      shipping_options: [mockShippingOption],
    });
  }),

  // Add shipping method
  http.post(`${MEDUSA_BASE_URL}/store/carts/:id/shipping-methods`, () => {
    return HttpResponse.json({
      cart: {
        ...mockCartWithItems,
        shipping_total: 500,
        total: 4500,
      },
    });
  }),

  // Create payment collection
  http.post(`${MEDUSA_BASE_URL}/store/payment-collections`, () => {
    return HttpResponse.json({
      payment_collection: {
        id: 'paycol_01',
        cart_id: 'cart_01',
        payment_sessions: [mockPaymentSession],
      },
    });
  }),

  // Initiate payment session
  http.post(`${MEDUSA_BASE_URL}/store/payment-collections/:id/payment-sessions`, () => {
    return HttpResponse.json({
      payment_session: mockPaymentSession,
    });
  }),

  // Complete cart
  http.post(`${MEDUSA_BASE_URL}/store/carts/:id/complete`, () => {
    return HttpResponse.json({
      type: 'order',
      order: mockOrder,
    });
  }),

  // Apply promotions
  http.post(`${MEDUSA_BASE_URL}/store/carts/:id`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      cart: {
        ...mockCartWithItems,
        discount_total: body.promo_codes?.length > 0 ? 400 : 0,
        total: body.promo_codes?.length > 0 ? 4100 : 4500,
      },
    });
  }),
];
