import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // 1. FIXED: Force relative asset pathing so Android can find your JS/CSS files
  base: './', 

  // 2. FIXED: Keeps your app from crashing if 'process' is referenced anywhere
  define: {
    'process.env': {},
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
