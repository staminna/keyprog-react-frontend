import React, { useState, useEffect } from 'react';
import { OrderService, Order, Customer } from '@/services/orderService';
import { useOrderUpdates } from '@/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, User, Package, CreditCard, Calendar, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const isOrderRecord = (item: unknown): item is Order => {
  if (!item || typeof item !== 'object') return false;

  const record = item as Record<string, unknown>;
  const requiredStringFields = ['id', 'order_number', 'customer_id', 'customer_email', 'customer_name', 'status', 'currency', 'payment_status', 'created_at', 'updated_at'] as const;

  for (const field of requiredStringFields) {
    if (typeof record[field] !== 'string') {
      return false;
    }
  }

  if (typeof record['total_amount'] !== 'number') {
    return false;
  }

  const items = record['items'];
  if (!Array.isArray(items)) {
    return false;
  }

  return true;
};

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    customer: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time updates
  useOrderUpdates((event) => {
    switch (event.type) {
      case 'create':
        if (isOrderRecord(event.item)) {
          const order = event.item;
          setOrders(prev => [order, ...prev]);
          toast.success('Nova encomenda recebida');
        } else {
          console.warn('Received invalid order data for create event', event);
        }
        break;
      case 'update':
        if (isOrderRecord(event.item)) {
          const order = event.item;
          setOrders(prev => prev.map(o => o.id === order.id ? order : o));
          toast.info('Encomenda atualizada');
        } else {
          console.warn('Received invalid order data for update event', event);
        }
        break;
      case 'delete':
        setOrders(prev => prev.filter(o => o.id !== event.key));
        toast.info('Encomenda removida');
        break;
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, customersData] = await Promise.all([
        OrderService.getOrders({}, 100),
        OrderService.getCustomers(100)
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      toast.success('Estado da encomenda atualizado');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar estado');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: Order['payment_status']) => {
    try {
      await OrderService.updatePaymentStatus(orderId, newStatus);
      toast.success('Estado do pagamento atualizado');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendente',
      processing: 'A processar',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhado',
      refunded: 'Reembolsado'
    };
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.customer !== 'all' && order.customer_id !== filters.customer) return false;
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Encomendas</h1>
          <p className="text-gray-600">Gerir encomendas e clientes</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Encomendas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Pesquisar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Número da encomenda ou cliente..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Estado</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">A processar</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer-filter">Cliente</Label>
                  <Select value={filters.customer} onValueChange={(value) => setFilters(prev => ({ ...prev, customer: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: 'all', customer: 'all', dateFrom: '', dateTo: '' })}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">#{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {order.customer_name} ({order.customer_email})
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            €{order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="processing">A processar</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregue</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={order.payment_status} 
                        onValueChange={(value) => handlePaymentStatusChange(order.id, value as Order['payment_status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="failed">Falhado</SelectItem>
                          <SelectItem value="refunded">Reembolsado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Itens da encomenda:</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>€{item.total_price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{customer.first_name} {customer.last_name}</h4>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-xs text-gray-500">
                        {customer.total_orders || 0} encomendas • €{(customer.total_spent || 0).toFixed(2)} total
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Cliente desde {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: pt })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-gray-600">Total de Encomendas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Encomendas Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      €{orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Receita Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <User className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{customers.length}</p>
                    <p className="text-sm text-gray-600">Total de Clientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
