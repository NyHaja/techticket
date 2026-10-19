import tailwindscss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 *  https://vite.dev/config/
 * Toute requête vers /api : localhost:5173/api/... est transmise à localhost:3000/...
 *  */ 
export default defineConfig({
  plugins: [react(), tailwindscss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
