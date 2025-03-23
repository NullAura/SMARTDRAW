<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <header class="header">
      <nav>
        <router-link to="/home">首页</router-link>
        <router-link to="/store">商店</router-link>
        <router-link to="/community">社区</router-link>
        <router-link to="/user">用户中心</router-link>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
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
}

.header {
  background-color: var(--primary-color);
  padding: 1rem;
}

.header nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.header a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.header a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style> 