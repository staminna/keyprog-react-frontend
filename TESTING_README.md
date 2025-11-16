# Medusa + Stripe Integration Test Suite

Comprehensive test suite for React frontend integration with Medusa e-commerce backend and Stripe payment processing.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Files](#test-files)
- [Mocking Strategy](#mocking-strategy)

## 🎯 Overview

This test suite validates the complete e-commerce purchase flow:

1. **Product Browsing** - Listing and viewing products
2. **Cart Management** - Adding, updating, and removing items
3. **Checkout Process** - Shipping selection and promotions
4. **Payment Processing** - Stripe integration and payment confirmation
5. **Order Completion** - Final order placement

## 📁 Test Structure

```
src/
├── lib/
│   └── medusa/
│       ├── __tests__/
│       │   ├── client.test.ts              # Storage & auth tests
│       │   ├── stripe-integration.test.ts  # Stripe payment tests
│       │   └── e2e-purchase-flow.test.ts   # Full purchase flow
│       └── api/
│           └── __tests__/
│               ├── cart.test.ts            # Cart API tests
│               └── products.test.ts        # Products API tests
└── test/
    ├── setup.ts                            # Test configuration
    └── mocks/
        ├── handlers.ts                     # MSW API handlers
        └── server.ts                       # MSW server setup
```

## 🚀 Setup

### Install Dependencies

```bash
cd react-frontend
npm install
```

### Dependencies Installed

- **vitest** - Fast unit test framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers
- **@testing-library/user-event** - User interaction simulation
- **msw** - Mock Service Worker for API mocking
- **jsdom** - DOM environment for tests
- **@vitest/ui** - Visual test runner UI

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- cart.test.ts
```

### Run E2E Purchase Flow Test

```bash
npm test -- e2e-purchase-flow.test.ts
```

## 📊 Test Coverage

The test suite covers:

### Client Storage (client.test.ts)
- ✅ Authentication token management
- ✅ Cart ID persistence
- ✅ Cache ID management
- ✅ Storage cleanup

### Cart API (api/__tests__/cart.test.ts)
- ✅ Cart retrieval
- ✅ Cart creation
- ✅ Adding items to cart
- ✅ Updating line item quantities
- ✅ Removing line items
- ✅ Shipping method selection
- ✅ Promotion code application
- ✅ Order completion

### Products API (api/__tests__/products.test.ts)
- ✅ Product listing with pagination
- ✅ Product detail retrieval
- ✅ Product search
- ✅ Category filtering
- ✅ Collection filtering
- ✅ Error handling

### Stripe Integration (stripe-integration.test.ts)
- ✅ Stripe initialization
- ✅ Payment session creation
- ✅ Stripe Elements setup
- ✅ Payment confirmation
- ✅ Payment intent states
- ✅ Error handling

### E2E Purchase Flow (e2e-purchase-flow.test.ts)
- ✅ Complete purchase journey (14 steps)
- ✅ Payment failure handling
- ✅ Out-of-stock scenarios
- ✅ Total calculations with shipping & promos

## 📝 Test Files

### 1. Client Storage Tests
**File:** `src/lib/medusa/__tests__/client.test.ts`

Tests localStorage-based authentication and cart persistence.

```typescript
import { setAuthToken, getCartId } from '../client';

// Example test
it('should set and get auth token', () => {
  setAuthToken('test_token');
  expect(getAuthToken()).toBe('test_token');
});
```

### 2. Cart API Tests
**File:** `src/lib/medusa/api/__tests__/cart.test.ts`

Tests all cart operations including add, update, remove, and checkout.

```typescript
import { addToCart } from '../cart';

// Example test
it('should add item to cart', async () => {
  const cart = await addToCart({
    variantId: 'variant_01',
    quantity: 2,
    regionId: 'reg_01',
  });
  expect(cart.items.length).toBeGreaterThan(0);
});
```

### 3. Products API Tests
**File:** `src/lib/medusa/api/__tests__/products.test.ts`

Tests product listing, search, and filtering functionality.

```typescript
import { listProducts } from '../products';

// Example test
it('should list products', async () => {
  const result = await listProducts({ regionId: 'reg_01' });
  expect(result.products).toBeDefined();
});
```

### 4. Stripe Integration Tests
**File:** `src/lib/medusa/__tests__/stripe-integration.test.ts`

Tests Stripe payment processing and error scenarios.

```typescript
import { loadStripe } from '@stripe/stripe-js';

// Example test
it('should confirm payment', async () => {
  const stripe = await loadStripe('pk_test_123');
  const result = await stripe.confirmPayment({...});
  expect(result.paymentIntent.status).toBe('succeeded');
});
```

### 5. E2E Purchase Flow Tests
**File:** `src/lib/medusa/__tests__/e2e-purchase-flow.test.ts`

Complete 14-step purchase simulation from browsing to order completion.

**Steps Tested:**
1. Browse products
2. Add to cart
3. Update quantities
4. Apply promotions
5. Review cart
6. Get shipping options
7. Set shipping method
8. Initialize Stripe
9. Create payment session
10. Setup Stripe Elements
11. Enter payment details
12. Confirm payment
13. Complete order
14. Verify cleanup

## 🎭 Mocking Strategy

### Mock Service Worker (MSW)

We use MSW to intercept and mock Medusa API calls.

**Handlers:** `src/test/mocks/handlers.ts`

```typescript
export const handlers = [
  http.get('/store/products', () => {
    return HttpResponse.json({ products: [mockProduct] });
  }),
  http.post('/store/carts', () => {
    return HttpResponse.json({ cart: mockCart });
  }),
];
```

### Mock Data

Predefined mock objects for consistent testing:

- `mockRegion` - US region with USD currency
- `mockProduct` - Sample product with variants
- `mockCart` - Empty cart
- `mockCartWithItems` - Cart with 2 items
- `mockShippingOption` - Standard shipping
- `mockPaymentSession` - Stripe payment session
- `mockOrder` - Completed order

### Stripe Mocking

Stripe SDK is mocked using Vitest:

```typescript
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({
    confirmPayment: vi.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' }
    })
  })
}));
```

## 🔍 Test Scenarios

### Happy Path
✅ User browses products → adds to cart → applies promo → selects shipping → pays with Stripe → receives order confirmation

### Error Scenarios
- ❌ Payment declined by Stripe
- ❌ Out of stock items
- ❌ Invalid promo codes
- ❌ Missing cart ID
- ❌ Network errors

### Edge Cases
- Cart persistence across sessions
- Multiple items in cart
- Quantity updates
- Cart cleanup after order

## 📈 Coverage Goals

Target coverage metrics:
- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

View coverage report:
```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## 🐛 Debugging Tests

### Run Single Test with Verbose Output

```bash
npm test -- e2e-purchase-flow.test.ts --reporter=verbose
```

### Debug with Browser

```bash
npm run test:ui
```

This opens a browser-based test runner with step-by-step execution.

### Console Logs

The E2E test includes console logs for each step:

```
Step 1: Browsing products...
Step 2: Adding product to cart...
Cart created: cart_01
...
✅ PURCHASE FLOW COMPLETED SUCCESSFULLY! ✅
```

## 🔧 Troubleshooting

### Tests Failing?

1. **Check dependencies are installed:**
   ```bash
   npm install
   ```

2. **Clear test cache:**
   ```bash
   npm test -- --clearCache
   ```

3. **Verify MSW handlers are loaded:**
   - Check `src/test/mocks/handlers.ts`
   - Ensure `server.listen()` is called in setup

4. **Check environment variables:**
   - Verify `VITE_MEDUSA_API_URL` in `.env`
   - Ensure test setup mocks env vars

### Common Issues

**Issue:** `localStorage is not defined`
- **Solution:** Ensure `jsdom` environment is set in `vitest.config.ts`

**Issue:** API calls not being mocked
- **Solution:** Verify MSW server is started in test setup

**Issue:** Stripe SDK errors
- **Solution:** Check Stripe mocks in test file

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Medusa API Reference](https://docs.medusajs.com/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

## ✅ Checklist for New Tests

When adding new tests:

- [ ] Create test file with `.test.ts` extension
- [ ] Import required mocks and utilities
- [ ] Add describe blocks for grouping
- [ ] Include positive and negative test cases
- [ ] Add error handling tests
- [ ] Clear state in `beforeEach`
- [ ] Update this README if adding new test suites

---

**Last Updated:** November 2025
**Maintainer:** Keyprog Development Team
