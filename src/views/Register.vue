<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="title">用户注册</h1>

      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
          </div>
          <input
              type="text"
              v-model="formData.username"
              placeholder="请输入用户名"
              required
              :class="{ 'error': errors.username }"
          >
          <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
        </div>

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

        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
              type="password"
              v-model="formData.confirmPassword"
              placeholder="请确认密码"
              required
              :class="{ 'error': errors.confirmPassword }"
          >
          <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>

        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </form>

      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
      
      let isValid = true
      
      // 用户名验证
      if (!this.formData.username) {
        this.errors.username = '请输入用户名'
        isValid = false
      } else if (this.formData.username.length < 3) {
        this.errors.username = '用户名长度不能少于3位'
        isValid = false
      }
      
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
      
      // 确认密码验证
      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请确认密码'
        isValid = false
      } else if (this.formData.password !== this.formData.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      return isValid
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.loading = true
      try {
        // 这里替换为实际的API调用
        const response = await this.register(this.formData)
        
        if (response.success) {
          // 注册成功提示
          this.$message.success('注册成功')
          
          // 跳转到登录页
          this.$router.push('/login')
        } else {
          this.$message.error(response.message || '注册失败')
        }
      } catch (error) {
        this.$message.error('注册失败，请稍后重试')
        console.error('Register error:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 模拟注册API调用
    register(userData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 这里模拟API响应
          resolve({
            success: true,
            message: '注册成功'
          })
        }, 1000)
      })
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: url("../assets/Logbackground.png");
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.register-box {
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

.error {
  border-color: var(--danger-color) !important;
}

.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.3rem;
  margin-left: 0.5rem;
}

.register-btn {
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

.register-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--info-color);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
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
  .register-box {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  input {
    font-size: 0.9rem;
  }
}
</style> 