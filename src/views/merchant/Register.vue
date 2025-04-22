<template>
  <div class="register-container">
    <div class="register-box">
      <div class="logo">
        <img src="@/assets/background.png" alt="Logo">
        <h1>商家入驻</h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>
            <i class="fas fa-store"></i>
          </label>
          <input
            type="text"
            v-model="formData.storeName"
            placeholder="请输入店铺名称"
            required
            :class="{ 'error': errors.storeName }"
          >
          <div class="error-message" v-if="errors.storeName">{{ errors.storeName }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-user"></i>
          </label>
          <input
            type="text"
            v-model="formData.username"
            placeholder="请输入管理员账号"
            required
            :class="{ 'error': errors.username }"
          >
          <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-envelope"></i>
          </label>
          <input
            type="email"
            v-model="formData.email"
            placeholder="请输入邮箱"
            required
            :class="{ 'error': errors.email }"
          >
          <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-phone"></i>
          </label>
          <input
            type="tel"
            v-model="formData.phone"
            placeholder="请输入联系电话"
            required
            :class="{ 'error': errors.phone }"
          >
          <div class="error-message" v-if="errors.phone">{{ errors.phone }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-lock"></i>
          </label>
          <input
            type="password"
            v-model="formData.password"
            placeholder="请输入密码"
            required
            :class="{ 'error': errors.password }"
          >
          <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-lock"></i>
          </label>
          <input
            type="password"
            v-model="formData.confirmPassword"
            placeholder="请确认密码"
            required
            :class="{ 'error': errors.confirmPassword }"
          >
          <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-map-marker-alt"></i>
          </label>
          <input
            type="text"
            v-model="formData.address"
            placeholder="请输入店铺地址"
            required
            :class="{ 'error': errors.address }"
          >
          <div class="error-message" v-if="errors.address">{{ errors.address }}</div>
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-file-alt"></i>
          </label>
          <input
            type="text"
            v-model="formData.businessLicense"
            placeholder="请输入营业执照号"
            required
            :class="{ 'error': errors.businessLicense }"
          >
          <div class="error-message" v-if="errors.businessLicense">{{ errors.businessLicense }}</div>
        </div>

        <div class="form-options">
          <label class="agreement">
            <input type="checkbox" v-model="formData.agree" required>
            <span>我已阅读并同意</span>
            <a href="#" @click.prevent="showAgreement">《商家入驻协议》</a>
          </label>
        </div>

        <button type="submit" class="register-btn" :disabled="loading">
          <span v-if="!loading">立即入驻</span>
          <i v-else class="fas fa-spinner fa-spin"></i>
        </button>
      </form>

      <div class="login-link">
        已有商家账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '@/config'

export default {
  name: 'MerchantRegister',
  data() {
    return {
      formData: {
        storeName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        businessLicense: '',
        agree: false
      },
      errors: {
        storeName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        businessLicense: ''
      },
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {
        storeName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        businessLicense: ''
      }
      
      let isValid = true
      
      // 店铺名称验证
      if (!this.formData.storeName) {
        this.errors.storeName = '请输入店铺名称'
        isValid = false
      }
      
      // 用户名验证
      if (!this.formData.username) {
        this.errors.username = '请输入管理员账号'
        isValid = false
      } else if (this.formData.username.length < 3) {
        this.errors.username = '账号长度不能少于3位'
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
      
      // 电话验证
      if (!this.formData.phone) {
        this.errors.phone = '请输入联系电话'
        isValid = false
      } else if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        this.errors.phone = '请输入有效的手机号码'
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
      } else if (this.formData.confirmPassword !== this.formData.password) {
        this.errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      // 地址验证
      if (!this.formData.address) {
        this.errors.address = '请输入店铺地址'
        isValid = false
      }
      
      // 营业执照验证
      if (!this.formData.businessLicense) {
        this.errors.businessLicense = '请输入营业执照号'
        isValid = false
      }
      
      // 协议验证
      if (!this.formData.agree) {
        ElMessage.warning('请阅读并同意商家入驻协议')
        isValid = false
      }
      
      return isValid
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.loading = true
      try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.formData,
            role: 'merchant'
          })
        })

        const data = await response.json()

        if (data.success) {
          ElMessage.success('商家入驻申请已提交，请等待审核')
          this.$router.push('/login')
        } else {
          ElMessage.error(data.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        ElMessage.error('注册失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    showAgreement() {
      // 显示商家入驻协议
      ElMessage.info('商家入驻协议内容')
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: var(--bg-color);
}

.register-box {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo img {
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
}

.logo h1 {
  color: var(--text-color);
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  position: relative;
  margin-bottom: 20px;
}

.form-group label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--info-color);
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-group input.error {
  border-color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
}

.form-options {
  margin-bottom: 24px;
}

.agreement {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--info-color);
  font-size: 14px;
}

.agreement a {
  color: var(--primary-color);
  text-decoration: none;
}

.agreement a:hover {
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.register-btn:hover {
  opacity: 0.9;
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: var(--info-color);
  font-size: 14px;
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .register-box {
    padding: 30px 20px;
  }
}
</style> 