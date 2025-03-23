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
              v-model="email"
              placeholder="请输入邮箱"
              required
          >
        </div>

        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
          </div>
          <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              required
          >
        </div>

        <div class="options">
          <label class="remember-me">
            <input type="checkbox" style="zoom:50%"> 记住我
          </label>
          <a href="#" class="forgot-password">忘记密码</a>
        </div>

        <button type="submit" class="login-btn">立即登录</button>
      </form>

      <div class="third-party">
        <p class="divider">其他登录方式</p>
        <div class="icons">
          <i class="fab fa-weixin"></i>
          <i class="fab fa-qq"></i>
          <i class="fab fa-weibo"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      handleSubmit() {
        // 模拟登录成功
        localStorage.setItem('isLoggedIn', true)
        this.$router.push('/home')
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
  background: url("../bg2.png");
  background-size: cover;
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
</style>