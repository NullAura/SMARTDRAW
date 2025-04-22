<!-- src/views/ProductList.vue -->
<template>
  <div class="product-list-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="back-btn" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="category-title">{{ categoryName }}</div>
      <div class="nav-icons">
        <i class="fas fa-search"></i>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-options">
      <div 
        class="filter-item" 
        :class="{ active: activeFilter === 'price' }"
        @click="toggleFilter('price')"
      >
        <span>价格排序</span>
        <i class="fas" :class="getPriceIcon()"></i>
      </div>
      <div class="filter-item">
        <span>颜色</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="filter-item">
        <span>尺寸</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="filter-item">
        <span>筛选</span>
        <i class="fas fa-sliders-h"></i>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <ProductCard 
        v-for="product in filteredProducts" 
        :key="product.id" 
        :product="product"
        @click="goToProductDetail"
      />
    </div>
    
    <!-- 空状态 -->
    <EmptyState
      v-if="filteredProducts.length === 0"
      icon="search"
      title="未找到商品"
      description="没有符合条件的商品，请尝试其他筛选条件"
    >
      <template #action>
        <button class="btn btn-primary" @click="clearFilters">
          清除筛选条件
        </button>
      </template>
    </EmptyState>
  </div>
</template>

<script>
// 导入沙发图片
import sofa1Image from '@/assets/images/sofa1.png'
// 导入组件
import ProductCard from '../components/ui/ProductCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'

export default {
  name: 'ProductList',
  components: {
    ProductCard,
    EmptyState
  },
  data() {
    return {
      categoryName: '',
      activeFilter: '',
      priceOrder: 'none', // 'asc', 'desc', 'none'
      // 模拟商品数据
      products: [
        {
          id: '1',
          name: 'DUKTIG 杜克迪',
          description: '玩具厨房, 72x40x109 厘米',
          price: '699',
          priceDecimal: '00',
          tag: '热卖',
          subInfo: '满足孩子当小厨师的乐趣'
        },
        {
          id: '2',
          name: 'BYGGLEK 比格列克',
          description: '积木 201件套',
          price: '69',
          priceDecimal: '99',
          subInfo: '乐高联名，可另配积木盒'
        },
        {
          id: '3',
          name: 'KIVIK 奇维',
          description: '三人沙发, 布罗福尔斯 灰色',
          price: '3999',
          priceDecimal: '00',
          tag: '特惠',
          subInfo: '舒适耐用的宽敞沙发',
          category: '沙发',
          imageUrl: sofa1Image
        },
        {
          id: '4',
          name: 'GOSIG 古西格',
          description: '毛绒玩具, 金毛犬, 40 厘米',
          price: '99',
          priceDecimal: '00'
        },
        {
          id: '5',
          name: 'MAMMUT 玛莫特',
          description: '儿童椅, 室内/户外, 35 厘米',
          price: '89',
          priceDecimal: '99'
        },
        {
          id: '6',
          name: 'SUNDVIK 桑维',
          description: '儿童床, 140x70 厘米',
          price: '1499',
          priceDecimal: '00'
        }
      ]
    };
  },
  computed: {
    filteredProducts() {
      // 首先按类别筛选
      let result = this.products;
      
      if (this.categoryName && this.categoryName !== '全部') {
        result = this.products.filter(product => 
          product.category === this.categoryName || 
          product.name.includes(this.categoryName) || 
          product.description.includes(this.categoryName)
        );
      }
      
      // 然后按价格排序
      if (this.priceOrder === 'asc') {
        result = [...result].sort((a, b) => {
          const priceA = parseFloat(`${a.price}.${a.priceDecimal || '00'}`);
          const priceB = parseFloat(`${b.price}.${b.priceDecimal || '00'}`);
          return priceA - priceB;
        });
      } else if (this.priceOrder === 'desc') {
        result = [...result].sort((a, b) => {
          const priceA = parseFloat(`${a.price}.${a.priceDecimal || '00'}`);
          const priceB = parseFloat(`${b.price}.${b.priceDecimal || '00'}`);
          return priceB - priceA;
        });
      }
      
      return result;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    goToProductDetail(productId) {
      this.$router.push({
        name: 'ProductDetail',
        params: { id: productId }
      });
    },
    toggleFilter(filter) {
      if (filter === 'price') {
        if (this.activeFilter === 'price') {
          // 切换价格排序：无 -> 升序 -> 降序 -> 无
          if (this.priceOrder === 'none') {
            this.priceOrder = 'asc';
          } else if (this.priceOrder === 'asc') {
            this.priceOrder = 'desc';
          } else {
            this.priceOrder = 'none';
            this.activeFilter = '';
            return;
          }
        } else {
          this.activeFilter = 'price';
          this.priceOrder = 'asc';
        }
      } else {
        this.activeFilter = this.activeFilter === filter ? '' : filter;
      }
    },
    getPriceIcon() {
      if (this.activeFilter !== 'price') return 'fa-chevron-down';
      if (this.priceOrder === 'asc') return 'fa-arrow-up';
      if (this.priceOrder === 'desc') return 'fa-arrow-down';
      return 'fa-chevron-down';
    },
    clearFilters() {
      this.activeFilter = '';
      this.priceOrder = 'none';
    }
  },
  created() {
    // 解码URL参数中的分类名称
    if (this.$route.params.category) {
      this.categoryName = decodeURIComponent(this.$route.params.category);
    }
  }
};
</script>

<style scoped>
.product-list-container {
  background-color: var(--neutral-200);
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

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

.back-btn {
  font-size: var(--font-size-lg);
  cursor: pointer;
  width: 40px;
  color: var(--neutral-700);
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--brand-primary);
}

.category-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  flex-grow: 1;
  text-align: center;
  color: var(--neutral-800);
}

.nav-icons {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-lg);
  width: 40px;
  justify-content: flex-end;
  color: var(--neutral-700);
}

.filter-options {
  display: flex;
  background: var(--neutral-100);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid var(--neutral-300);
  scrollbar-width: none; /* Firefox */
}

.filter-options::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 100px;
  border: 1px solid var(--neutral-300);
  margin-right: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  color: var(--neutral-700);
}

.filter-item:hover {
  background-color: var(--neutral-200);
  border-color: var(--neutral-400);
}

.filter-item.active {
  background-color: var(--brand-accent);
  border-color: var(--brand-secondary);
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
    padding: 0 var(--spacing-lg);
  }
  
  .top-nav, .filter-options {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
  
  .filter-item {
    font-size: var(--font-size-md);
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}

@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 