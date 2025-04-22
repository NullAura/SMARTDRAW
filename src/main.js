// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入Vant组件样式
import 'vant/lib/index.css'

// 导入SVG图标库
import { icons, createIcon } from './assets/svg/icons.js'

// 导入全局组件
import LoadingSpinner from './components/LoadingSpinner.vue'
import Skeleton from './components/ui/Skeleton.vue'

// 导入全局服务
import toast from './utils/toast.js'

// 导入自定义变量和样式
import './assets/css/variables.css'
import './assets/css/common.css'
import './assets/css/animations.css'
// 导入Element Plus样式覆盖
import './styles/element-override.css'

const app = createApp(App)
const pinia = createPinia()

// 注册全局组件
app.component('LoadingSpinner', LoadingSpinner)
app.component('Skeleton', Skeleton)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局属性
app.config.globalProperties.$toast = toast
app.config.globalProperties.$icons = icons
app.config.globalProperties.$createIcon = createIcon

// 先使用 pinia，再使用其他插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')