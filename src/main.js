// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import {
  ArrowDown,
  ChatDotRound,
  ChatLineRound,
  Connection,
  Cpu,
  DataAnalysis,
  DataLine,
  Expand,
  Fold,
  Goods,
  Lightning,
  Menu,
  PieChart,
  Plus,
  PriceTag,
  Refresh,
  Search,
  Share,
  Star,
  StarFilled,
  Upload,
  UploadFilled,
  View
} from '@element-plus/icons-vue'

// 导入Vant组件样式
import 'vant/lib/index.css'

// 导入全局组件
import LoadingSpinner from './components/ui/LoadingSpinner.vue'
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

const elementIcons = {
  ArrowDown,
  ChatDotRound,
  ChatLineRound,
  Connection,
  Cpu,
  DataAnalysis,
  DataLine,
  Expand,
  Fold,
  Goods,
  Lightning,
  Menu,
  PieChart,
  Plus,
  PriceTag,
  Refresh,
  Search,
  Share,
  Star,
  StarFilled,
  Upload,
  UploadFilled,
  View
}

for (const [key, component] of Object.entries(elementIcons)) {
  app.component(key, component)
}

app.config.globalProperties.$toast = toast

// 先使用 pinia，再使用其他插件
app.use(pinia)
app.use(router)
app.mount('#app')
