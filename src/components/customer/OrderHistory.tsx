/**
 * Order History Component
 * Shows customer's order history
 */

import { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface Order {
  id: number;
  total: number;
  payment_status: string;
  status: string;
  date_created: string;
}

export const OrderHistory = () => {
  const { user } = useUnifiedAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/items/orders?filter[customer][_eq]=${user.id}&sort=-date_created`,
          {
            headers: {
              'Authorization': `Bearer ${await DirectusService.getToken()}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      processing: 'default',
      shipped: 'secondary',
      delivered: 'secondary',
      cancelled: 'destructive',
    };

    const labels: Record<string, string> = {
      processing: 'Em Processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Ainda não tem encomendas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Encomenda #{order.id}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(order.date_created)}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Pagamento: 
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                    {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
