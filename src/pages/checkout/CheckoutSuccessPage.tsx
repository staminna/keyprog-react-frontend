/**
 * Checkout Success Page
 * Displayed after successful payment
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { StripeService } from '@/services/stripeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Loader2, Home } from 'lucide-react';

interface StripeSession {
  amount_total?: number;
  [key: string]: unknown;
}

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<StripeSession | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        // Verify payment with Stripe
        const session = await StripeService.getCheckoutSession(sessionId);
        setOrderDetails(session);
        
        // Clear cart after successful payment
        clearCart();
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, navigate]);

  if (isLoading) {
    return (
      <main className="container py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600">A verificar pagamento...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">
              Pagamento Confirmado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Obrigado pela sua compra!
              </p>
              <p className="text-sm text-gray-600">
                Receberá um email de confirmação em breve com os detalhes da sua encomenda.
              </p>
            </div>

            {orderDetails && (
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">ID da Sessão:</span>
                  <span className="text-gray-600 font-mono text-xs">
                    {sessionId?.slice(0, 20)}...
                  </span>
                </div>
                {orderDetails.amount_total && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Total Pago:</span>
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(orderDetails.amount_total / 100)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate('/conta')}
              >
                <Package className="mr-2 h-4 w-4" />
                Ver Minhas Encomendas
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Precisa de ajuda? <a href="/contactos" className="text-primary hover:underline">Contacte-nos</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CheckoutSuccessPage;
