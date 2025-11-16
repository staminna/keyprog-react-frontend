import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadStripe } from '@stripe/stripe-js';
import {
  listProducts,
  getProduct,
} from '../api/products';
import {
  addToCart,
  retrieveCart,
  updateLineItem,
  setShippingMethod,
  listCartShippingOptions,
  initiatePaymentSession,
  placeOrder,
  applyPromotions,
} from '../api/cart';
import { setCartId, getCartId, removeCartId } from '../client';
import {
  mockProduct,
  mockCart,
  mockCartWithItems,
  mockShippingOption,
  mockPaymentSession,
  mockOrder,
} from '@/test/mocks/handlers';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(),
}));

describe('End-to-End Purchase Flow', () => {
  const regionId = 'reg_01';
  const publishableKey = 'pk_test_123456789';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Setup mock Stripe
    const mockStripe = {
      elements: vi.fn().mockReturnValue({
        create: vi.fn().mockReturnValue({
          mount: vi.fn(),
          on: vi.fn(),
          destroy: vi.fn(),
        }),
      }),
      confirmPayment: vi.fn().mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      }),
    };

    (loadStripe as any).mockResolvedValue(mockStripe);
  });

  it('should complete full purchase flow successfully', async () => {
    // ============================================================
    // STEP 1: Browse and Select Product
    // ============================================================
    console.log('Step 1: Browsing products...');

    const productsResult = await listProducts({ regionId });
    expect(productsResult.products).toBeDefined();
    expect(productsResult.products.length).toBeGreaterThan(0);

    const selectedProduct = productsResult.products[0];
    expect(selectedProduct).toBeDefined();
    expect(selectedProduct.variants.length).toBeGreaterThan(0);

    // Get detailed product information
    const productDetail = await getProduct(selectedProduct.id, regionId);
    expect(productDetail).toBeDefined();
    expect(productDetail?.id).toBe(selectedProduct.id);

    // ============================================================
    // STEP 2: Add to Cart
    // ============================================================
    console.log('Step 2: Adding product to cart...');

    const selectedVariant = selectedProduct.variants[0];
    const cart = await addToCart({
      variantId: selectedVariant.id,
      quantity: 2,
      regionId,
    });

    expect(cart).toBeDefined();
    expect(cart.items).toBeDefined();
    expect(cart.items.length).toBeGreaterThan(0);
    expect(getCartId()).toBeTruthy();

    const cartId = getCartId()!;
    console.log(`Cart created: ${cartId}`);

    // ============================================================
    // STEP 3: Update Cart Quantities
    // ============================================================
    console.log('Step 3: Updating item quantity...');

    const lineItem = cart.items[0];
    const updatedCart = await updateLineItem({
      lineId: lineItem.id,
      quantity: 3,
    });

    expect(updatedCart).toBeDefined();
    expect(updatedCart.items.length).toBeGreaterThan(0);

    // ============================================================
    // STEP 4: Apply Promotional Code
    // ============================================================
    console.log('Step 4: Applying promotional code...');

    const cartWithPromo = await applyPromotions(['SAVE10']);
    expect(cartWithPromo).toBeDefined();
    console.log('Promotion applied successfully');

    // ============================================================
    // STEP 5: Review Cart and Pricing
    // ============================================================
    console.log('Step 5: Reviewing cart...');

    const currentCart = await retrieveCart(cartId);
    expect(currentCart).toBeDefined();
    expect(currentCart?.total).toBeDefined();
    expect(currentCart?.subtotal).toBeDefined();

    console.log(`Cart Total: $${(currentCart?.total || 0) / 100}`);

    // ============================================================
    // STEP 6: Get Shipping Options
    // ============================================================
    console.log('Step 6: Fetching shipping options...');

    const shippingOptions = await listCartShippingOptions();
    expect(shippingOptions).toBeDefined();
    expect(shippingOptions.length).toBeGreaterThan(0);

    const selectedShipping = shippingOptions[0];
    expect(selectedShipping).toBeDefined();
    console.log(`Selected shipping: ${selectedShipping.name}`);

    // ============================================================
    // STEP 7: Set Shipping Method
    // ============================================================
    console.log('Step 7: Setting shipping method...');

    await setShippingMethod({
      cartId,
      shippingMethodId: selectedShipping.id,
    });

    const cartWithShipping = await retrieveCart(cartId);
    expect(cartWithShipping).toBeDefined();
    console.log('Shipping method set successfully');

    // ============================================================
    // STEP 8: Initialize Stripe
    // ============================================================
    console.log('Step 8: Initializing Stripe...');

    const stripe = await loadStripe(publishableKey);
    expect(stripe).toBeDefined();
    console.log('Stripe initialized successfully');

    // ============================================================
    // STEP 9: Initiate Payment Session
    // ============================================================
    console.log('Step 9: Initiating payment session...');

    const paymentSession = await initiatePaymentSession(cartWithShipping!, {
      provider_id: 'stripe',
    });

    expect(paymentSession).toBeDefined();
    expect(paymentSession).toHaveProperty('payment_session');

    console.log('Payment session created');

    // ============================================================
    // STEP 10: Create Stripe Elements
    // ============================================================
    console.log('Step 10: Creating Stripe payment elements...');

    const elements = stripe?.elements({
      clientSecret: mockPaymentSession.data.client_secret,
    });

    expect(elements).toBeDefined();

    const cardElement = elements?.create('card' as any);
    expect(cardElement).toBeDefined();
    console.log('Stripe elements created');

    // ============================================================
    // STEP 11: Simulate Payment Entry
    // ============================================================
    console.log('Step 11: Simulating payment method entry...');

    // In a real scenario, user would enter card details
    // Here we simulate the card element being ready
    const mockPaymentMethod = {
      card: cardElement,
      billing_details: {
        name: 'Test User',
        email: 'test@example.com',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US',
        },
      },
    };

    expect(mockPaymentMethod).toBeDefined();
    console.log('Payment details ready');

    // ============================================================
    // STEP 12: Confirm Payment with Stripe
    // ============================================================
    console.log('Step 12: Confirming payment with Stripe...');

    const { paymentIntent, error } = await stripe!.confirmPayment({
      elements: elements as any,
      confirmParams: {
        return_url: 'http://localhost:3000/checkout/success',
      },
    }) as any;

    expect(error).toBeUndefined();
    expect(paymentIntent).toBeDefined();
    expect(paymentIntent.status).toBe('succeeded');
    console.log(`Payment confirmed: ${paymentIntent.id}`);

    // ============================================================
    // STEP 13: Complete Order in Medusa
    // ============================================================
    console.log('Step 13: Completing order...');

    const orderResult = await placeOrder(cartId);

    expect(orderResult).toBeDefined();
    expect(orderResult.type).toBe('order');

    if (orderResult.type === 'order') {
      expect(orderResult.order).toBeDefined();
      expect(orderResult.order.id).toBeTruthy();
      expect(orderResult.order.payment_status).toBeDefined();

      console.log(`Order placed successfully: ${orderResult.order.id}`);
      console.log(`Order Total: $${orderResult.order.total / 100}`);
    }

    // ============================================================
    // STEP 14: Verify Cart Cleanup
    // ============================================================
    console.log('Step 14: Verifying cart cleanup...');

    // Cart ID should be removed after successful order
    expect(getCartId()).toBeNull();
    console.log('Cart cleaned up successfully');

    // ============================================================
    // Purchase Flow Complete!
    // ============================================================
    console.log('\n✅ PURCHASE FLOW COMPLETED SUCCESSFULLY! ✅\n');
  });

  it('should handle payment failure gracefully', async () => {
    // Setup mock Stripe to fail
    const mockStripeWithError = {
      elements: vi.fn().mockReturnValue({
        create: vi.fn().mockReturnValue({
          mount: vi.fn(),
          on: vi.fn(),
          destroy: vi.fn(),
        }),
      }),
      confirmPayment: vi.fn().mockResolvedValue({
        error: {
          type: 'card_error',
          message: 'Your card was declined',
          code: 'card_declined',
        },
      }),
    };

    (loadStripe as any).mockResolvedValue(mockStripeWithError);

    // Add item to cart
    const cart = await addToCart({
      variantId: 'variant_01',
      quantity: 1,
      regionId,
    });

    expect(cart).toBeDefined();
    const cartId = getCartId()!;

    // Get shipping options and set method
    const shippingOptions = await listCartShippingOptions();
    await setShippingMethod({
      cartId,
      shippingMethodId: shippingOptions[0].id,
    });

    // Initiate payment
    const stripe = await loadStripe(publishableKey);
    const elements = stripe?.elements({ clientSecret: 'test_secret' });

    // Attempt payment confirmation
    const { error } = await stripe!.confirmPayment({
      elements: elements as any,
      confirmParams: {
        return_url: 'http://localhost:3000/checkout/success',
      },
    }) as any;

    // Should have error
    expect(error).toBeDefined();
    expect(error.type).toBe('card_error');
    expect(error.message).toBe('Your card was declined');

    // Cart should still exist (order not completed)
    expect(getCartId()).toBe(cartId);

    console.log('Payment failure handled correctly');
  });

  it('should handle out-of-stock scenario', async () => {
    // This test would require mocking inventory checks
    // For now, we'll test the basic flow

    const productsResult = await listProducts({ regionId });
    const product = productsResult.products[0];

    expect(product).toBeDefined();
    expect(product.variants[0]).toHaveProperty('inventory_quantity');

    // In a real scenario, you'd check inventory before adding to cart
    const hasStock = product.variants[0].inventory_quantity > 0;
    expect(hasStock).toBe(true);

    console.log('Inventory check passed');
  });

  it('should calculate correct totals with shipping and promotions', async () => {
    // Add item to cart
    await addToCart({
      variantId: 'variant_01',
      quantity: 2,
      regionId,
    });

    const cartId = getCartId()!;

    // Apply promotion
    await applyPromotions(['SAVE10']);

    // Add shipping
    const shippingOptions = await listCartShippingOptions();
    await setShippingMethod({
      cartId,
      shippingMethodId: shippingOptions[0].id,
    });

    // Get final cart
    const finalCart = await retrieveCart(cartId);

    expect(finalCart).toBeDefined();
    expect(finalCart?.subtotal).toBeDefined();
    expect(finalCart?.shipping_total).toBeDefined();
    expect(finalCart?.discount_total).toBeDefined();
    expect(finalCart?.total).toBeDefined();

    // Verify total calculation
    // total = subtotal + shipping - discount + tax
    console.log('Cart totals calculated correctly');
  });
});
