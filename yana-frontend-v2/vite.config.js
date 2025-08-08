import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    allowedHosts: [
      'beta.physicianmarketing.us',    // Frontend domain
      'beta-api.physicianmarketing.us' // Backend API domain
    ],
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    exclude: ['.git']
  }
})
