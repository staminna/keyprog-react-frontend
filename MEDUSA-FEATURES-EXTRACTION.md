# Medusa Features Extraction Guide

## Overview
This document tracks the extraction of ecommerce features from the Medusa Next.js storefront (`product-sync-storefront`) into the React frontend (`react-frontend`).

## Source Architecture (Medusa Storefront)
- **Framework**: Next.js 15 with App Router
- **Backend**: Medusa v2 ecommerce engine
- **SDK**: @medusajs/js-sdk
- **Styling**: Tailwind CSS + @medusajs/ui
- **Payment**: Stripe integration
- **Key Dependencies**:
  - @medusajs/js-sdk (latest)
  - @medusajs/ui (latest)
  - @stripe/react-stripe-js
  - @headlessui/react

## Target Architecture (React Frontend)
- **Framework**: React 18 + Vite
- **Backend**: Directus CMS
- **Router**: React Router v6
- **Styling**: Tailwind CSS + shadcn/ui
- **Key Dependencies**: Need to add Medusa SDK

## Features to Extract

### 1. Core Utilities ✅
- **Money Formatting** (`lib/util/money.ts`)
  - `convertToLocale()` - Format currency with locale support
  
- **Price Calculations** (`lib/util/get-product-price.ts`)
  - `getPricesForVariant()` - Calculate variant prices
  - `getProductPrice()` - Get product/variant pricing
  
- **Percentage Diff** (`lib/util/get-precentage-diff.ts`)
  - Calculate discount percentages

- **Empty Check** (`lib/util/isEmpty.ts`)
  - Utility for checking empty values

### 2. Medusa SDK Integration Layer
- **Config** (`lib/config.ts`)
  - Medusa SDK initialization
  - Environment configuration
  
- **API Data Layer** (`lib/data/`)
  - `cart.ts` - Cart operations (create, update, add items, etc.)
  - `products.ts` - Product fetching and filtering
  - `customer.ts` - Customer auth and management
  - `orders.ts` - Order retrieval and management
  - `payment.ts` - Payment processing
  - `regions.ts` - Region/currency management
  - `collections.ts` - Product collections
  - `categories.ts` - Product categories

### 3. Cart Features
- **Components** (`modules/cart/components/`)
  - Line item display
  - Quantity controls
  - Cart totals
  - Promo code input
  
- **Templates** (`modules/cart/templates/`)
  - Cart page layout
  - Cart preview/drawer
  - Cart items list
  - Cart summary

- **Functionality**:
  - Add to cart
  - Update quantities
  - Remove items
  - Apply promotions
  - Calculate totals

### 4. Checkout Flow
- **Components** (`modules/checkout/components/`)
  - Address forms
  - Shipping options
  - Payment methods
  - Order review
  - Payment providers (Stripe)
  
- **Templates** (`modules/checkout/templates/`)
  - Multi-step checkout flow
  - Order confirmation

- **Functionality**:
  - Address collection
  - Shipping method selection
  - Payment processing
  - Order placement

### 5. Product Display
- **Components** (`modules/products/components/`)
  - Product cards/tiles
  - Product image gallery
  - Variant selector
  - Price display
  - Stock status
  - Add to cart button
  
- **Templates** (`modules/products/templates/`)
  - Product detail page
  - Product list/grid
  - Product collections

### 6. Account Management
- **Components** (`modules/account/`)
  - Login/register forms
  - Order history
  - Address book
  - Account details
  
- **Templates**:
  - Account dashboard
  - Order details
  - Profile management

### 7. Common Components
- **Icons** (`modules/common/icons/`)
  - Payment provider icons
  - UI icons
  
- **UI Components** (`modules/common/components/`)
  - Buttons
  - Inputs
  - Loading states
  - Error handling

## Integration Plan

### Phase 1: Dependencies & Config ✅
1. Add required packages to package.json
2. Create Medusa SDK config
3. Set up environment variables

### Phase 2: Utilities & Helpers
1. Extract money/price utilities
2. Add error handling utilities
3. Create type definitions

### Phase 3: Data Layer
1. Adapt Medusa data layer for React
2. Convert Server Actions to client-side API calls
3. Add React Query or similar for state management

### Phase 4: Cart Implementation
1. Extract cart state management
2. Implement cart components
3. Add cart drawer/modal
4. Test cart operations

### Phase 5: Product Features
1. Extract product components
2. Implement variant selection
3. Add product filters
4. Integrate with cart

### Phase 6: Checkout Flow
1. Build checkout steps
2. Integrate Stripe payment
3. Add address validation
4. Implement order placement

### Phase 7: Account Features
1. Auth integration (adapt to Directus)
2. Order history view
3. Profile management
4. Address book

## Key Differences to Address

### Server Actions vs Client API
- **Medusa**: Uses Next.js Server Actions (`"use server"`)
- **React**: Need client-side API calls with fetch/axios
- **Solution**: Create API service layer that wraps Medusa SDK

### Routing
- **Medusa**: Next.js App Router with file-based routing
- **React**: React Router with programmatic routes
- **Solution**: Adapt redirects to use `navigate()` from react-router

### Caching
- **Medusa**: Uses Next.js cache and revalidateTag
- **React**: Need client-side caching (React Query, SWR, Zustand)
- **Solution**: Implement React Query for data fetching and caching

### SSR vs CSR
- **Medusa**: Server-side rendering
- **React**: Client-side rendering with Vite
- **Solution**: All API calls happen client-side

## Environment Variables Required

```bash
# Medusa Backend
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=your_publishable_key

# Stripe (if using)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Dependencies to Add

```json
{
  "@medusajs/js-sdk": "latest",
  "@medusajs/types": "latest",
  "@stripe/react-stripe-js": "^1.7.2",
  "@stripe/stripe-js": "^1.29.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0"
}
```

## File Structure in React Frontend

```
src/
├── lib/
│   ├── medusa/
│   │   ├── config.ts          # Medusa SDK setup
│   │   ├── cart.ts            # Cart API functions
│   │   ├── products.ts        # Product API functions
│   │   ├── customer.ts        # Customer API functions
│   │   ├── orders.ts          # Order API functions
│   │   └── payment.ts         # Payment API functions
│   └── utils/
│       ├── money.ts           # Currency formatting
│       ├── price.ts           # Price calculations
│       └── format.ts          # General formatting
├── components/
│   ├── cart/
│   │   ├── CartDrawer.tsx     # Already exists
│   │   ├── CartItem.tsx       # New
│   │   ├── CartSummary.tsx    # New
│   │   └── PromoCode.tsx      # New
│   ├── checkout/
│   │   ├── AddressForm.tsx    # New
│   │   ├── ShippingOptions.tsx # New
│   │   ├── PaymentForm.tsx    # New
│   │   └── OrderReview.tsx    # New
│   ├── products/
│   │   ├── ProductCard.tsx    # Enhance existing
│   │   ├── ProductGallery.tsx # New
│   │   ├── VariantSelector.tsx # New
│   │   └── PriceDisplay.tsx   # New
│   └── account/
│       ├── OrderHistory.tsx   # Already exists
│       ├── OrderDetails.tsx   # New
│       └── AddressBook.tsx    # New
├── hooks/
│   ├── useCart.ts             # Cart state management
│   ├── useCheckout.ts         # Checkout flow
│   └── useProduct.ts          # Product operations
├── store/
│   ├── cartStore.ts           # Zustand cart store
│   └── checkoutStore.ts       # Zustand checkout store
└── pages/
    ├── cart/
    │   └── CartPage.tsx
    ├── checkout/
    │   └── CheckoutPage.tsx
    └── orders/
        └── OrderConfirmation.tsx
```

## Progress Tracking

- [ ] Phase 1: Dependencies & Config
- [ ] Phase 2: Utilities & Helpers
- [ ] Phase 3: Data Layer
- [ ] Phase 4: Cart Implementation
- [ ] Phase 5: Product Features
- [ ] Phase 6: Checkout Flow
- [ ] Phase 7: Account Features

## Notes
- Existing cart functionality in react-frontend is basic
- Need to maintain Directus integration for products
- Medusa will handle cart/checkout/orders
- Products sync from Directus to Medusa (already configured)
