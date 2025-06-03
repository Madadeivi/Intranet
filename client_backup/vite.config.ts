import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [react(), imagetools()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Asume que tu API corre en el puerto 3001
        changeOrigin: true,
        // No necesitas rewrite si tu API ya espera /api en la ruta
      }
    }
  }
})
