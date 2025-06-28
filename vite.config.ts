import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@supabase/supabase-js', 'react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: false
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false
    }
  },
  preview: {
    port: 4173,
    host: true
  },
  esbuild: {
    target: 'es2020',
    legalComments: 'none'
  }
});