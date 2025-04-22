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
    host: '0.0.0.0',  // 允许外部IP访问
    port: 5173,       // 指定端口
    strictPort: true, // 如果端口已被占用，则会直接退出
    cors: true,       // 启用CORS
    hmr: {
      // 解决WebSocket连接问题
      host: '121.41.225.168', // 替换为您的实际服务器IP
      protocol: 'ws',
      port: 5173,
      clientPort: 5173
    },
    proxy: {
      // 将/generate路径的请求代理到目标服务器
      '/generate': {
        target: 'http://121.4.99.231:8000',
        changeOrigin: true,
        timeout: 1200000
      },
      // 将/outputs路径的请求代理到目标服务器
      '/outputs': {
        target: 'http://121.4.99.231:8000',
        changeOrigin: true,
        timeout: 1200000
      },
      // 将/api路径的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        timeout: 120000
      }
    }
  }
})
