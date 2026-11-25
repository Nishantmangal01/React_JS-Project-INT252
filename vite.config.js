import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Send every /api request to the Express server so the browser never talks to MongoDB directly
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
