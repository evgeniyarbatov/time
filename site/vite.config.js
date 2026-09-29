import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/time/',
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'Android >= 6'],
      modernTargets: ['chromeAndroid >= 61', 'chrome >= 61'],
      modernPolyfills: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
