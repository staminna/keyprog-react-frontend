/**
 * Stripe Service
 * Handles all Stripe-related operations
 */

import { DirectusService } from './directusService';

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface CartItem {
  product_id: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export class StripeService {
  private static readonly API_URL = import.meta.env.VITE_DIRECTUS_URL;

  /**
   * Create a Stripe Checkout Session
   */
  static async createCheckoutSession(
    items: CartItem[],
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    try {
      const token = await DirectusService.getToken();
      
      if (!token) {
        throw new Error('User must be authenticated to checkout');
      }

      // Transform cart items to Stripe line items format
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [`${this.API_URL}/assets/${item.image}`] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Call Directus flow to create Stripe checkout session
      const response = await fetch(`${this.API_URL}/flows/trigger/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          line_items: lineItems,
          customer_reference_id: userId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode: 'payment',
          payment_method_types: ['card', 'multibanco', 'mbway'], // Portuguese payment methods
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      return {
        sessionId: data.session_id,
        url: data.url,
      };
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Retrieve Stripe Checkout Session details
   */
  static async getCheckoutSession(sessionId: string): Promise<Record<string, unknown>> {
    try {
      const token = await DirectusService.getToken();

      const response = await fetch(
        `${this.API_URL}/flows/trigger/stripe-get-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to retrieve checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrieving Stripe session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  static redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }
}
