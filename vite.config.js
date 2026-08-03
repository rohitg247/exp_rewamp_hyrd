import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimize build for Crestron
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false // Keep console logs for debugging on device
      }
    },
    rollupOptions: {
      // This won't remove the warnings but build will continue
      onwarn(warning, warn) {
        // Ignore eval warnings from Crestron libraries
        if (warning.code === 'EVAL' || warning.message?.includes('eval')) {
          return;
        }
        warn(warning);
      }
    }
  },
  // CRITICAL: Set base to relative path for Crestron deployment
  base: './',

  // Fix Crestron library resolution issues
  optimizeDeps: {
    include: ['@crestron/ch5-crcomlib', '@crestron/ch5-webxpanel'],
    exclude: [] // Don't exclude Crestron packages
  },
  
  resolve: {
    alias: {
      // Help Vite resolve Crestron packages
      '@crestron/ch5-crcomlib': '@crestron/ch5-crcomlib/build_bundles/cjs/cr-com-lib.js',
    }
  },

})