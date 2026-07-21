import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.BACKEND_API_TARGET || 'http://127.0.0.1:3000'
  const aiTarget = env.AI_API_TARGET || 'http://127.0.0.1:8000'
  const imageTarget = env.IMAGE_API_TARGET || 'http://127.0.0.1:9000'

  return {
    base: './',
    plugins: [
      vue(),
      AutoImport({ resolvers: [ElementPlusResolver()], dts: false }),
      Components({ resolvers: [ElementPlusResolver()], dts: false })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: env.DEV_HOST || '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/generate': { target: imageTarget, changeOrigin: true, timeout: 120000 },
        '/outputs': { target: imageTarget, changeOrigin: true, timeout: 120000 },
        '/api/auth': { target: backendTarget, changeOrigin: true },
        '/api/users': { target: backendTarget, changeOrigin: true },
        '/api/works': { target: backendTarget, changeOrigin: true },
        '/api/reviews': { target: backendTarget, changeOrigin: true },
        '/api/merchant': { target: backendTarget, changeOrigin: true },
        '/api': { target: aiTarget, changeOrigin: true, timeout: 120000 }
      }
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 750,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/echarts')) return 'charts'
            if (id.includes('node_modules/vue') || id.includes('node_modules/pinia')) {
              return 'vue-vendor'
            }
          }
        }
      }
    }
  }
})
