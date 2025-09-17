import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/history-content/',
  content_root: '../content/',
  translated_root: '../translated-content/',
})
