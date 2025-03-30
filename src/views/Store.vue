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
          <div class="cart-icon" @click="goToCart">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
        </div>
      </nav>

      <!-- 热门分类 -->
      <section id="hot" class="hot-categories" ref="hot">
        <h2>热门</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('儿童')">
            <div class="category-image">
              <img :src="kidsImage" alt="儿童" />
            </div>
            <h3>儿童</h3>
          </div>
          <div class="category-item" @click="goToProductList('床上用品')">
            <div class="category-image">
              <img :src="beddingImage" alt="床上用品" />
            </div>
            <h3>床上用品</h3>
          </div>
          <div class="category-item" @click="goToProductList('沙发')">
            <div class="category-image">
              <img :src="sofaImage" alt="沙发" />
            </div>
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
          <div class="collection-item" @click="goToProductList('必买清单')">
            <div class="category-image">
              <img :src="mustBuyImage" alt="必买清单" />
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('打工人必备')">
            <div class="category-image">
              <img :src="workEssentialsImage" alt="打工人必备" />
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('宅家游戏')">
            <div class="category-image">
              <img :src="homeGamesImage" alt="宅家游戏" />
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('学有所成')">
            <div class="category-image">
              <img :src="studyImage" alt="学有所成" />
            </div>
          </div>
        </div>
      </section>

      <!-- 储物和收纳 -->
      <section id="storage" class="category-section" ref="storage">
        <h2>储物和收纳</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('储物和收纳')">
            <div class="placeholder-image">储</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <!-- 其他分类区域 -->
      <section id="sofa" class="category-section" ref="sofa">
        <h2>沙发和扶手椅</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('沙发和扶手椅')">
            <div class="placeholder-image">沙</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="bed" class="category-section" ref="bed">
        <h2>床和床垫</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('床和床垫')">
            <div class="placeholder-image">床</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="textile" class="category-section" ref="textile">
        <h2>纺织品</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('纺织品')">
            <div class="placeholder-image">纺</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="dining" class="category-section" ref="dining">
        <h2>餐桌和餐椅</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('餐桌和餐椅')">
            <div class="placeholder-image">餐</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="kitchenware" class="category-section" ref="kitchenware">
        <h2>餐具和厨具</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('餐具和厨具')">
            <div class="placeholder-image">厨</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="cleaning" class="category-section" ref="cleaning">
        <h2>清洁及晾晒用品</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('清洁及晾晒用品')">
            <div class="placeholder-image">清</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="desk" class="category-section" ref="desk">
        <h2>书桌和书桌椅</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('书桌和书桌椅')">
            <div class="placeholder-image">书</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="bathroom" class="category-section" ref="bathroom">
        <h2>浴室家具和收纳</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('浴室家具和收纳')">
            <div class="placeholder-image">浴</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>

      <section id="outdoor" class="category-section" ref="outdoor">
        <h2>户外产品</h2>
        <div class="category-grid">
          <div class="category-item" @click="goToProductList('户外产品')">
            <div class="placeholder-image">户</div>
            <h3>查看全部</h3>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// 导入图片资源
import kidsImage from '@/assets/images/kids.jpg'
import beddingImage from '@/assets/images/bedding.jpg'
import sofaImage from '@/assets/images/sofa.jpg'
import mustBuyImage from '@/assets/images/must-buy.png'
import workEssentialsImage from '@/assets/images/work-essentials.png'
import homeGamesImage from '@/assets/images/home-games.png'
import studyImage from '@/assets/images/study.png'

export default {
  name: 'Store',
  data() {
    return {
      activeSection: 'hot',
      cartCount: 0,
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
      ],
      // 图片资源
      kidsImage,
      beddingImage,
      sofaImage,
      mustBuyImage,
      workEssentialsImage,
      homeGamesImage,
      studyImage
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
    },
    goToProductList(category) {
      this.$router.push({ 
        name: 'ProductList', 
        params: { category: encodeURIComponent(category) } 
      });
    },
    goToCart() {
      this.$router.push('/cart');
    },
    // 获取购物车中商品数量
    getCartCount() {
      const cartData = localStorage.getItem('cartItems');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        this.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      } else {
        this.cartCount = 0;
      }
    },
    // 监听购物车更新事件
    handleStorageEvent(event) {
      if (event.key === 'cartItems' || event.key === 'cartUpdated') {
        this.getCartCount();
      }
    }
  },
  mounted() {
    // 初始化时检查一次滚动位置
    this.handleScroll();
    // 获取购物车数量
    this.getCartCount();
    
    // 监听storage事件，当购物车数据更新时更新数量
    window.addEventListener('storage', this.handleStorageEvent);
  },
  beforeUnmount() {
    // 移除storage事件监听
    window.removeEventListener('storage', this.handleStorageEvent);
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
  scroll-padding-top: 80px;
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
  gap: 20px;
  font-size: 18px;
  align-items: center;
}

.cart-icon {
  position: relative;
  cursor: pointer;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff5000;
  color: white;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 10px;
  padding: 0 4px;
}

.category-grid, .collections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.category-item, .collection-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  aspect-ratio: 1 / 1;
}

.category-item:hover, .collection-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #bbb;
  background-color: #f0f0f0;
}

.category-item h3, .collection-item h3 {
  margin: 0;
  font-size: 14px;
  font-weight: normal;
  text-align: center;
  padding: 8px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
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

.category-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.category-item:hover .category-image img,
.collection-item:hover .category-image img {
  transform: scale(1.05);
}
</style>