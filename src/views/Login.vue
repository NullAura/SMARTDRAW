<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">欢迎登录</h1>

      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <input
              type="email"
              v-model="formData.email"
              placeholder="请输入邮箱"
              required
              :class="{ 'error': errors.email }"
          >
          <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
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
export default {
  name: 'Login',
  data() {
    return {
      formData: {
        email: '',
        password: '',
        remember: false
      },
      errors: {
        email: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {
        email: '',
        password: ''
      }
      
      let isValid = true
      
      // 邮箱验证
      if (!this.formData.email) {
        this.errors.email = '请输入邮箱'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        this.errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      // 密码验证
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
        // 这里替换为实际的API调用
        const response = await this.login(this.formData)
        
        if (response.success) {
          // 存储用户信息和token
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          // 如果选择了记住我，可以存储更多信息
          if (this.formData.remember) {
            localStorage.setItem('rememberedEmail', this.formData.email)
          }
          
          // 登录成功提示
          this.$message.success('登录成功')
          
          // 跳转到首页
          this.$router.push('/home')
        } else {
          this.$message.error(response.message || '登录失败')
        }
      } catch (error) {
        this.$message.error('登录失败，请稍后重试')
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 模拟登录API调用
    login(credentials) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 这里模拟API响应
          if (credentials.email === 'test@example.com' && credentials.password === '123456') {
            resolve({
              success: true,
              token: 'mock-token',
              user: {
                id: 1,
                email: credentials.email,
                name: 'Test User'
              }
            })
          } else {
            resolve({
              success: false,
              message: '邮箱或密码错误'
            })
          }
        }, 1000)
      })
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
    // 检查是否有记住的邮箱
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      this.formData.email = rememberedEmail
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