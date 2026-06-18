import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          bytemd: ['bytemd', '@bytemd/react', '@bytemd/plugin-gfm', '@bytemd/plugin-highlight', '@bytemd/plugin-breaks', '@bytemd/plugin-math'],
          vendor: ['react', 'react-dom', '@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
