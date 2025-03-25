<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <main class="main-content">
      <router-view />
    </main>
    
    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item">
        <i class="fas fa-home"></i>
        <span>创作</span>
      </router-link>
      <router-link to="/store" class="nav-item">
        <i class="fas fa-shopping-bag"></i>
        <span>商城</span>
      </router-link>
      <router-link to="/community" class="nav-item">
        <i class="fas fa-users"></i>
        <span>社区</span>
      </router-link>
      <router-link to="/user" class="nav-item">
        <i class="fas fa-user"></i>
        <span>我</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fb;
  max-width: 100vw;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  padding-bottom: 60px; /* 为底部导航留出空间 */
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  width: 100%;
  max-width: 100vw;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #909399;
  font-size: 11px;
  padding: 4px 0;
  transition: all 0.3s;
  width: 25%;
}

.nav-item i {
  font-size: 18px;
  margin-bottom: 2px;
}

.nav-item.router-link-active {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .bottom-nav {
    height: 50px;
  }
  
  .nav-item {
    font-size: 11px;
  }
  
  .nav-item i {
    font-size: 18px;
  }
}
</style> 