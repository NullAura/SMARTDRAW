// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

// 导入Vant组件样式
import 'vant/lib/index.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')