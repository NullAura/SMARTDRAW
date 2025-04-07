import { fileURLToPath, URL } from 'node:url'
import legacy from "@vitejs/plugin-legacy"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base:'./',
  plugins: [
    vue(),
    legacy({
      targets: ["ie>=11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 添加代理配置解决CORS问题
  server: {
    proxy: {
      // 将/api前缀的请求代理到目标服务器
      '/api': {
        target: 'http://110.42.200.171:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 设置代理超时时间
        timeout: 1200000
      }
    }
  }
})
