// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import User from '@/views/User.vue'
import Store from '@/views/Store.vue'
import Community from '@/views/Community.vue'

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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('isLoggedIn')) {
    next('/login')
  } else {
    next()
  }
})

export default router