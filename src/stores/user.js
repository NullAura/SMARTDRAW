import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    isMerchant: localStorage.getItem('isMerchant') === 'true'
  }),
  
  getters: {
    userId: (state) => state.userInfo.id,
    username: (state) => state.userInfo.username || '',
    userAvatar: (state) => state.userInfo.avatar || '',
    // 用户权限相关
    isAdmin: (state) => state.userInfo.role === 'admin',
    userRole: (state) => state.userInfo.role || 'user'
  },
  
  actions: {
    // 设置用户信息
    setUser(userInfo) {
      console.log('设置用户信息:', userInfo)
      this.userInfo = userInfo
      this.isLoggedIn = true
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      localStorage.setItem('isLoggedIn', 'true')
      
      // 判断是否是商家
      if (userInfo.role === 'merchant') {
        console.log('设置商家权限')
        this.isMerchant = true
        localStorage.setItem('isMerchant', 'true')
      } else {
        console.log('设置非商家权限')
        this.isMerchant = false
        localStorage.setItem('isMerchant', 'false')
      }
    },
    
    // 设置token
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    // 商家登录方法
    async merchantLogin(credentials) {
      try {
        // 检查是否使用模拟数据
        const useMockData = true // 设置为true启用模拟数据

        if (useMockData) {
          console.log('使用模拟数据登录')
          // 模拟API调用
          return new Promise((resolve) => {
            setTimeout(() => {
              // 模拟成功登录
              const mockData = {
                success: true,
                message: '登录成功！',
                data: {
                  token: 'mock_token_' + Date.now(),
                  user: {
                    id: '1001',
                    username: credentials.account,
                    email: credentials.account + '@example.com',
                    role: 'merchant',
                    storeName: '测试商家'
                  }
                }
              }
              
              // 保存状态
              this.setToken(mockData.data.token)
              this.setUser(mockData.data.user)
              
              resolve(mockData)
            }, 800)
          })
        }

        // 实际API调用
        const response = await post('/api/merchant/login', credentials)
        if (response.success) {
          this.setToken(response.data.token)
          this.setUser(response.data.user)
          return { success: true, data: response.data }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        console.error('商家登录失败:', error)
        return {
          success: false,
          message: error.message || '登录失败，请稍后重试'
        }
      }
    },
    
    // 普通用户登录方法
    async userLogin(credentials) {
      try {
        // 检查是否使用模拟数据
        const useMockData = true // 设置为true启用模拟数据

        if (useMockData) {
          console.log('使用模拟数据登录')
          // 模拟API调用
          return new Promise((resolve) => {
            setTimeout(() => {
              // 模拟成功登录
              const mockData = {
                success: true,
                message: '登录成功！',
                data: {
                  token: 'mock_token_' + Date.now(),
                  user: {
                    id: '2001',
                    username: credentials.account,
                    email: credentials.account + '@example.com',
                    role: 'user'
                  }
                }
              }
              
              // 保存状态
              this.setToken(mockData.data.token)
              this.setUser(mockData.data.user)
              
              resolve(mockData)
            }, 800)
          })
        }

        // 实际API调用
        const response = await post('/api/auth/login', credentials)
        if (response.success) {
          this.setToken(response.data.token)
          this.setUser(response.data.user)
          return { success: true, data: response.data }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        console.error('用户登录失败:', error)
        return {
          success: false,
          message: error.message || '登录失败，请稍后重试'
        }
      }
    },
    
    // 登出方法
    async logout() {
      // 将变量提升到方法作用域顶部
      const useMockData = true // 设置为true启用模拟数据
      
      try {
        if (useMockData) {
          console.log('使用模拟数据登出')
          // 模拟API调用
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('模拟登出成功')
              resolve({ success: true })
              // 清除状态
              this.clearState()
            }, 300)
          })
        }

        // 根据用户角色选择登出API路径
        if (this.isMerchant) {
          await post('/api/merchant/logout')
        } else {
          await post('/api/auth/logout')
        }
      } catch (error) {
        console.error('登出失败:', error)
        // 即使API调用失败，也要清除本地状态
      } finally {
        if (!useMockData) {
          this.clearState()
        }
      }
    },
    
    // 清除状态
    clearState() {
      console.log('清除用户状态')
      // 清除store状态
      this.token = ''
      this.userInfo = {}
      this.isLoggedIn = false
      this.isMerchant = false
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('isMerchant')
      localStorage.removeItem('rememberedAccount')
    },
    
    // 同步状态
    syncState() {
      this.token = localStorage.getItem('token') || ''
      this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      this.isMerchant = localStorage.getItem('isMerchant') === 'true'
    },
    
    // 检查登录状态
    checkLoginStatus() {
      const token = localStorage.getItem('token')
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      
      if (token && userInfo && isLoggedIn) {
        this.token = token
        this.userInfo = userInfo
        this.isLoggedIn = true
        this.isMerchant = userInfo.role === 'merchant'
        return true
      }
      
      this.clearState()
      return false
    },
    
    // 获取用户信息
    async getUserInfo() {
      if (!this.token) return null
      
      try {
        // 检查是否使用模拟数据
        const useMockData = true // 设置为true启用模拟数据

        if (useMockData) {
          console.log('使用模拟数据获取用户信息')
          // 直接返回当前存储的用户信息
          return this.userInfo
        }

        // 根据用户角色选择API路径
        const response = this.isMerchant 
          ? await get('/api/merchant/me')
          : await get('/api/auth/me')
          
        if (response.success && response.data) {
          this.setUser(response.data)
          return response.data
        }
        return null
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return null
      }
    },
    
    // 获取用户画像
    async getUserProfile() {
      if (!this.token || !this.userId) return {};
      
      try {
        // 实际项目中应调用API
        // 模拟获取用户画像数据
        return new Promise((resolve) => {
          setTimeout(() => {
            const profile = {
              interests: ['家具', '装饰', '厨房用品'],
              recentViews: ['沙发', '餐桌', '床垫'],
              preferredCategories: ['客厅家具', '卧室家具'],
              preferredPriceRange: {
                min: 1000,
                max: 5000
              }
            };
            resolve(profile);
          }, 500);
        });
      } catch (error) {
        console.error('获取用户画像失败:', error);
        return {};
      }
    },
    
    // 更新用户信息
    async updateUserInfo(data) {
      if (!this.token) return { success: false, message: '未登录' };
      
      try {
        // 实际项目中应调用API
        // 模拟API调用
        return new Promise((resolve) => {
          setTimeout(() => {
            // 更新状态
            const updatedInfo = { ...this.userInfo, ...data };
            this.setUser(updatedInfo);
            
            resolve({
              success: true,
              data: updatedInfo
            });
          }, 500);
        });
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return {
          success: false,
          message: error.message || '更新失败，请稍后重试'
        };
      }
    }
  }
}) 