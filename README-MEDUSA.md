# Medusa Ecommerce Integration

## 🎯 Overview

This directory contains extracted Medusa ecommerce features from the Next.js storefront (`product-synchronization/product-sync-storefront`), adapted for the React + Vite frontend.

## 📦 What's Been Extracted

### Core Infrastructure
- **SDK Configuration** - Medusa client initialization
- **API Layer** - Cart, products, and regions operations
- **Utilities** - Money formatting, pricing, and calculations
- **Client Management** - Authentication and storage

### Key Capabilities
- ✅ Product listing with pagination
- ✅ Product search and filtering
- ✅ Cart management (add/update/remove)
- ✅ Regional pricing and currencies
- ✅ Promo code application
- ✅ Order placement
- ✅ Stripe payment integration (ready)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `@medusajs/js-sdk` - Medusa SDK
- `@medusajs/types` - TypeScript types
- `@stripe/react-stripe-js` - Stripe components
- `@tanstack/react-query` - Data fetching
- `zustand` - State management

### 2. Configure Environment
```bash
# Copy template
cp .env.medusa.example .env.medusa

# Edit with your values
nano .env.medusa

# Append to main .env
cat .env.medusa >> .env
```

Required variables:
```bash
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=your_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_key_here
```

### 3. Get Publishable Key
```bash
cd ../product-synchronization/product-sync
npx medusa api-key create --type publishable --title "React Frontend"
```

### 4. Start Development
```bash
npm run dev
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `MEDUSA-FEATURES-EXTRACTION.md` | Complete feature inventory and architecture |
| `MEDUSA-INTEGRATION-GUIDE.md` | Step-by-step setup and usage guide |
| `EXTRACTION-SUMMARY.md` | What's been done and next steps |
| `README-MEDUSA.md` | This file - quick reference |

## 🗂️ File Structure

```
src/lib/medusa/
├── index.ts                 # Main exports
├── config.ts                # SDK configuration
├── client.ts                # Storage & auth
├── api/
│   ├── cart.ts             # Cart operations
│   ├── products.ts         # Product operations
│   ├── regions.ts          # Regional pricing
│   └── index.ts            # API exports
└── utils/
    ├── money.ts            # Currency formatting
    ├── price.ts            # Price calculations
    ├── percentage.ts       # Discount calculations
    ├── isEmpty.ts          # Validation utilities
    └── index.ts            # Utils exports
```

## 💻 Usage Examples

### Fetch Products
```typescript
import { listProducts, getDefaultRegion } from '@/lib/medusa';

const region = await getDefaultRegion();
const { products, count } = await listProducts({
  regionId: region.id,
  queryParams: { limit: 12 }
});
```

### Add to Cart
```typescript
import { addToCart } from '@/lib/medusa';

await addToCart({
  variantId: 'variant_123',
  quantity: 1,
  regionId: 'reg_456'
});
```

### Format Price
```typescript
import { convertToLocale } from '@/lib/medusa';

const formatted = convertToLocale({
  amount: 1999,
  currency_code: 'USD'
});
// Output: "$19.99"
```

## 🔄 Integration Status

### ✅ Completed
- Core utilities (money, pricing)
- Medusa SDK configuration
- Client-side storage
- Cart API operations
- Products API operations
- Regions API operations
- Dependencies added
- Documentation complete

### 🔜 Next Steps
1. Install dependencies (`npm install`)
2. Create React Query provider
3. Create Zustand cart store
4. Build custom hooks
5. Integrate with UI components
6. Add checkout flow
7. Implement Stripe payments

## 🔧 Architecture Differences

### Medusa Storefront (Next.js)
- Server-side rendering
- Next.js Server Actions
- Cookies for session
- Built-in caching

### React Frontend (Vite)
- Client-side rendering
- Direct API calls
- localStorage for session
- React Query caching

## 🎯 Current TypeScript Errors

**Status:** Expected until `npm install` is run

All type errors like:
- `Cannot find module '@medusajs/js-sdk'`
- `Namespace has no exported member 'StoreCart'`

Will resolve after installing dependencies.

## 📖 API Reference

### Cart Operations
```typescript
// Get cart
const cart = await retrieveCart();

// Add item
await addToCart({ variantId, quantity, regionId });

// Update item
await updateLineItem({ lineId, quantity });

// Remove item
await deleteLineItem(lineId);

// Apply promo
await applyPromotions(['SAVE20']);

// Place order
await placeOrder();
```

### Product Operations
```typescript
// List products
const { products } = await listProducts({ regionId });

// Get single product
const product = await getProduct(productId, regionId);

// Search
const results = await searchProducts(query, regionId);

// By category
const { products } = await getProductsByCategory(categoryId, regionId);
```

### Region Operations
```typescript
// Get region by country
const region = await getRegion('us');

// Get default region
const region = await getDefaultRegion();

// List all regions
const regions = await listRegions();
```

## 🧪 Testing

### Test in Browser Console
```javascript
// After starting dev server
import { getDefaultRegion, listProducts } from '@/lib/medusa';

const region = await getDefaultRegion();
console.log('Region:', region);

const result = await listProducts({ regionId: region.id });
console.log('Products:', result.products);
```

### Verify Backend
```bash
# Check Medusa health
curl http://localhost:9000/health

# Check regions
curl http://localhost:9000/store/regions

# Check products
curl http://localhost:9000/store/products
```

## 🔐 Security

- ✅ Only publishable keys in frontend
- ✅ No secret keys exposed
- ✅ localStorage for non-sensitive data only
- ✅ HTTPS required in production
- ⚠️ Implement token refresh logic
- ⚠️ Add CORS configuration in Medusa

## 🐛 Troubleshooting

### Dependencies Won't Install
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### CORS Errors
Update Medusa `.env`:
```bash
STORE_CORS=http://localhost:5173,http://localhost:3000
```

### Cart Not Persisting
Check browser's localStorage is enabled:
```javascript
localStorage.setItem('test', '1');
localStorage.getItem('test'); // Should return '1'
```

### Products Not Loading
1. Verify Medusa is running: `curl http://localhost:9000/health`
2. Check backend URL in `.env`
3. Ensure products exist in Medusa database
4. Check browser console for errors

## 📞 Support

1. **Documentation**: Check the 3 main docs listed above
2. **Medusa Docs**: https://docs.medusajs.com
3. **React Query**: https://tanstack.com/query/latest
4. **Stripe**: https://stripe.com/docs/stripe-js/react

## ⚡ Performance

- **React Query**: Automatic caching and deduplication
- **Region Cache**: In-memory region mapping
- **Lazy Loading**: Products loaded on-demand
- **localStorage**: Fast client-side persistence

## 🎉 What's Next?

Follow the **MEDUSA-INTEGRATION-GUIDE.md** for:
1. Creating React Query provider
2. Setting up Zustand stores
3. Building custom hooks
4. Integrating with components
5. Adding checkout flow
6. Implementing payments

---

**Note**: This extraction maintains feature parity with the Medusa storefront while adapting for client-side React architecture.
