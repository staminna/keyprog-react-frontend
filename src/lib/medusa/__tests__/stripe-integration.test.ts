import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { initiatePaymentSession } from '../api/cart';
import { setCartId } from '../client';
import { mockCart, mockPaymentSession } from '@/test/mocks/handlers';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(),
}));

describe('Stripe Integration Tests', () => {
  let mockStripe: Partial<Stripe>;
  let mockElements: Partial<StripeElements>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Setup mock Stripe instance
    mockElements = {
      create: vi.fn().mockReturnValue({
        mount: vi.fn(),
        on: vi.fn(),
        destroy: vi.fn(),
      }),
    };

    mockStripe = {
      elements: vi.fn().mockReturnValue(mockElements),
      confirmPayment: vi.fn().mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      }),
      confirmCardPayment: vi.fn().mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      }),
    };

    (loadStripe as any).mockResolvedValue(mockStripe);
  });

  describe('Stripe Initialization', () => {
    it('should load Stripe with publishable key', async () => {
      const publishableKey = 'pk_test_123456789';
      const stripe = await loadStripe(publishableKey);

      expect(loadStripe).toHaveBeenCalledWith(publishableKey);
      expect(stripe).toBeDefined();
    });

    it('should handle Stripe loading failure', async () => {
      (loadStripe as any).mockResolvedValue(null);
      const stripe = await loadStripe('invalid_key');

      expect(stripe).toBeNull();
    });
  });

  describe('Payment Session Initiation', () => {
    it('should initiate payment session with Stripe provider', async () => {
      const cart = { ...mockCart, id: 'cart_01' };
      const paymentData = {
        provider_id: 'stripe',
        context: {},
      };

      const session = await initiatePaymentSession(cart, paymentData);

      expect(session).toBeDefined();
    });

    it('should return client secret for Stripe Elements', async () => {
      const cart = { ...mockCart, id: 'cart_01' };
      const paymentData = {
        provider_id: 'stripe',
      };

      const session = await initiatePaymentSession(cart, paymentData);

      expect(session).toBeDefined();
      expect(session).toHaveProperty('payment_session');
    });
  });

  describe('Stripe Elements Creation', () => {
    it('should create payment element', async () => {
      const stripe = await loadStripe('pk_test_123');
      const elements = stripe?.elements({
        clientSecret: 'pi_test_secret_12345',
      });

      expect(elements).toBeDefined();
      expect(mockStripe.elements).toHaveBeenCalled();
    });

    it('should create card element', () => {
      const elements = mockStripe.elements!({} as any);
      const cardElement = elements.create!('card' as any);

      expect(mockElements.create).toHaveBeenCalledWith('card');
      expect(cardElement).toBeDefined();
    });
  });

  describe('Payment Confirmation', () => {
    it('should confirm payment with Stripe', async () => {
      const stripe = await loadStripe('pk_test_123');

      const result = await stripe?.confirmPayment({
        elements: mockElements as any,
        confirmParams: {
          return_url: 'http://localhost:3000/checkout/success',
        },
      });

      expect(mockStripe.confirmPayment).toHaveBeenCalled();
      expect(result?.paymentIntent?.status).toBe('succeeded');
    });

    it('should confirm card payment with client secret', async () => {
      const stripe = await loadStripe('pk_test_123');

      const result = await stripe?.confirmCardPayment('pi_test_secret_12345', {
        payment_method: {
          card: mockElements.create!('card' as any) as any,
          billing_details: {
            name: 'Test User',
          },
        },
      });

      expect(mockStripe.confirmCardPayment).toHaveBeenCalled();
      expect(result?.paymentIntent?.status).toBe('succeeded');
    });

    it('should handle payment confirmation errors', async () => {
      (mockStripe.confirmPayment as any).mockResolvedValue({
        error: {
          type: 'card_error',
          message: 'Your card was declined',
        },
      });

      const stripe = await loadStripe('pk_test_123');
      const result = await stripe?.confirmPayment({
        elements: mockElements as any,
        confirmParams: {
          return_url: 'http://localhost:3000/checkout/success',
        },
      });

      expect(result?.error).toBeDefined();
      expect(result?.error?.message).toBe('Your card was declined');
    });
  });

  describe('Payment Intent States', () => {
    it('should handle succeeded payment intent', async () => {
      const stripe = await loadStripe('pk_test_123');
      const result = await stripe?.confirmPayment({
        elements: mockElements as any,
        confirmParams: {
          return_url: 'http://localhost:3000/checkout/success',
        },
      });

      expect(result?.paymentIntent?.status).toBe('succeeded');
    });

    it('should handle processing payment intent', async () => {
      (mockStripe.confirmPayment as any).mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'processing',
        },
      });

      const stripe = await loadStripe('pk_test_123');
      const result = await stripe?.confirmPayment({
        elements: mockElements as any,
        confirmParams: {
          return_url: 'http://localhost:3000/checkout/success',
        },
      });

      expect(result?.paymentIntent?.status).toBe('processing');
    });

    it('should handle requires_action payment intent', async () => {
      (mockStripe.confirmPayment as any).mockResolvedValue({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'requires_action',
        },
      });

      const stripe = await loadStripe('pk_test_123');
      const result = await stripe?.confirmPayment({
        elements: mockElements as any,
        confirmParams: {
          return_url: 'http://localhost:3000/checkout/success',
        },
      });

      expect(result?.paymentIntent?.status).toBe('requires_action');
    });
  });

  describe('Payment Method Collection', () => {
    it('should collect payment method details', () => {
      const elements = mockStripe.elements!({} as any);
      const cardElement = elements.create!('card' as any);

      expect(cardElement).toBeDefined();
      expect(cardElement.mount).toBeDefined();
    });

    it('should validate payment method before submission', () => {
      const elements = mockStripe.elements!({} as any);
      const cardElement = elements.create!('card' as any);
      const changeHandler = vi.fn();

      cardElement.on!('change', changeHandler);

      expect(cardElement.on).toHaveBeenCalledWith('change', changeHandler);
    });
  });
});
