// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const MainLayout = () => import('@/layouts/MainLayout.vue')
const MerchantLayout = () => import('@/layouts/MerchantLayout.vue')
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const MerchantRegister = () => import('@/views/merchant/Register.vue')
const MerchantDashboard = () => import('@/views/merchant/Dashboard.vue')
const MerchantHome = () => import('@/views/merchant/Home.vue')
const AITools = () => import('@/views/merchant/AITools.vue')
const ProductManager = () => import('@/views/merchant/ProductManager.vue')
const DataAnalysis = () => import('@/views/merchant/DataAnalysis.vue')
const KeywordAnalysis = () => import('@/views/merchant/KeywordAnalysis.vue')
const User = () => import('@/views/User.vue')
const Store = () => import('@/views/Store.vue')
const Community = () => import('@/views/Community.vue')
const ProductList = () => import('@/views/ProductList.vue')
const ProductDetail = () => import('@/views/ProductDetail.vue')
const Cart = () => import('@/views/Cart.vue')
const SearchResults = () => import('@/views/SearchResults.vue')

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

router.beforeEach(to => {
  const userStore = useUserStore()
  
  // 检查登录状态
  const isLoggedIn = userStore.checkLoginStatus()
  const isMerchant = userStore.isMerchant
  const token = userStore.token

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!isLoggedIn || !token) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }

    // 检查是否需要商家权限
    if (to.meta.requiresMerchant && !isMerchant) {
      return {
        path: '/login',
        query: { 
          redirect: to.fullPath,
          message: '需要商家权限'
        }
      }
    }
  }

  return true
})

export default router
