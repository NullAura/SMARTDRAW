<!-- src/views/Store.vue -->
<template>
  <div class="store-container">
    <!-- 左侧导航栏 -->
    <nav class="side-nav" :class="{ 'show-side-nav': showSideNav }">
      <div class="nav-section">
        <div 
          v-for="(section, index) in sections" 
          :key="index"
          class="nav-item"
          :class="{ active: activeSection === section.id }"
          @click="scrollToSection(section.id)"
        >
          {{ section.title }}
        </div>
      </div>
    </nav>

    <!-- 移动端遮罩 -->
    <div class="mobile-mask" v-if="showSideNav" @click="showSideNav = false"></div>

    <!-- 主要内容区域 -->
    <div class="main-content" ref="mainContent" @scroll="handleScroll">
      <!-- 顶部导航栏 -->
      <nav class="top-nav">
        <div class="nav-items">
          <!-- 移动端汉堡菜单按钮 -->
          <div class="hamburger-menu" @click="showSideNav = !showSideNav">
            <i class="fas fa-bars"></i>
          </div>
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
      <section id="hot" class="hot-categories section-container" ref="hot">
        <h2 class="section-title">热门</h2>
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
      <section id="collections" class="collections section-container" ref="collections">
        <div class="section-header">
          <h2 class="section-title">主题合集</h2>
          <a href="#" class="view-all">全部</a>
        </div>
        <div class="collections-grid">
          <div class="collection-item" @click="goToProductList('必买清单')">
            <div class="category-image">
              <img :src="mustBuyImage" alt="必买清单" />
              <div class="collection-overlay">
                <span>必买清单</span>
              </div>
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('打工人必备')">
            <div class="category-image">
              <img :src="workEssentialsImage" alt="打工人必备" />
              <div class="collection-overlay">
                <span>打工人必备</span>
              </div>
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('宅家游戏')">
            <div class="category-image">
              <img :src="homeGamesImage" alt="宅家游戏" />
              <div class="collection-overlay">
                <span>宅家游戏</span>
              </div>
            </div>
          </div>
          <div class="collection-item" @click="goToProductList('学有所成')">
            <div class="category-image">
              <img :src="studyImage" alt="学有所成" />
              <div class="collection-overlay">
                <span>学有所成</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 商品分类部分 -->
      <div class="categories-container">
        <!-- 储物和收纳 -->
        <section id="storage" class="category-section section-container" ref="storage">
          <h2 class="section-title">储物和收纳</h2>
          <div class="category-grid">
            <div class="category-item" @click="goToProductList('储物和收纳')">
              <div class="placeholder-image">储</div>
              <h3>查看全部</h3>
            </div>
          </div>
        </section>

        <!-- 沙发分类 -->
        <section id="sofa" class="category-section section-container" ref="sofa">
          <h2 class="section-title">沙发和扶手椅</h2>
          <div class="products-preview">
            <div class="product-preview-item" @click="goToProductList('沙发')">
              <div class="category-image">
                <img :src="sofaImage" alt="沙发" />
              </div>
              <h3>查看全部</h3>
            </div>
            <ProductCard 
              :product="{
                id: '3',
                name: 'KIVIK 希维克',
                description: '三人沙发',
                price: '3999',
                priceDecimal: '00',
                tag: '热卖',
                imageUrl: sofa1Image
              }"
              @click="goToProductDetail"
            />
          </div>
        </section>

        <!-- 其他分类 -->
        <template v-for="(section, index) in otherSections" :key="index">
          <section 
            :id="section.id" 
            class="category-section section-container" 
            :ref="section.id"
          >
            <h2 class="section-title">{{ section.title }}</h2>
            <div class="category-grid">
              <div class="category-item" @click="goToProductList(section.title)">
                <div class="placeholder-image">{{ section.title.charAt(0) }}</div>
                <h3>查看全部</h3>
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// 导入图片资源
import kidsImage from '@/assets/images/kids.jpg'
import beddingImage from '@/assets/images/bedding.jpg'
import sofaImage from '@/assets/images/sofa.jpg'
import sofa1Image from '@/assets/images/sofa1.png'
import mustBuyImage from '@/assets/images/must-buy.png'
import workEssentialsImage from '@/assets/images/work-essentials.png'
import homeGamesImage from '@/assets/images/home-games.png'
import studyImage from '@/assets/images/study.png'

// 导入组件
import ProductCard from '../components/ui/ProductCard.vue'

export default {
  name: 'Store',
  components: {
    ProductCard
  },
  data() {
    return {
      activeSection: 'hot',
      cartCount: 0,
      showSideNav: false, // 控制侧边栏显示状态
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
      // 其他分类
      otherSections: [
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
      sofa1Image,
      mustBuyImage,
      workEssentialsImage,
      homeGamesImage,
      studyImage
    }
  },
  mounted() {
    // 加载购物车数量
    this.loadCartCount();
    
    // 初始化滚动监听
    this.handleScroll();
    
    // 监听窗口大小变化，自动调整侧边栏显示
    window.addEventListener('resize', this.checkScreenSize);
    this.checkScreenSize();
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    // 检查屏幕尺寸
    checkScreenSize() {
      this.showSideNav = window.innerWidth >= 768;
    },
    handleScroll() {
      const mainContent = this.$refs.mainContent;
      const scrollTop = mainContent.scrollTop;
      
      // 获取所有区域的位置信息
      const positions = this.sections.map(section => {
        const sectionRef = this.$refs[section.id];
        if (sectionRef) {
          // 在Vue 3中，:ref会返回一个数组，需要获取第一个元素
          const element = Array.isArray(sectionRef) ? sectionRef[0] : sectionRef;
          if (element && typeof element.getBoundingClientRect === 'function') {
            return {
              id: section.id,
              position: element.getBoundingClientRect().top + scrollTop - 100
            };
          }
        }
        return { id: section.id, position: 0 };
      });
      
      // 确定当前位置所属区域
      for (let i = positions.length - 1; i >= 0; i--) {
        if (scrollTop >= positions[i].position) {
          this.activeSection = positions[i].id;
          break;
        }
      }
    },
    
    scrollToSection(sectionId) {
      const targetRef = this.$refs[sectionId];
      if (targetRef) {
        const target = Array.isArray(targetRef) ? targetRef[0] : targetRef;
        if (target && typeof target.getBoundingClientRect === 'function') {
          this.$refs.mainContent.scrollTo({
            top: target.getBoundingClientRect().top + this.$refs.mainContent.scrollTop - 80,
            behavior: 'smooth'
          });
        }
      }
    },
    
    goToProductList(category) {
      this.$router.push({
        name: 'ProductList',
        params: { category: encodeURIComponent(category) }
      });
    },
    
    goToProductDetail(productId) {
      this.$router.push({
        name: 'ProductDetail',
        params: { id: productId }
      });
    },
    
    goToCart() {
      this.$router.push({ name: 'Cart' });
    },
    
    loadCartCount() {
      // 从localStorage获取购物车数据
      try {
        const cartData = localStorage.getItem('cartItems');
        if (cartData) {
          const cart = JSON.parse(cartData);
          if (Array.isArray(cart)) {
            this.cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
          }
        }
      } catch (error) {
        console.error('加载购物车数据失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.store-container {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
  background-color: var(--neutral-200);
}

/* 左侧导航栏 */
.side-nav {
  width: 100px;
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--neutral-100);
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
  z-index: var(--z-index-sticky);
  transition: transform 0.3s ease;
}

.nav-section {
  padding: var(--spacing-sm) 0;
}

.nav-item {
  padding: var(--spacing-md) var(--spacing-sm);
  text-align: center;
  cursor: pointer;
  position: relative;
  font-size: var(--font-size-sm);
  color: var(--neutral-700);
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: var(--brand-primary);
  background-color: var(--neutral-200);
}

.nav-item.active {
  color: var(--brand-primary);
  background-color: var(--neutral-200);
  font-weight: var(--font-weight-medium);
  border-left: 3px solid var(--brand-primary);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding-bottom: var(--spacing-xl);
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--neutral-100);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  box-shadow: var(--shadow-sm);
}

.nav-items {
  display: flex;
  gap: var(--spacing-lg);
}

.nav-item {
  padding: var(--spacing-xs) 0;
  cursor: pointer;
  position: relative;
  font-weight: var(--font-weight-medium);
  color: var(--neutral-700);
}

.nav-item.active {
  color: var(--brand-primary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background-color: var(--brand-primary);
  border-radius: 2px;
}

.nav-icons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--neutral-700);
  font-size: var(--font-size-lg);
}

.cart-icon {
  position: relative;
  cursor: pointer;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--price-color);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 公共部分 */
.section-container {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-800);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.view-all {
  font-size: var(--font-size-sm);
  color: var(--brand-secondary);
  text-decoration: none;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.category-item {
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.category-image {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
}

.category-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.category-item:hover .category-image img {
  transform: scale(1.05);
}

.category-item h3 {
  padding: var(--spacing-sm);
  margin: 0;
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-800);
  border-top: 1px solid var(--neutral-300);
}

/* 主题合集 */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.collection-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.collection-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.collection-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-weight: var(--font-weight-medium);
}

/* 商品预览 */
.products-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.product-preview-item {
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.product-preview-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.product-preview-item h3 {
  padding: var(--spacing-sm);
  margin: 0;
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-800);
  border-top: 1px solid var(--neutral-300);
}

/* 占位图像 */
.placeholder-image {
  background: linear-gradient(135deg, var(--neutral-300), var(--neutral-200));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-600);
  font-size: 36px;
  font-weight: var(--font-weight-light);
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
}

.placeholder-image::before {
  position: absolute;
  content: attr(data-content);
}

/* 左侧导航栏 */
.side-nav {
  width: 100px;
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--neutral-100);
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
  z-index: var(--z-index-sticky);
  transition: transform 0.3s ease;
}

/* 汉堡菜单按钮 */
.hamburger-menu {
  display: none;
  cursor: pointer;
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-md);
}

/* 移动端遮罩 */
.mobile-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-index-sticky) - 1);
}

/* 响应式调整 */
@media (min-width: 768px) {
  .side-nav {
    display: block;
  }
  
  .main-content {
    margin-left: 100px;
  }
  
  .section-container {
    padding: var(--spacing-lg);
  }
  
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .collections-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-preview {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .hamburger-menu {
    display: block;
  }
  
  .side-nav {
    position: fixed;
    transform: translateX(-100%);
    box-shadow: var(--shadow-md);
  }
  
  .side-nav.show-side-nav {
    transform: translateX(0);
  }
  
  .mobile-mask {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-preview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>