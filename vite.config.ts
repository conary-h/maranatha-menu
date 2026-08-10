import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // jspdf is only pulled in when the user actually exports a PDF, so keep it
    // out of the initial bundle (see src/lib/export.ts for the dynamic import).
    chunkSizeWarningLimit: 900,
  },
})
