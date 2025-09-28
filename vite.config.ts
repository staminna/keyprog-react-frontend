import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
      allowedHosts: [
        "keyprog.varrho.com",
        "localhost",
        "127.0.0.1",
        "0.0.0.0"
      ],
      hmr: {
        clientPort: 3000, // Important for Docker HMR
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
      watch: {
        usePolling: true, // Important for Docker on some systems
      },
      headers: {
        "Content-Security-Policy": isDev ? 
          // Development CSP - allows HTTP connections
          "default-src 'self'; " +
          "connect-src 'self' http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com ws://keyprog.varrho.com:3000 wss://keyprog.varrho.com:3000 ws: wss: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob: http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "frame-ancestors 'self' http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "child-src 'self' blob: http://localhost:3000 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com; " +
          "frame-src 'self' http://localhost:3000 http://localhost:8065 http://keyprog:8055 https://keyprog.varrho.com http://keyprog.varrho.com"
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
      port: 3000,
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
  };
});