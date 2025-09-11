import { DirectusService } from './directusService';
import { FallbackService } from './fallbackService';
import { directus, readItems, readItem, createItem, updateItem } from '@/lib/directus';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  billing_address?: Address;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
}

export class OrderService {
  static async getOrders(
    filter?: {
      status?: string;
      customer_id?: string;
      date_from?: string;
      date_to?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<Order[]> {
    try {
      await DirectusService.authenticate();
      
      const queryFilter: Record<string, unknown> = {};
      
      if (filter) {
        if (filter.status) queryFilter.status = { _eq: filter.status };
        if (filter.customer_id) queryFilter.customer_id = { _eq: filter.customer_id };
        if (filter.date_from) {
          queryFilter.created_at = { _gte: filter.date_from };
        }
        if (filter.date_to) {
          queryFilter.created_at = { 
            ...queryFilter.created_at as Record<string, unknown>, 
            _lte: filter.date_to 
          };
        }
      }

      const orders = await directus.request(
        readItems('orders', {
          filter: queryFilter,
          limit,
          offset,
          sort: ['-created_at'],
          fields: ['*', 'items.*', 'items.product_id.name', 'items.product_id.sku']
        })
      );

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback order data');
      const fallbackOrders = FallbackService.getOrders();
      
      // Apply filters to fallback data
      let filteredOrders = [...fallbackOrders];
      
      if (filter) {
        if (filter.status) {
          filteredOrders = filteredOrders.filter(o => o.status === filter.status);
        }
        if (filter.customer_id) {
          filteredOrders = filteredOrders.filter(o => o.customer === filter.customer_id);
        }
        if (filter.date_from) {
          const fromDate = new Date(filter.date_from).getTime();
          filteredOrders = filteredOrders.filter(o => {
            const orderDate = new Date(o.date_created as string).getTime();
            return orderDate >= fromDate;
          });
        }
        if (filter.date_to) {
          const toDate = new Date(filter.date_to).getTime();
          filteredOrders = filteredOrders.filter(o => {
            const orderDate = new Date(o.date_created as string).getTime();
            return orderDate <= toDate;
          });
        }
      }
      
      // Transform to Order interface
      const mappedOrders = filteredOrders.map(order => this.mapFallbackOrderToOrder(order));
      
      // Apply pagination
      return mappedOrders.slice(offset, offset + limit);
    }
  }

  static async getOrder(id: string): Promise<Order | null> {
    try {
      await DirectusService.authenticate();
      
      const order = await directus.request(
        readItem('orders', id, {
          fields: ['*', 'items.*', 'items.product_id.name', 'items.product_id.sku']
        })
      );

      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback order data');
      const fallbackOrder = FallbackService.getOrder(id);
      if (!fallbackOrder) return null;
      
      return this.mapFallbackOrderToOrder(fallbackOrder);
    }
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      await DirectusService.authenticate();
      
      // Generate order number if not provided
      const orderNumber = orderData.order_number || `ORD-${Date.now()}`;
      
      const newOrder = await directus.request(
        createItem('orders', {
          ...orderData,
          order_number: orderNumber,
          status: orderData.status || 'pending',
          payment_status: orderData.payment_status || 'pending'
        })
      );

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    try {
      await DirectusService.authenticate();
      
      const updatedOrder = await directus.request(
        updateItem('orders', id, { status })
      );

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async updatePaymentStatus(id: string, paymentStatus: Order['payment_status']): Promise<Order | null> {
    try {
      await DirectusService.authenticate();
      
      const updatedOrder = await directus.request(
        updateItem('orders', id, { payment_status: paymentStatus })
      );

      return updatedOrder;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  static async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    try {
      await DirectusService.authenticate();
      
      const customers = await directus.request(
        readItems('customers', {
          limit,
          offset,
          sort: ['-created_at'],
          fields: ['*']
        })
      );

      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback customer data');
      const fallbackCustomers = FallbackService.getCustomers();
      
      // Transform to Customer interface
      const mappedCustomers = fallbackCustomers.map(customer => this.mapFallbackCustomerToCustomer(customer));
      
      // Apply pagination
      return mappedCustomers.slice(offset, offset + limit);
    }
  }

  static async getCustomer(id: string): Promise<Customer | null> {
    try {
      await DirectusService.authenticate();
      
      const customer = await directus.request(
        readItem('customers', id)
      );

      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      // Use fallback data when Directus is down
      console.log('Using fallback customer data');
      const fallbackCustomer = FallbackService.getCustomer(id);
      if (!fallbackCustomer) return null;
      
      return this.mapFallbackCustomerToCustomer(fallbackCustomer);
    }
  }

  static async createCustomer(customerData: Omit<Customer, 'id' | 'created_at'>): Promise<Customer | null> {
    try {
      await DirectusService.authenticate();
      
      const newCustomer = await directus.request(
        createItem('customers', customerData)
      );

      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.getOrders({ customer_id: customerId });
  }

  static async getOrderStats(): Promise<{
    total_orders: number;
    pending_orders: number;
    total_revenue: number;
    average_order_value: number;
  }> {
    try {
      await DirectusService.authenticate();
      
      // This would require aggregate queries - implement based on your MCP server capabilities
      const orders = await this.getOrders({}, 1000); // Get recent orders for stats
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total_orders: 0,
        pending_orders: 0,
        total_revenue: 0,
        average_order_value: 0
      };
    }
  }
  
  // Helper methods to map fallback data to proper interfaces
  private static mapFallbackOrderToOrder(fallbackOrder: Record<string, unknown>): Order {
    // Get order items for this order
    const orderItems = FallbackService.getOrderItemsByOrder(fallbackOrder.id as string);
    
    // Map order items to OrderItem interface
    const mappedItems: OrderItem[] = orderItems.map(item => ({
      id: item.id as string,
      product_id: item.product as string,
      product_name: 'Product ' + item.product, // Fallback product name
      quantity: item.quantity as number,
      unit_price: item.price as number,
      total_price: (item.price as number) * (item.quantity as number)
    }));
    
    // Get customer data
    const customer = FallbackService.getCustomer(fallbackOrder.customer as string);
    
    // Create a default shipping address
    const shippingAddress: Address = {
      name: customer ? `${customer.first_name} ${customer.last_name}` : 'Customer',
      address_line_1: '123 Main St',
      city: 'Anytown',
      postal_code: '12345',
      country: 'Portugal'
    };
    
    return {
      id: fallbackOrder.id as string,
      order_number: `ORD-${fallbackOrder.id}`,
      customer_id: fallbackOrder.customer as string,
      customer_email: customer?.email as string || 'customer@example.com',
      customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Customer',
      status: fallbackOrder.status as Order['status'] || 'pending',
      total_amount: fallbackOrder.total as number,
      currency: 'EUR',
      items: mappedItems,
      shipping_address: shippingAddress,
      payment_status: fallbackOrder.payment_status as Order['payment_status'] || 'pending',
      created_at: fallbackOrder.date_created as string || new Date().toISOString(),
      updated_at: fallbackOrder.date_updated as string || new Date().toISOString()
    };
  }
  
  private static mapFallbackCustomerToCustomer(fallbackCustomer: Record<string, unknown>): Customer {
    return {
      id: fallbackCustomer.id as string,
      email: fallbackCustomer.email as string,
      first_name: fallbackCustomer.first_name as string,
      last_name: fallbackCustomer.last_name as string,
      phone: fallbackCustomer.phone as string,
      created_at: fallbackCustomer.date_created as string || new Date().toISOString(),
      total_orders: 0,
      total_spent: 0
    };
  }
}
