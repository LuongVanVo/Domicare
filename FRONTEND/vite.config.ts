import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// ======================================================
// ⚙️ Cấu hình Vite cho SPA (CSR only)
// ======================================================

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    allowedHosts: [
      'domicare.cloud.hnagnurtme.id.vn',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      host: 'domicare.cloud.hnagnurtme.id.vn',
      protocol: 'ws'
    }
  }
})
