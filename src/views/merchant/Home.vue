<template>
  <div class="home-page">
    <!-- 移动端功能选择栏 -->
    <div class="function-menu">
      <div class="function-item" @click="navigateTo('ai-tools')">
        <i class="el-icon-magic-stick"></i>
        <span>AI创作</span>
      </div>
      <div class="function-item" @click="navigateTo('products')">
        <i class="el-icon-goods"></i>
        <span>商品管理</span>
      </div>
      <div class="function-item" @click="navigateTo('community')">
        <i class="el-icon-chat-line-round"></i>
        <span>社区运营</span>
      </div>
      <div class="function-item" @click="navigateTo('cart')">
        <i class="el-icon-shopping-cart-full"></i>
        <span>购物车</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-area">
      <div class="banner">
        <h2>欢迎使用SMARTDRAW商家中心</h2>
        <p>选择以下功能开始使用</p>
      </div>
      
      <div class="card-container">
        <div class="card" @click="navigateTo('ai-tools')">
          <div class="card-icon">
            <i class="el-icon-magic-stick"></i>
          </div>
          <div class="card-content">
            <h3>AI创作中心</h3>
            <p>使用AI技术快速生成商品描述和图片</p>
          </div>
        </div>
        
        <div class="card" @click="navigateTo('products')">
          <div class="card-icon">
            <i class="el-icon-goods"></i>
          </div>
          <div class="card-content">
            <h3>商品管理</h3>
            <p>管理您的商品信息和库存</p>
          </div>
        </div>
        
        <div class="card" @click="navigateTo('community')">
          <div class="card-icon">
            <i class="el-icon-chat-line-round"></i>
          </div>
          <div class="card-content">
            <h3>社区运营</h3>
            <p>与用户互动，提升品牌影响力</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MerchantHome',
  methods: {
    navigateTo(path) {
      if (path === 'ai-tools') {
        this.$router.push('/merchant/ai-tools')
      } else if (path === 'products') {
        this.$router.push('/merchant/products')
      } else if (path === 'community') {
        this.$router.push('/community')
      } else if (path === 'cart') {
        this.$router.push('/cart')
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 70px;
  box-sizing: border-box;
}

/* 移动端功能选择栏 */
.function-menu {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  height: 60px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 0;
  flex: 1;
}

.function-item i {
  font-size: 20px;
  color: #3c2913;
  margin-bottom: 4px;
}

.function-item span {
  font-size: 12px;
  color: #666;
}

.function-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* 主内容区域 */
.content-area {
  margin-top: 20px;
}

.banner {
  background-color: #3c2913;
  color: #fff;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.banner h2 {
  margin: 0;
  font-size: 24px;
  margin-bottom: 10px;
}

.banner p {
  margin: 0;
  opacity: 0.8;
}

/* 卡片容器 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 20px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(60, 41, 19, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 28px;
  color: #3c2913;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #3c2913;
}

.card-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .home-page {
    padding: 15px;
    padding-bottom: 80px;
    padding-top: 15px;
    margin-top: 0;
  }
  
  .content-area {
    margin-top: 15px;
  }
  
  .banner {
    padding: 20px;
    margin-top: 0;
  }
  
  .banner h2 {
    font-size: 20px;
  }
  
  .card-container {
    grid-template-columns: 1fr;
    margin-top: 15px;
  }
  
  .card {
    margin-bottom: 15px;
  }
  
  .function-menu {
    display: flex;
  }
}
</style> 