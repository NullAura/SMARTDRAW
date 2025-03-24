<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">欢迎登录</h1>

      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
              type="text"
              v-model="formData.account"
              placeholder="请输入邮箱或用户名"
              required
              :class="{ 'error': errors.account }"
          >
          <div class="error-message" v-if="errors.account">{{ errors.account }}</div>
        </div>

        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
              type="password"
              v-model="formData.password"
              placeholder="请输入密码"
              required
              :class="{ 'error': errors.password }"
          >
          <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <div class="options">
          <label class="remember-me">
            <input type="checkbox" v-model="formData.remember">
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码</a>
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>

      <div class="third-party">
        <p class="divider"><span>其他登录方式</span></p>
        <div class="icons">
          <i class="fab fa-weixin" @click="handleWechatLogin"></i>
          <i class="fab fa-qq" @click="handleQQLogin"></i>
          <i class="fab fa-weibo" @click="handleWeiboLogin"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '@/config'

export default {
  name: 'Login',
  data() {
    return {
      formData: {
        account: '',
        password: '',
        remember: false
      },
      errors: {
        account: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {
        account: '',
        password: ''
      }
      
      let isValid = true
      
      if (!this.formData.account) {
        this.errors.account = '请输入邮箱或用户名'
        isValid = false
      }
      
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
        isValid = false
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度不能少于6位'
        isValid = false
      }
      
      return isValid
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.loading = true
      try {
        console.log('开始登录请求...')
        console.log('API地址:', API_BASE_URL)
        console.log('请求参数:', {
          account: this.formData.account,
          password: this.formData.password
        })
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            account: this.formData.account,
            password: this.formData.password
          })
        })

        console.log('收到响应:', response.status)
        console.log('响应头:', Object.fromEntries(response.headers.entries()))
        
        const data = await response.json()
        console.log('响应数据:', data)

        if (data.success) {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          localStorage.setItem('isLoggedIn', 'true')
          
          if (this.formData.remember) {
            localStorage.setItem('rememberedAccount', this.formData.account)
          }
          
          ElMessage.success(data.message)
          this.$router.push('/home')
        } else {
          console.error('登录失败:', data.message)
          ElMessage.error(data.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误详情:', error)
        console.error('错误堆栈:', error.stack)
        if (error.message.includes('Failed to fetch')) {
          console.error('网络请求失败，可能的原因：')
          console.error('1. 服务器未启动')
          console.error('2. 网络连接问题')
          console.error('3. CORS 配置问题')
          console.error('4. 防火墙阻止')
          ElMessage.error('无法连接到服务器，请检查服务器是否运行')
        } else {
          ElMessage.error('登录失败：' + error.message)
        }
      } finally {
        this.loading = false
      }
    },
    
    handleForgotPassword() {
      // 实现忘记密码功能
      this.$message.info('忘记密码功能开发中...')
    },
    
    handleWechatLogin() {
      // 实现微信登录
      this.$message.info('微信登录功能开发中...')
    },
    
    handleQQLogin() {
      // 实现QQ登录
      this.$message.info('QQ登录功能开发中...')
    },
    
    handleWeiboLogin() {
      // 实现微博登录
      this.$message.info('微博登录功能开发中...')
    }
  },
  created() {
    // 检查是否有记住的账号
    const rememberedAccount = localStorage.getItem('rememberedAccount')
    if (rememberedAccount) {
      this.formData.account = rememberedAccount
      this.formData.remember = true
    }
  }
}
</script>

<style scoped>
:root {
  --primary-color: #3c2913;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --bg-color: #f0f2f5;
  --text-color: #2c3e50;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  background: url("../assets/Logbackground.png");
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.login-box {
  background: rgb(251, 248, 234);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.5s ease;
}

.title {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: border-color 0.3s;
}

.input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-icon {
  padding: 0 15px;
  color: var(--info-color);
}

input {
  width: 100%;
  height: 45px;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  padding-right: 15px;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.remember-me {
  color: var(--info-color);
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.remember-me input[type="checkbox"] {
  transform: scale(1);
  margin: 0;
  width: auto;
  height: auto;
}

.remember-me span {
  display: inline-block;
  vertical-align: middle;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
}

.login-btn {
  width: 100%;
  height: 45px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.third-party {
  margin-top: 2rem;
  text-align: center;
}

.divider {
  color: var(--info-color);
  position: relative;
  margin: 1rem 0;
  text-align: center;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #dcdfe6;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: rgb(251, 248, 234);
  padding: 0 10px;
  position: relative;
  z-index: 1;
}

.icons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 1.5rem;
  color: var(--info-color);
  margin-top: 1rem;
}

.icons i {
  cursor: pointer;
  transition: color 0.3s;
}

.icons i:hover {
  color: var(--primary-color);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .login-box {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  input {
    font-size: 0.9rem;
  }
}

.error {
  border-color: var(--danger-color) !important;
}

.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.3rem;
  margin-left: 0.5rem;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--info-color);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>