<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <!-- 顶部导航栏（桌面端显示） -->
    <header class="top-header desktop-only">
      <div class="container">
        <div class="top-nav">
          <div class="logo">
            <router-link to="/home">
              <h1>智绘家居</h1>
            </router-link>
          </div>
          
          <div class="search-container desktop-only">
            <SearchBar @search="onSearch" />
          </div>
          
          <nav class="desktop-nav">
            <router-link to="/home" class="nav-link">创作</router-link>
            <router-link to="/store" class="nav-link">商城</router-link>
            <router-link to="/community" class="nav-link">社区</router-link>
            <router-link to="/user" class="nav-link">我的</router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 底部导航（移动端显示） -->
    <nav class="bottom-nav mobile-only">
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
    
    <!-- 移动端搜索按钮 -->
    <div class="mobile-search-button mobile-only" @click="showMobileSearch = true">
      <i class="fas fa-search"></i>
    </div>
    
    <!-- 移动端搜索弹窗 -->
    <div class="mobile-search-modal" v-if="showMobileSearch">
      <div class="modal-header">
        <div class="close-button" @click="showMobileSearch = false">
          <i class="fas fa-arrow-left"></i>
        </div>
        <SearchBar @search="onSearch" />
      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/ui/SearchBar.vue';

export default {
  name: 'MainLayout',
  components: {
    SearchBar
  },
  data() {
    return {
      showMobileSearch: false
    }
  },
  methods: {
    onSearch(keyword) {
      // 关闭移动端搜索框
      this.showMobileSearch = false;
      
      // 跳转到搜索结果页
      this.$router.push({
        path: '/products/search',
        query: { keyword }
      });
    }
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--neutral-100);
  max-width: 100vw;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
}

/* 顶部导航样式 */
.top-header {
  background-color: var(--neutral-100);
  box-shadow: var(--shadow-sm);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-fixed);
  width: 100%;
  height: 80px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  color: var(--brand-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: 1px;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 var(--spacing-xl);
}

.desktop-nav {
  display: flex;
  gap: var(--spacing-xl);
}

.nav-link {
  color: var(--neutral-800);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) 0;
  position: relative;
  transition: all var(--transition-normal);
  font-size: var(--font-size-md);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background-color: var(--brand-primary);
  transition: width var(--transition-normal);
}

.nav-link:hover, 
.nav-link.router-link-active {
  color: var(--brand-primary);
}

.nav-link.router-link-active::after {
  width: 100%;
}

/* 底部导航样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: var(--neutral-100);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: var(--shadow-md);
  z-index: var(--z-index-fixed);
  width: 100%;
  max-width: 100vw;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--neutral-500);
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) 0;
  transition: all var(--transition-fast);
  width: 25%;
}

.nav-item i {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.nav-item.router-link-active {
  color: var(--brand-primary);
}

/* 移动端搜索按钮 */
.mobile-search-button {
  position: fixed;
  right: var(--spacing-md);
  bottom: calc(50px + var(--spacing-md));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--brand-primary);
  color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  z-index: var(--z-index-fixed);
  transition: transform var(--transition-fast);
}

.mobile-search-button:active {
  transform: scale(0.95);
}

.mobile-search-button i {
  font-size: var(--font-size-lg);
}

/* 移动端搜索弹窗 */
.mobile-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--neutral-100);
  z-index: var(--z-index-modal);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--neutral-100);
  box-shadow: var(--shadow-sm);
  gap: var(--spacing-sm);
}

.close-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--neutral-700);
}

/* 响应式样式 */
@media (min-width: 769px) {
  .main-content {
    padding: 0;
    max-width: 100%;
    margin: 0;
    margin-top: 80px;
    position: relative;
    z-index: 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 60px;
  }
  
  .nav-item {
    font-size: var(--font-size-xs);
  }
}
</style> 