# Medusa Integration Setup Guide

## Overview
This guide helps you integrate the extracted Medusa ecommerce features into the React frontend.

## Prerequisites

1. **Medusa Backend Running**: Ensure Medusa v2 backend is running on port 9000
2. **Node.js & npm**: Required for installing dependencies
3. **Product Sync**: Products should be syncing from Directus to Medusa

## Step 1: Install Dependencies

```bash
cd react-frontend
npm install
```

**New dependencies added:**
- `@medusajs/js-sdk` - Medusa JavaScript SDK
- `@medusajs/types` - TypeScript types for Medusa
- `@stripe/react-stripe-js` & `@stripe/stripe-js` - Stripe payment integration
- `@tanstack/react-query` - Data fetching and caching
- `zustand` - State management

## Step 2: Configure Environment Variables

1. Copy the Medusa environment template:
```bash
cp .env.medusa.example .env.medusa
```

2. Update `.env.medusa` with your values:
```bash
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

3. Append Medusa variables to your main `.env` file:
```bash
cat .env.medusa >> .env
```

### Getting Publishable Key

The publishable key can be obtained from Medusa:

```bash
cd ../product-synchronization/product-sync
npx medusa api-key create --type publishable --title "React Frontend"
```

## Step 3: Extracted Features Overview

### ✅ Core Infrastructure (Completed)

**Utilities** (`src/lib/medusa/utils/`)
- `money.ts` - Currency formatting with locale support
- `price.ts` - Product pricing calculations
- `percentage.ts` - Discount percentage calculations
- `isEmpty.ts` - Value validation utilities

**SDK Configuration** (`src/lib/medusa/config.ts`)
- Medusa client initialization
- Environment-based configuration

**Client Layer** (`src/lib/medusa/client.ts`)
- Authentication token management
- Cart ID storage
- localStorage-based session handling

**API Layer** (`src/lib/medusa/api/`)
- `cart.ts` - Complete cart operations
- `products.ts` - Product fetching and filtering
- `regions.ts` - Regional pricing and currencies

### 🔄 Integration Points

**Cart Operations Available:**
```typescript
import { 
  addToCart, 
  retrieveCart, 
  updateLineItem, 
  deleteLineItem,
  placeOrder 
} from '@/lib/medusa';

// Add product to cart
await addToCart({
  variantId: 'variant_123',
  quantity: 1,
  regionId: 'reg_456'
});

// Get current cart
const cart = await retrieveCart();

// Update quantity
await updateLineItem({
  lineId: 'item_789',
  quantity: 2
});
```

**Product Operations Available:**
```typescript
import { listProducts, getProduct, searchProducts } from '@/lib/medusa';

// List products with pagination
const { products, count, nextPage } = await listProducts({
  pageParam: 1,
  queryParams: { limit: 12 },
  regionId: 'reg_456'
});

// Get single product
const product = await getProduct('prod_123', 'reg_456');

// Search products
const results = await searchProducts('keyword', 'reg_456');
```

**Region/Pricing Operations:**
```typescript
import { getRegion, getDefaultRegion, listRegions } from '@/lib/medusa';

// Get region by country code
const region = await getRegion('us');

// Get default region
const defaultRegion = await getDefaultRegion();
```

## Step 4: Create React Query Provider

Create `src/providers/QueryProvider.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Update `src/main.tsx` to wrap app with QueryProvider:

```typescript
import { QueryProvider } from './providers/QueryProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
```

## Step 5: Create Cart Store with Zustand

Create `src/store/cartStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HttpTypes } from '@medusajs/types';
import { retrieveCart } from '@/lib/medusa';

interface CartState {
  cart: HttpTypes.StoreCart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: false,
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cart = await retrieveCart();
          set({ cart, isLoading: false });
        } catch (error) {
          console.error('Error fetching cart:', error);
          set({ isLoading: false });
        }
      },
      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'cart-storage',
      partialState: (state) => ({ cart: state.cart }),
    }
  )
);
```

## Step 6: Create Custom Hooks

Create `src/hooks/useCart.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart as addToCartAPI,
  retrieveCart,
  updateLineItem,
  deleteLineItem,
  placeOrder,
} from '@/lib/medusa';
import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const queryClient = useQueryClient();
  const { cart, fetchCart } = useCartStore();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: retrieveCart,
    initialData: cart,
  });

  const addToCartMutation = useMutation({
    mutationFn: addToCartAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      fetchCart();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: updateLineItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      fetchCart();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: deleteLineItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      fetchCart();
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
  });

  return {
    cart: cartData,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    placeOrder: placeOrderMutation.mutate,
  };
}
```

Create `src/hooks/useProducts.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { listProducts, getProduct } from '@/lib/medusa';

export function useProducts(regionId: string, params?: any) {
  return useQuery({
    queryKey: ['products', regionId, params],
    queryFn: () => listProducts({ regionId, queryParams: params }),
    enabled: !!regionId,
  });
}

export function useProduct(productId: string, regionId: string) {
  return useQuery({
    queryKey: ['product', productId, regionId],
    queryFn: () => getProduct(productId, regionId),
    enabled: !!productId && !!regionId,
  });
}
```

## Step 7: Update Existing Components

### Update `AddToCartButton.tsx`

Replace the existing implementation with Medusa integration:

```typescript
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AddToCartButton({ 
  variantId, 
  regionId,
  quantity = 1 
}: { 
  variantId: string; 
  regionId: string;
  quantity?: number;
}) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(
      { variantId, quantity, regionId },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: "Item successfully added to your cart",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to add item to cart",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Button onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
}
```

## Step 8: Testing

1. **Start Medusa backend:**
```bash
cd ../product-synchronization
docker-compose -f docker-compose.medusa.yml up -d
```

2. **Verify Medusa is running:**
```bash
curl http://localhost:9000/health
```

3. **Start React frontend:**
```bash
cd react-frontend
npm run dev
```

4. **Test cart operations:**
   - Add products to cart
   - Update quantities
   - Remove items
   - View cart total

## Next Steps

### 🔜 Pending Features to Implement

1. **Checkout Flow Components**
   - Address form
   - Shipping options selector
   - Payment form (Stripe)
   - Order confirmation

2. **Product Display Enhancements**
   - Variant selector component
   - Product image gallery
   - Price display with discounts
   - Inventory status

3. **Account Management**
   - Customer registration/login
   - Order history
   - Address book
   - Profile management

4. **Enhanced Cart Features**
   - Cart drawer/modal
   - Promo code input
   - Shipping estimation
   - Gift cards

## Troubleshooting

### TypeScript Errors After Installation
The lint errors you see are expected until dependencies are installed:
```bash
npm install
```

### Cart Not Persisting
Ensure localStorage is not blocked in your browser. Check browser console for errors.

### Products Not Loading
1. Verify Medusa backend is running
2. Check VITE_MEDUSA_BACKEND_URL is correct
3. Ensure products exist in Medusa database
4. Check browser console for API errors

### CORS Issues
If you see CORS errors, update Medusa `.env`:
```bash
STORE_CORS=http://localhost:5173,http://localhost:3000
```

## Architecture Notes

### Why Client-Side vs Server-Side?

The Medusa storefront uses Next.js Server Actions, but we're using client-side API calls because:

1. **Vite/React**: No server-side rendering by default
2. **Simpler Architecture**: All API calls from browser
3. **React Query**: Built-in caching and state management
4. **localStorage**: Session persistence without cookies

### State Management Strategy

- **React Query**: API data caching and fetching
- **Zustand**: Cart state and persistence
- **localStorage**: Session data (tokens, cart ID)

### Security Considerations

1. **No sensitive data in localStorage**: Only cart ID and tokens
2. **Publishable key only**: Never expose secret keys
3. **HTTPS in production**: Always use secure connections
4. **Token expiration**: Implement token refresh logic

## Support

For issues or questions:
1. Check Medusa docs: https://docs.medusajs.com
2. Review extracted code in `src/lib/medusa/`
3. Check existing memory notes for context
