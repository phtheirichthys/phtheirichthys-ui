import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from "vite-plugin-wasm";
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    topLevelAwait(),
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
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
  }
})
