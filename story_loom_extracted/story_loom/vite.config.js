import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forwards frontend calls to /api/* -> the storyloom-backend during
      // `npm run dev`, so no CORS configuration is needed locally.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
