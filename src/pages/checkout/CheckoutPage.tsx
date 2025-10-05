/**
 * Checkout Page
 * Handles the checkout process with Stripe
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { StripeService } from '@/services/stripeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CheckoutPage = () => {
  const { items, total, itemCount } = useCart();
  const { user, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (itemCount === 0) {
      navigate('/loja');
    }
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [itemCount, isAuthenticated, navigate]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!user?.id) {
      setError('Deve estar autenticado para finalizar a compra');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare cart items for Stripe
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Create Stripe checkout session
      const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/checkout/cancel`;

      const session = await StripeService.createCheckoutSession(
        cartItems,
        user.id,
        successUrl,
        cancelUrl
      );

      // Redirect to Stripe Checkout
      StripeService.redirectToCheckout(session.url);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao processar pagamento. Por favor tente novamente.'
      );
      setIsProcessing(false);
    }
  };

  if (itemCount === 0 || !isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <main className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-4">
                      {item.image && (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantidade: {item.quantity}
                        </p>
                        <p className="text-primary font-semibold mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envio</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar com Stripe
                    </>
                  )}
                </Button>

                {/* Payment Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Pagamento seguro via Stripe</p>
                  <p>✓ Cartão de crédito, Multibanco, MB Way</p>
                  <p>✓ Dados protegidos com encriptação SSL</p>
                </div>

                {/* Back Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/loja')}
                  disabled={isProcessing}
                >
                  Voltar à Loja
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
