// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import MerchantLayout from '@/layouts/MerchantLayout.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import MerchantRegister from '@/views/merchant/Register.vue'
import MerchantDashboard from '@/views/merchant/Dashboard.vue'
import MerchantHome from '@/views/merchant/Home.vue'
import AITools from '@/views/merchant/AITools.vue'
import ProductManager from '@/views/merchant/ProductManager.vue'
import DataAnalysis from '@/views/merchant/DataAnalysis.vue'
import KeywordAnalysis from '@/views/merchant/KeywordAnalysis.vue'
import User from '@/views/User.vue'
import Store from '@/views/Store.vue'
import Community from '@/views/Community.vue'
import ProductList from '@/views/ProductList.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import SearchResults from '@/views/SearchResults.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    component: Login 
  },
  { 
    path: '/register', 
    component: Register 
  },
  {
    path: '/merchant/register',
    component: MerchantRegister
  },
  {
    path: '/merchant',
    component: MerchantLayout,
    children: [
      {
        path: '',
        component: MerchantHome,
        meta: { requiresAuth: true, requiresMerchant: true }
      },
      {
        path: 'dashboard',
        component: MerchantDashboard,
        meta: { requiresAuth: true, requiresMerchant: true }
      },
      {
        path: 'ai-tools',
        component: AITools,
        meta: { requiresAuth: true, requiresMerchant: true }
      },
      {
        path: 'products',
        component: ProductManager,
        meta: { requiresAuth: true, requiresMerchant: true }
      },
      {
        path: 'data-analysis',
        component: DataAnalysis,
        meta: { requiresAuth: true, requiresMerchant: true }
      },
      {
        path: 'keyword-analysis',
        component: KeywordAnalysis,
        meta: { requiresAuth: true, requiresMerchant: true }
      }
    ]
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'home',
        component: Home,
        meta: { requiresAuth: true }
      },
      { 
        path: 'user', 
        component: User, 
        meta: { requiresAuth: true } 
      },
      { 
        path: 'store', 
        component: Store, 
        meta: { requiresAuth: true } 
      },
      { 
        path: 'community', 
        component: Community, 
        meta: { requiresAuth: true } 
      },
      {
        path: 'products/:category',
        name: 'ProductList',
        component: ProductList,
        meta: { requiresAuth: true }
      },
      {
        path: 'products/search',
        name: 'SearchResults',
        component: SearchResults,
        meta: { requiresAuth: true }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: ProductDetail,
        meta: { requiresAuth: true }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: Cart,
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  console.log('路由守卫触发:', { to: to.path, from: from.path })
  const userStore = useUserStore()
  
  // 检查登录状态
  const isLoggedIn = userStore.checkLoginStatus()
  const isMerchant = userStore.isMerchant
  const token = userStore.token

  console.log('登录状态检查:', { isLoggedIn, isMerchant, token })

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    console.log('需要认证的页面:', to.path)
    if (!isLoggedIn || !token) {
      console.log('未登录，重定向到登录页')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查是否需要商家权限
    if (to.meta.requiresMerchant && !isMerchant) {
      console.log('需要商家权限但未授权，重定向到登录页')
      next({
        path: '/login',
        query: { 
          redirect: to.fullPath,
          message: '需要商家权限'
        }
      })
      return
    }
  }

  console.log('允许访问:', to.path)
  next()
})

export default router