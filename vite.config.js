import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages: build output -> dist
// base '/' çünkü ayrı domain (zexapp.xyz) kök dizinde çalışacak
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2018',
  },
});
