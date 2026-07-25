import { defineStore } from 'pinia'
import { get, patch, post } from '@/api/client'

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

function readStoredJson(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: readStoredJson('userInfo'),
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    isMerchant: localStorage.getItem('isMerchant') === 'true'
  }),

  getters: {
    userId: state => state.userInfo.id,
    username: state => state.userInfo.username || '',
    userAvatar: state => state.userInfo.avatar || '',
    isAdmin: state => state.userInfo.role === 'admin',
    userRole: state => state.userInfo.role || 'user'
  },

  actions: {
    setUser(userInfo) {
      this.userInfo = userInfo
      this.isLoggedIn = true
      this.isMerchant = userInfo.role === 'merchant'
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('isMerchant', String(this.isMerchant))
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    async login(credentials, role) {
      if (USE_MOCK_DATA) {
        const user = {
          id: role === 'merchant' ? 'mock-merchant' : 'mock-user',
          username: credentials.account,
          email: `${credentials.account}@example.com`,
          role,
          ...(role === 'merchant' ? { storeName: '演示商家' } : {})
        }
        this.setToken(`demo-${Date.now()}`)
        this.setUser(user)
        return { success: true, data: { user } }
      }

      try {
        const endpoint = role === 'merchant' ? '/api/merchant/login' : '/api/auth/login'
        const response = await post(endpoint, credentials)
        if (!response.success) return response
        this.setToken(response.data.token)
        this.setUser(response.data.user)
        return response
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '登录失败，请稍后重试'
        }
      }
    },

    merchantLogin(credentials) {
      return this.login(credentials, 'merchant')
    },

    userLogin(credentials) {
      return this.login(credentials, 'user')
    },

    async logout() {
      try {
        if (!USE_MOCK_DATA && this.token) {
          await post(this.isMerchant ? '/api/merchant/logout' : '/api/auth/logout')
        }
      } finally {
        this.clearState()
      }
      return { success: true }
    },

    clearState() {
      this.token = ''
      this.userInfo = {}
      this.isLoggedIn = false
      this.isMerchant = false
      for (const key of ['token', 'userInfo', 'isLoggedIn', 'isMerchant']) {
        localStorage.removeItem(key)
      }
    },

    syncState() {
      this.token = localStorage.getItem('token') || ''
      this.userInfo = readStoredJson('userInfo')
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      this.isMerchant = this.userInfo.role === 'merchant'
    },

    checkLoginStatus() {
      this.syncState()
      if (this.token && this.userInfo.id && this.isLoggedIn) return true
      this.clearState()
      return false
    },

    async getUserInfo() {
      if (!this.token) return null
      if (USE_MOCK_DATA) return this.userInfo
      try {
        const response = await get(this.isMerchant ? '/api/merchant/me' : '/api/auth/me')
        if (!response.success || !response.data) return null
        this.setUser(response.data)
        return response.data
      } catch {
        this.clearState()
        return null
      }
    },

    async getUserProfile() {
      if (!this.token || !this.userId) return {}
      return {
        interests: ['家具', '装饰', '厨房用品'],
        recentViews: ['沙发', '餐桌', '床垫'],
        preferredCategories: ['客厅家具', '卧室家具'],
        preferredPriceRange: { min: 1000, max: 5000 }
      }
    },

    async updateUserInfo(data) {
      if (!this.token) return { success: false, message: '未登录' }
      try {
        if (USE_MOCK_DATA) {
          const updatedInfo = { ...this.userInfo, ...data }
          this.setUser(updatedInfo)
          return { success: true, data: updatedInfo }
        }
        const response = await patch(`/api/users/${this.userId}`, data)
        if (response.success) this.setUser({ ...this.userInfo, ...response.data })
        return response
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '更新失败，请稍后重试'
        }
      }
    }
  }
})
