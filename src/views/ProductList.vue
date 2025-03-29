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
      <div class="filter-item">
        <span>价格排序</span>
        <i class="fas fa-chevron-down"></i>
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
      <div v-for="(product, index) in filteredProducts" :key="index" class="product-card">
        <div class="product-image">
          <div class="placeholder-image">{{ product.name.charAt(0) }}</div>
          <div v-if="product.tag" class="product-tag">{{ product.tag }}</div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <p class="product-price">¥{{ product.price }}.<span class="price-decimal">{{ product.priceDecimal }}</span></p>
          <p v-if="product.subInfo" class="product-subinfo">{{ product.subInfo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductList',
  data() {
    return {
      categoryName: '',
      // 模拟商品数据
      products: [
        {
          name: 'DUKTIG 杜克迪',
          description: '玩具厨房, 72x40x109 厘米',
          price: '699',
          priceDecimal: '00',
          tag: '热卖',
          subInfo: '满足孩子当小厨师的乐趣'
        },
        {
          name: 'BYGGLEK 比格列克',
          description: '积木 201件套',
          price: '69',
          priceDecimal: '99',
          subInfo: '乐高联名，可另配积木盒'
        },
        {
          name: 'TROFAST 舒法特',
          description: '储物组合带盒, 99x44x52 厘米',
          price: '697',
          priceDecimal: '40',
          tag: '新品'
        },
        {
          name: 'GOSIG 古西格',
          description: '毛绒玩具, 金毛犬, 40 厘米',
          price: '99',
          priceDecimal: '00'
        },
        {
          name: 'MAMMUT 玛莫特',
          description: '儿童椅, 室内/户外, 35 厘米',
          price: '89',
          priceDecimal: '99'
        },
        {
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
      // 这里可以根据分类和筛选条件过滤商品
      // 目前先返回所有商品
      return this.products;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
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
  background-color: #f9f9f9;
  min-height: 100vh;
  padding-bottom: 20px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn {
  font-size: 18px;
  cursor: pointer;
  width: 40px;
}

.category-title {
  font-size: 18px;
  font-weight: bold;
  flex-grow: 1;
  text-align: center;
}

.nav-icons {
  display: flex;
  gap: 20px;
  font-size: 18px;
  width: 40px;
  justify-content: flex-end;
}

.filter-options {
  display: flex;
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #eee;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  margin-right: 8px;
  cursor: pointer;
  font-size: 14px;
}

.filter-item:hover {
  background-color: #f5f5f5;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 12px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-image {
  position: relative;
  width: 100%;
  height: 180px;
  background-color: #f5f5f5;
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

.product-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e41e3f;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 16px;
}

.product-description {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.product-price {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 16px;
}

.price-decimal {
  font-size: 12px;
}

.product-subinfo {
  color: #888;
  font-size: 13px;
}
</style> 