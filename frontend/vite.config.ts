import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/auth': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/products': { target: 'http://localhost:8003', changeOrigin: true },
      '/api/cart': { target: 'http://localhost:8001', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/payment': { target: 'http://localhost:8004', changeOrigin: true },
    }
  }
})