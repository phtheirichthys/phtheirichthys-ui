import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    wasm(),
  ],
  build: {
    rollupOptions: {
      output: {
        // inlineDynamicImports: true
        // manualChunks: {
        // }
      }
    },
  },
  worker: {
    format: 'es',
    plugins: () => [
      wasm(),
    ],
    rollupOptions: {
      output: {
        // inlineDynamicImports: true,
      }
    },
  },
})
