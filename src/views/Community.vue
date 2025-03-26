<!-- src/views/Community.vue -->
<template>
  <div class="community-container">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-items">
        <div class="nav-item active">推荐</div>
        <div class="nav-item">关注</div>
        <div class="nav-item">本地</div>
      </div>
      <div class="nav-icons">
        <i class="fas fa-search"></i>
        <i class="fas fa-plus"></i>
      </div>
    </nav>

    <!-- 瀑布流内容区 -->
    <div class="masonry-container">
      <div class="masonry-column">
        <!-- 示例卡片 -->
        <div class="post-card" v-for="i in 4" :key="'col1-'+i">
          <div class="card-image placeholder-bg-1"></div>
          <div class="card-content">
            <h3 class="card-title">打造温馨舒适的卧室空间，这些家具搭配太赞了！</h3>
            <div class="user-info">
              <div class="avatar-placeholder"></div>
              <span class="username">设计达人</span>
              <div class="interaction">
                <span><i class="far fa-heart"></i> 1.2k</span>
                <span><i class="far fa-comment"></i> 88</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="masonry-column">
        <!-- 示例卡片 -->
        <div class="post-card" v-for="i in 3" :key="'col2-'+i">
          <div class="card-image placeholder-bg-2"></div>
          <div class="card-content">
            <h3 class="card-title">小户型客厅这样布置，瞬间提升档次！</h3>
            <div class="user-info">
              <div class="avatar-placeholder"></div>
              <span class="username">家居顾问</span>
              <div class="interaction">
                <span><i class="far fa-heart"></i> 2.5k</span>
                <span><i class="far fa-comment"></i> 156</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="masonry-column">
        <!-- 示例卡片 -->
        <div class="post-card" v-for="i in 5" :key="'col3-'+i">
          <div class="card-image placeholder-bg-3"></div>
          <div class="card-content">
            <h3 class="card-title">宜家新品开箱，这些家具太实用了！</h3>
            <div class="user-info">
              <div class="avatar-placeholder"></div>
              <span class="username">生活家</span>
              <div class="interaction">
                <span><i class="far fa-heart"></i> 3.1k</span>
                <span><i class="far fa-comment"></i> 245</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Community'
}
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin: 0 -16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-items {
  display: flex;
  gap: 32px;
  margin-left: 20%;
}

.nav-item {
  font-size: 16px;
  cursor: pointer;
  color: #666;
}

.nav-item.active {
  color: #000;
  font-weight: 600;
}

.nav-icons {
  display: flex;
  gap: 24px;
  font-size: 20px;
  color: #333;
  margin-right: 20%;
}

.masonry-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 0 16px;
}

.masonry-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  position: relative;
  padding-bottom: 100%;
  overflow: hidden;
}

.placeholder-bg-1 { background-color: #f5e6e8; }
.placeholder-bg-2 { background-color: #e6f0f5; }
.placeholder-bg-3 { background-color: #e8f5e6; }

.card-content {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: normal;
  margin: 0 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.username {
  font-size: 12px;
  color: #666;
  flex: 1;
}

.interaction {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.interaction span {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .masonry-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nav-items {
    margin-left: 10%;
  }
  
  .nav-icons {
    margin-right: 10%;
  }
}

@media (max-width: 480px) {
  .masonry-container {
    grid-template-columns: 1fr;
  }
  
  .nav-items {
    margin-left: 5%;
  }
  
  .nav-icons {
    margin-right: 5%;
  }
}
</style>