import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    headers: {
      "Content-Security-Policy": "default-src 'self'; connect-src 'self' http://localhost:8065 ws: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: http://localhost:8065; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self' http://localhost:8065 https://keyprog.varrho.com; child-src 'self' blob:; frame-src 'self' http://localhost:8065",
      "X-Frame-Options": "ALLOWALL",
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
