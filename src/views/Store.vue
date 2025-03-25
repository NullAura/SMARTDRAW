<!-- src/views/Store.vue -->
<template>
  <div class="store-container">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-items">
        <div class="nav-item active">商品</div>
        <div class="nav-item">房间</div>
        <div class="nav-item">设计工具</div>
      </div>
      <div class="nav-icons">
        <i class="fas fa-search"></i>
        <i class="fas fa-shopping-cart"></i>
      </div>
    </nav>

    <!-- 热门分类 -->
    <section class="hot-categories">
      <h2>热门</h2>
      <div class="category-grid">
        <div class="category-item">
          <img src="@/assets/images/kids.jpg" alt="儿童">
          <h3>儿童</h3>
        </div>
        <div class="category-item">
          <img src="@/assets/images/bedding.jpg" alt="床上用品">
          <h3>床上用品</h3>
        </div>
        <div class="category-item">
          <img src="@/assets/images/sofa.jpg" alt="沙发">
          <h3>沙发</h3>
        </div>
      </div>
    </section>

    <!-- 主题合集 -->
    <section class="collections">
      <div class="section-header">
        <h2>主题合集</h2>
        <a href="#" class="view-all">全部</a>
      </div>
      <div class="collections-grid">
        <div class="collection-item">
          <img src="@/assets/images/must-buy.png" alt="必买清单">
          <h3>必买清单</h3>
        </div>
        <div class="collection-item">
          <img src="@/assets/images/work-essentials.png" alt="打工人必备">
          <h3>打工人必备</h3>
        </div>
        <div class="collection-item">
          <img src="@/assets/images/home-games.png" alt="宅家游戏">
          <h3>宅家游戏</h3>
        </div>
        <div class="collection-item">
          <img src="@/assets/images/study.png" alt="学有所成">
          <h3>学有所成</h3>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Store'
}
</script>

<style scoped>
.store-container {
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.nav-items {
  display: flex;
  gap: 32px;
}

.nav-item {
  font-size: 18px;
  cursor: pointer;
}

.nav-item.active {
  color: #0058a3;
  font-weight: bold;
}

.nav-icons {
  display: flex;
  gap: 24px;
  font-size: 20px;
}

.category-grid, .collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.category-item, .collection-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.category-item img, .collection-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.category-item h3, .collection-item h3 {
  margin: 8px 0;
  font-size: 16px;
  font-weight: normal;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
}

.view-all {
  color: #0058a3;
  text-decoration: none;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 32px 0 16px;
}
</style>