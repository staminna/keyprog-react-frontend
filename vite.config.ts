import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    // Set base path for production deployment
    // Use '/' for root domain deployment or '/subdirectory/' for subdirectory deployment
    base: mode === 'production' ? '/' : '/',
    
    server: {
      host: "0.0.0.0",
      port: 3002,
      strictPort: true,
      allowedHosts: [
        "keyprog.varrho.com",
        "localhost",
        "127.0.0.1",
        "0.0.0.0"
      ],
      proxy: {
        '/items': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
        '/files': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
        '/assets': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
        '/server': {
          target: 'http://localhost:8065',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        clientPort: 3002,
        protocol: 'ws',
        host: 'localhost',
        port: 3002,
      },
      watch: {
        usePolling: true,
      },
      headers: {
        "Content-Security-Policy": isDev ? 
          // Development CSP - allows HTTP connections
          "default-src 'self'; " +
          "connect-src 'self' http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com ws://keyprog.varrho.com:3002 wss://keyprog.varrho.com:3002 ws: wss: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob: http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "frame-ancestors 'self' http://localhost:3002 http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "child-src 'self' blob: http://localhost:3002 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "frame-src 'self' http://localhost:3002 http://localhost:3002 http://localhost:5173 http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com"
          :
          // Production CSP - HTTPS only
          "default-src 'self'; " +
          "connect-src 'self' https://keyprog.varrho.com wss: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob: https://keyprog.varrho.com; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "frame-ancestors 'self' https://keyprog.varrho.com; " +
          "child-src 'self' blob:; " +
          "frame-src 'self' https://keyprog.varrho.com",
        "X-Frame-Options": "ALLOWALL",
      },
    },
    preview: {
      port: 3002,
      strictPort: true,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // PERFORMANCE OPTIMIZATION: Remove console.logs in production
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      // Optimize chunk size
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'directus-vendor': ['@directus/sdk'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable sourcemaps for debugging production issues
      sourcemap: mode === 'production',
    },
  };
});