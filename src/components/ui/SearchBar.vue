<template>
  <div class="search-container">
    <input 
      type="text" 
      v-model="keyword" 
      @input="handleInput"
      @keyup.enter="search"
      placeholder="搜索商品、品牌或分类"
      class="search-input"
    />
    <div class="search-icon" @click="search">
      <i class="fas fa-search"></i>
    </div>
    <div v-if="suggestions.length > 0" class="suggestions">
      <div 
        v-for="(item, index) in suggestions" 
        :key="index"
        class="suggestion-item touch-feedback"
        @click="selectSuggestion(item)"
      >
        <span v-html="highlightKeyword(item)"></span>
      </div>
    </div>
  </div>
</template>

<script>
// 模拟搜索建议API，后期可替换为真实API调用
const mockSuggestions = [
  '沙发', '沙发套', '沙发垫', '沙发床', '餐桌', '餐椅', 
  '床垫', '床头柜', '书桌', '书架', '衣柜', '茶几'
];

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: '搜索商品、品牌或分类'
    },
    delay: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      keyword: '',
      suggestions: [],
      timer: null
    }
  },
  methods: {
    handleInput() {
      // 防抖处理，避免频繁请求
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.fetchSuggestions();
      }, this.delay);
    },
    
    fetchSuggestions() {
      // 模拟API调用，获取搜索建议
      if (this.keyword && this.keyword.length > 1) {
        // 实际项目中这里应该调用API
        this.suggestions = mockSuggestions.filter(
          item => item.toLowerCase().includes(this.keyword.toLowerCase())
        ).slice(0, 6); // 限制最多显示6个建议
      } else {
        this.suggestions = [];
      }
    },
    
    selectSuggestion(item) {
      this.keyword = item;
      this.suggestions = [];
      this.search();
    },
    
    search() {
      if (!this.keyword.trim()) return;
      
      this.$emit('search', this.keyword);
      this.suggestions = [];
      
      // 实际项目中，这里可以直接跳转到搜索结果页
      this.$router.push({
        path: '/products/search',
        query: { keyword: this.keyword }
      });
    },
    
    highlightKeyword(text) {
      if (!this.keyword) return text;
      const regex = new RegExp(`(${this.escapeRegExp(this.keyword)})`, 'gi');
      return text.replace(regex, '<strong class="highlight">$1</strong>');
    },
    
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: calc(var(--spacing-md) * 2 + 20px);
  border-radius: var(--radius-md);
  border: 1px solid var(--neutral-300);
  background-color: var(--neutral-100);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb, 60, 41, 19), 0.1);
  outline: none;
}

.search-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--neutral-600);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.search-icon:hover {
  color: var(--brand-primary);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--neutral-100);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: var(--z-index-dropdown);
  margin-top: 2px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.suggestion-item:hover {
  background-color: var(--neutral-200);
}

.highlight {
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .search-input {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    padding-right: calc(var(--spacing-sm) * 2 + 20px);
  }
  
  .search-icon {
    right: var(--spacing-sm);
  }
}
</style> 