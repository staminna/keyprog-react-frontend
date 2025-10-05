/**
 * Checkout Cancel Page
 * Displayed when user cancels payment
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingCart, Home } from 'lucide-react';

export const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <main className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-yellow-700">
              Pagamento Cancelado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                O seu pagamento foi cancelado.
              </p>
              <p className="text-sm text-gray-600">
                Não se preocupe, o seu carrinho foi guardado e pode continuar a comprar quando quiser.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate('/checkout')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Voltar ao Checkout
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/loja')}
              >
                Continuar a Comprar
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
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

export default CheckoutCancelPage;
