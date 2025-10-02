import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Disable Vite's default error overlay which can crash in some environments
  // (the app already normalizes thrown values in src/main.tsx)
  server: {
    hmr: {
      overlay: false,
    },
  },
});
