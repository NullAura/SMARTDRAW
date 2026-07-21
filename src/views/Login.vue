<template>
  <div class="login-container">
    <div class="left-panel">
      <div class="brand-content">
        <h1 class="main-title">SMARTDRAW</h1>
        <p class="sub-title">智能家居设计平台</p>
        <div class="feature-list">
          <div class="feature-item">
            <i class="fas fa-magic"></i>
            <span>AI智能设计</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-paint-brush"></i>
            <span>一键美化空间</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-home"></i>
            <span>定制家居方案</span>
          </div>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <div class="login-box">
        <h2 class="welcome-text">欢迎回来</h2>
        <p class="login-desc">登录您的账户，开启智能家居设计之旅</p>
        
        <div class="role-selector">
          <button 
            :class="['role-btn', { active: selectedRole === 'merchant' }]"
            @click="selectedRole = 'merchant'"
          >
            <i class="fas fa-store"></i>
            <span>商家</span>
          </button>
          <button 
            :class="['role-btn', { active: selectedRole === 'personal' }]"
            @click="selectedRole = 'personal'"
          >
            <i class="fas fa-user"></i>
            <span>个人</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <div class="input-icon">
              <i class="fas fa-user"></i>
            </div>
            <input
                type="text"
                v-model="formData.account"
                :placeholder="selectedRole === 'merchant' ? '请输入商家账号' : '请输入邮箱或用户名'"
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
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码?</a>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="register-link">
          <template v-if="selectedRole === 'merchant'">
            还没有商家账号？<router-link to="/merchant/register">立即入驻</router-link>
          </template>
          <template v-else>
            还没有账号？<router-link to="/register">立即注册</router-link>
          </template>
        </div>

        <div class="third-party">
          <div class="divider"><span>其他登录方式</span></div>
          <div class="social-icons">
            <div class="icon-circle"><i class="fab fa-weixin" @click="handleWechatLogin"></i></div>
            <div class="icon-circle"><i class="fab fa-qq" @click="handleQQLogin"></i></div>
            <div class="icon-circle"><i class="fab fa-weibo" @click="handleWeiboLogin"></i></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  name: 'Login',
  data() {
    return {
      selectedRole: 'merchant',
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
    ...mapActions(useUserStore, ['setToken', 'setUser', 'merchantLogin', 'userLogin']),
    
    validateForm() {
      this.errors = {
        account: '',
        password: ''
      }
      
      let isValid = true
      
      if (!this.formData.account) {
        this.errors.account = this.selectedRole === 'merchant' ? '请输入商家账号' : '请输入邮箱或用户名'
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
        // 根据选择的角色调用不同的登录方法
        const loginResult = this.selectedRole === 'merchant' 
          ? await this.merchantLogin({
              account: this.formData.account,
              password: this.formData.password
            })
          : await this.userLogin({
              account: this.formData.account,
              password: this.formData.password
            })
        
        if (loginResult.success) {
          if (this.formData.remember) {
            localStorage.setItem('rememberedAccount', this.formData.account)
          }
          
          ElMessage.success('登录成功！')
          
          const fallback = this.selectedRole === 'merchant' ? '/merchant/dashboard' : '/home'
          const redirect = typeof this.$route.query.redirect === 'string'
            ? this.$route.query.redirect
            : fallback
          await this.$router.replace(redirect)
        } else {
          ElMessage.error(loginResult.message || '登录失败')
        }
      } catch (error) {
        if (error.message.includes('Failed to fetch')) {
          ElMessage.error('无法连接到服务器，请检查服务器是否运行')
        } else {
          ElMessage.error('登录失败：' + error.message)
        }
      } finally {
        this.loading = false
      }
    },
    
    handleForgotPassword() {
      ElMessage.info('忘记密码功能开发中...')
    },
    
    handleWechatLogin() {
      ElMessage.info('微信登录功能开发中...')
    },
    
    handleQQLogin() {
      ElMessage.info('QQ登录功能开发中...')
    },
    
    handleWeiboLogin() {
      ElMessage.info('微博登录功能开发中...')
    }
  },
  created() {
    const rememberedAccount = localStorage.getItem('rememberedAccount')
    if (rememberedAccount) {
      this.formData.account = rememberedAccount
      this.formData.remember = true
    }
  }
}
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #3c2913;
  --primary-light: #6e4c2f;
  --primary-dark: #2a1d0f;
  --accent-color: #ff9800;
  --text-dark: #333333;
  --text-light: #767676;
  --white: #ffffff;
  --error: #f44336;
  --success: #4caf50;
  --bg-light: #f5f5f5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/* 主容器 */
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  overflow: hidden;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.left-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("../assets/backgrounds/background.webp") center/cover no-repeat;
  opacity: 0.15;
  z-index: 0;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  text-align: center;
  color: var(--white);
}

.main-title {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.sub-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 4rem;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  width: fit-content;
  margin: 0 auto;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
}

.feature-item i {
  margin-right: 1rem;
  font-size: 1.2rem;
  color: var(--accent-color);
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-box {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

.welcome-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.login-desc {
  color: var(--text-light);
  font-size: 1rem;
  margin-bottom: 2.5rem;
}

/* 角色选择器 */
.role-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.role-btn {
  flex: 1;
  padding: 1rem 0;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn i {
  font-size: 1.5rem;
}

.role-btn span {
  font-weight: 500;
}

.role-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary-light);
}

.role-btn.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-group .input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.input-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(60, 41, 19, 0.1);
}

.input-group input.error {
  border-color: var(--error);
}

.error-message {
  color: var(--error);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}

/* 选项区域 */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  cursor: pointer;
}

.remember-me input {
  margin: 0;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(60, 41, 19, 0.2);
}

.login-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(60, 41, 19, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin: 2rem 0;
  color: var(--text-light);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 第三方登录 */
.third-party {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 1.5rem;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 40%;
  height: 1px;
  background: #e0e0e0;
}

.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 40%;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  display: inline-block;
  padding: 0 1rem;
  background: white;
  position: relative;
  z-index: 1;
  color: var(--text-light);
  font-size: 0.9rem;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.icon-circle {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-circle i {
  font-size: 1.5rem;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.icon-circle:hover {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.icon-circle:hover i {
  color: white;
}

/* 响应式设计 */
@media screen and (max-width: 992px) {
  .login-container {
    flex-direction: column;
  }
  
  .left-panel {
    display: none;
  }
  
  .right-panel {
    flex: none;
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  }
  
  .login-box {
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    padding: 2rem;
  }
  
  .feature-item {
    display: none;
  }
}

@media screen and (max-width: 576px) {
  .login-box {
    padding: 1.5rem;
  }
  
  .welcome-text {
    font-size: 2rem;
  }
  
  .role-selector {
    flex-direction: column;
  }
  
  .input-group input {
    padding: 0.9rem 1rem 0.9rem 3rem;
  }
  
  .social-icons {
    gap: 1rem;
  }
  
  .icon-circle {
    width: 40px;
    height: 40px;
  }
}
</style>
