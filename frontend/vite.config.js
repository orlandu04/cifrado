import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Configuración de Vite.
 *
 * - react(): transforma JSX y habilita Fast Refresh.
 * - tailwindcss(): procesa Tailwind v4 a partir de src/index.css.
 * - proxy: en desarrollo, las peticiones /api se envían al backend FastAPI
 *   para evitar problemas de CORS y mantener rutas relativas en el cliente.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
