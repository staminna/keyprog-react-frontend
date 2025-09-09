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
      hmr: {
        clientPort: 3000, // Important for Docker HMR
        protocol: 'ws',
        host: 'localhost',
      },
      watch: {
        usePolling: true, // Important for Docker on some systems
      },
      headers: {
        "Content-Security-Policy": "default-src 'self'; " +
          "connect-src 'self' http://directus:8055 ws: wss: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob: http://directus:8055; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "frame-ancestors 'self' http://directus:8055; " +
          "child-src 'self' blob:; " +
          "frame-src 'self' http://directus:8055",
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