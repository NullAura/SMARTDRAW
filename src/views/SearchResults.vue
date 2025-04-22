<template>
  <div class="search-results-container">
    <div class="search-header">
      <div class="back-button" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <SearchBar 
        :placeholder="`搜索: ${keyword}`" 
        @search="onSearch"
        class="search-bar"
      />
    </div>
    
    <div class="search-meta">
      <div class="search-summary" v-if="keyword">
        <span>搜索 "<strong>{{ keyword }}</strong>" 的结果 ({{ totalCount }})</span>
      </div>
    </div>
    
    <div class="filter-sort-bar">
      <div class="filter-btns">
        <div 
          v-for="(filter, index) in filters" 
          :key="index"
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </div>
      </div>
      
      <div class="sort-dropdown">
        <div class="sort-label" @click="toggleSortDropdown">
          {{ getCurrentSortLabel() }}
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="sort-options" v-if="showSortDropdown">
          <div 
            v-for="(option, index) in sortOptions" 
            :key="index"
            class="sort-option"
            :class="{ active: activeSort === option.value }"
            @click="setSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="results-container">
      <template v-if="loading">
        <div class="loading-container">
          <LoadingSpinner text="正在搜索..." />
        </div>
      </template>
      
      <template v-else-if="products.length === 0">
        <div class="empty-results">
          <i class="fas fa-search"></i>
          <h3>未找到相关商品</h3>
          <p>试试其他关键词，或者浏览我们的推荐商品</p>
          <button class="btn btn-primary" @click="goToRecommendations">
            查看推荐商品
          </button>
        </div>
      </template>
      
      <template v-else>
        <div class="products-grid">
          <ProductCard 
            v-for="product in products" 
            :key="product.id"
            :product="product"
            @click="goToProductDetail(product.id)"
          />
        </div>
        
        <div class="pagination" v-if="totalPages > 1">
          <div 
            class="pagination-btn prev"
            :class="{ disabled: currentPage <= 1 }"
            @click="prevPage"
          >
            <i class="fas fa-chevron-left"></i>
          </div>
          
          <div class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </div>
          
          <div 
            class="pagination-btn next"
            :class="{ disabled: currentPage >= totalPages }"
            @click="nextPage"
          >
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/ui/SearchBar.vue';
import ProductCard from '@/components/ui/ProductCard.vue';

// 模拟搜索API结果
const mockProducts = [
  {
    id: '1',
    name: '简约现代布艺沙发',
    description: '三人沙发',
    price: '2999',
    priceDecimal: '00',
    imageUrl: new URL('@/assets/images/sofa1.png', import.meta.url).href
  },
  {
    id: '2',
    name: '北欧风格实木床架',
    description: '1.8米双人床',
    price: '3599',
    priceDecimal: '00',
    imageUrl: new URL('@/assets/images/bedding.jpg', import.meta.url).href
  },
  {
    id: '3',
    name: 'KIVIK 希维克',
    description: '三人沙发',
    price: '3999',
    priceDecimal: '00',
    tag: '热卖',
    imageUrl: new URL('@/assets/images/sofa.jpg', import.meta.url).href
  },
  {
    id: '4',
    name: '现代简约餐桌椅组合',
    description: '一桌四椅',
    price: '1299',
    priceDecimal: '00',
    imageUrl: new URL('@/assets/images/kids.jpg', import.meta.url).href
  }
];

export default {
  name: 'SearchResults',
  components: {
    SearchBar,
    ProductCard
  },
  data() {
    return {
      keyword: '',
      products: [],
      loading: true,
      activeFilter: 'all',
      activeSort: 'default',
      showSortDropdown: false,
      currentPage: 1,
      pageSize: 12,
      totalCount: 0,
      filters: [
        { label: '全部', value: 'all' },
        { label: '沙发', value: 'sofa' },
        { label: '桌椅', value: 'table' },
        { label: '床品', value: 'bedding' },
        { label: '收纳', value: 'storage' }
      ],
      sortOptions: [
        { label: '默认排序', value: 'default' },
        { label: '价格从低到高', value: 'price_asc' },
        { label: '价格从高到低', value: 'price_desc' },
        { label: '销量优先', value: 'sales' },
        { label: '最新上架', value: 'newest' }
      ]
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.pageSize);
    }
  },
  created() {
    // 从URL获取搜索参数
    this.keyword = this.$route.query.keyword || '';
    this.activeFilter = this.$route.query.filter || 'all';
    this.activeSort = this.$route.query.sort || 'default';
    this.currentPage = parseInt(this.$route.query.page) || 1;
    
    // 搜索商品
    this.searchProducts();
  },
  methods: {
    onSearch(keyword) {
      this.keyword = keyword;
      this.currentPage = 1;
      this.updateRouteQuery();
      this.searchProducts();
    },
    
    searchProducts() {
      this.loading = true;
      
      // 实际项目中应调用API
      // 模拟API请求延迟
      setTimeout(() => {
        // 根据关键词过滤商品
        let results = [...mockProducts];
        
        if (this.keyword) {
          results = results.filter(p => 
            p.name.toLowerCase().includes(this.keyword.toLowerCase()) ||
            p.description.toLowerCase().includes(this.keyword.toLowerCase())
          );
        }
        
        // 应用分类过滤
        if (this.activeFilter !== 'all') {
          // 简化处理，实际项目中应有更复杂的分类逻辑
          results = results.filter(p => {
            if (this.activeFilter === 'sofa') {
              return p.name.includes('沙发');
            } else if (this.activeFilter === 'table') {
              return p.name.includes('桌') || p.name.includes('椅');
            } else if (this.activeFilter === 'bedding') {
              return p.name.includes('床');
            } else if (this.activeFilter === 'storage') {
              return p.name.includes('收纳') || p.name.includes('柜');
            }
            return true;
          });
        }
        
        // 应用排序
        if (this.activeSort !== 'default') {
          results.sort((a, b) => {
            if (this.activeSort === 'price_asc') {
              return parseInt(a.price) - parseInt(b.price);
            } else if (this.activeSort === 'price_desc') {
              return parseInt(b.price) - parseInt(a.price);
            }
            // 其他排序逻辑在实际项目中实现
            return 0;
          });
        }
        
        this.totalCount = results.length;
        
        // 分页处理
        const startIndex = (this.currentPage - 1) * this.pageSize;
        this.products = results.slice(startIndex, startIndex + this.pageSize);
        
        this.loading = false;
      }, 800);
    },
    
    setFilter(filter) {
      this.activeFilter = filter;
      this.currentPage = 1;
      this.updateRouteQuery();
      this.searchProducts();
    },
    
    setSort(sort) {
      this.activeSort = sort;
      this.showSortDropdown = false;
      this.updateRouteQuery();
      this.searchProducts();
    },
    
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown;
    },
    
    getCurrentSortLabel() {
      const option = this.sortOptions.find(opt => opt.value === this.activeSort);
      return option ? option.label : '默认排序';
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        this.updateRouteQuery();
        this.searchProducts();
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        this.updateRouteQuery();
        this.searchProducts();
      }
    },
    
    updateRouteQuery() {
      // 更新URL，但不重新加载页面
      this.$router.replace({
        query: {
          keyword: this.keyword,
          filter: this.activeFilter,
          sort: this.activeSort,
          page: this.currentPage
        }
      });
    },
    
    goToProductDetail(productId) {
      this.$router.push({
        name: 'ProductDetail',
        params: { id: productId }
      });
    },
    
    goToRecommendations() {
      this.$router.push({ path: '/store' });
    },

    closeDropdowns(event) {
      // 如果点击的不是排序下拉框内的元素，则关闭下拉框
      if (this.showSortDropdown && !event.target.closest('.sort-dropdown')) {
        this.showSortDropdown = false;
      }
    }
  },
  beforeUnmount() {
    // 确保在组件销毁时关闭下拉框
    window.removeEventListener('click', this.closeDropdowns);
  },
  mounted() {
    // 点击页面其他地方关闭下拉框
    window.addEventListener('click', this.closeDropdowns);
  }
}
</script>

<style scoped>
.search-results-container {
  min-height: 100vh;
  background-color: var(--neutral-200);
  padding-bottom: var(--spacing-xl);
}

.search-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background-color: var(--neutral-100);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.back-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--neutral-700);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.back-button:hover {
  background-color: var(--neutral-200);
}

.search-bar {
  flex: 1;
}

.search-meta {
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
}

.search-summary {
  font-size: var(--font-size-sm);
  color: var(--neutral-700);
}

.filter-sort-bar {
  background-color: var(--neutral-100);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--neutral-300);
  border-bottom: 1px solid var(--neutral-300);
  position: sticky;
  top: 56px; /* 搜索栏高度 */
  z-index: var(--z-index-sticky);
}

.filter-btns {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  gap: var(--spacing-sm);
}

.filter-btns::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.filter-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  background-color: var(--neutral-200);
  color: var(--neutral-700);
}

.filter-btn.active {
  background-color: var(--brand-primary);
  color: var(--neutral-100);
}

.sort-dropdown {
  position: relative;
  min-width: 120px;
}

.sort-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border: 1px solid var(--neutral-300);
  transition: all var(--transition-fast);
}

.sort-label:hover {
  border-color: var(--brand-primary);
}

.sort-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  width: 150px;
  z-index: var(--z-index-dropdown);
  overflow: hidden;
}

.sort-option {
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
}

.sort-option:hover, .sort-option.active {
  background-color: var(--neutral-200);
}

.sort-option.active {
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

.results-container {
  padding: var(--spacing-md);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  text-align: center;
}

.empty-results i {
  font-size: 48px;
  color: var(--neutral-400);
  margin-bottom: var(--spacing-md);
}

.empty-results h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--neutral-800);
}

.empty-results p {
  color: var(--neutral-600);
  margin-bottom: var(--spacing-lg);
  max-width: 300px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.pagination-btn:not(.disabled):hover {
  background-color: var(--brand-primary);
  color: var(--neutral-100);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--neutral-700);
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 