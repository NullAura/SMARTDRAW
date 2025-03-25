<!-- src/views/Store.vue -->
<template>
  <div class="store-container">
    <!-- 左侧导航栏 -->
    <nav class="side-nav">
      <div class="nav-section">
        <div 
          v-for="(section, index) in sections" 
          :key="index"
          class="nav-item"
          :class="{ highlight: activeSection === section.id }"
          @click="scrollToSection(section.id)"
        >
          {{ section.title }}
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="main-content" ref="mainContent" @scroll="handleScroll">
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
      <section id="hot" class="hot-categories" ref="hot">
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
      <section id="collections" class="collections" ref="collections">
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

      <!-- 储物和收纳 -->
      <section id="storage" class="category-section" ref="storage">
        <h2>储物和收纳</h2>
        <div class="category-grid">
          <!-- 示例内容 -->
        </div>
      </section>

      <!-- 其他分类区域 -->
      <section id="sofa" class="category-section" ref="sofa">
        <h2>沙发和扶手椅</h2>
      </section>

      <section id="bed" class="category-section" ref="bed">
        <h2>床和床垫</h2>
      </section>

      <section id="textile" class="category-section" ref="textile">
        <h2>纺织品</h2>
      </section>

      <section id="dining" class="category-section" ref="dining">
        <h2>餐桌和餐椅</h2>
      </section>

      <section id="kitchenware" class="category-section" ref="kitchenware">
        <h2>餐具和厨具</h2>
      </section>

      <section id="cleaning" class="category-section" ref="cleaning">
        <h2>清洁及晾晒用品</h2>
      </section>

      <section id="desk" class="category-section" ref="desk">
        <h2>书桌和书桌椅</h2>
      </section>

      <section id="bathroom" class="category-section" ref="bathroom">
        <h2>浴室家具和收纳</h2>
      </section>

      <section id="outdoor" class="category-section" ref="outdoor">
        <h2>户外产品</h2>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Store',
  data() {
    return {
      activeSection: 'hot',
      sections: [
        { id: 'hot', title: '热门' },
        { id: 'collections', title: '主题合集' },
        { id: 'storage', title: '储物和收纳' },
        { id: 'sofa', title: '沙发和扶手椅' },
        { id: 'bed', title: '床和床垫' },
        { id: 'textile', title: '纺织品' },
        { id: 'dining', title: '餐桌和餐椅' },
        { id: 'kitchenware', title: '餐具和厨具' },
        { id: 'cleaning', title: '清洁及晾晒用品' },
        { id: 'desk', title: '书桌和书桌椅' },
        { id: 'bathroom', title: '浴室家具和收纳' },
        { id: 'outdoor', title: '户外产品' }
      ]
    }
  },
  methods: {
    handleScroll() {
      const mainContent = this.$refs.mainContent;
      const scrollTop = mainContent.scrollTop;
      
      // 获取所有区域的位置信息
      this.sections.forEach(section => {
        const element = this.$refs[section.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const offsetTop = rect.top - mainContent.getBoundingClientRect().top;
          
          // 当区域距离顶部小于100px时，将其设置为活动区域
          if (offsetTop <= 100 && offsetTop + rect.height > 100) {
            this.activeSection = section.id;
          }
        }
      });
    },
    scrollToSection(sectionId) {
      const element = this.$refs[sectionId];
      if (element) {
        this.$refs.mainContent.scrollTo({
          top: element.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  },
  mounted() {
    // 初始化时检查一次滚动位置
    this.handleScroll();
  }
}
</script>

<style scoped>
.store-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.side-nav {
  width: 70px;
  padding: 16px 4px;
  background: #fff;
  border-right: 1px solid #eee;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-nav .nav-item {
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 12px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
}

.side-nav .nav-item:hover {
  background-color: #f5f5f5;
}

.side-nav .nav-item.highlight {
  font-weight: bold;
  background-color: #f5f5f5;
  color: #0058a3;
  transform: scale(1.05);
}

.main-content {
  flex: 1;
  padding: 0 24px;
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* 为固定导航栏预留空间 */
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  margin: 0 -24px;
}

.nav-items {
  display: flex;
  gap: 32px;
}

.top-nav .nav-item {
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 24px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.category-item, .collection-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  background: #f9f9f9;
  padding: 12px;
}

.category-item:hover, .collection-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-item img, .collection-item img {
  width: 100%;
  height: 180px;
  object-fit: contain;
  border-radius: 4px;
  background: white;
}

.category-item h3, .collection-item h3 {
  margin: 12px 0 4px;
  font-size: 14px;
  font-weight: normal;
  text-align: center;
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

.category-section {
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  min-height: 300px;
}

.category-section:first-of-type {
  padding-top: 0;
}
</style>