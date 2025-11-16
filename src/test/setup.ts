import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Cleanup after each test case
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
  server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock environment variables
vi.stubEnv('VITE_MEDUSA_API_URL', 'http://localhost:9000');
vi.stubEnv('VITE_MEDUSA_PUBLISHABLE_KEY', 'test_publishable_key');
