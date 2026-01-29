import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/302': {
        target: 'https://api.302.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/302/, ''),
        secure: false,
        headers: {
          'Referer': 'https://api.302.ai'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
})
