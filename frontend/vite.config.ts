// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import macrosPlugin from "vite-plugin-babel-macros"

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    macrosPlugin(),
  ],
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material', '@mui/icons-material'],
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
