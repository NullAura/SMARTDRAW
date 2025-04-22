<template>
  <div 
    class="product-card" 
    :class="{ horizontal }"
    @click="onClick"
  >
    <div class="product-image">
      <img 
        v-if="product.imageUrl" 
        :src="product.imageUrl" 
        :alt="product.name" 
        class="product-img"
        loading="lazy"
      />
      <div v-else class="placeholder-image">
        {{ product.name ? product.name.charAt(0) : '商' }}
      </div>
      
      <Badge 
        v-if="product.tag" 
        class="product-tag"
        :type="getTagType(product.tag)"
      >
        {{ product.tag }}
      </Badge>
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description" v-if="product.description">{{ product.description }}</p>
      
      <Price 
        :price="product.price" 
        :decimal="product.priceDecimal || '00'"
        :original-price="product.originalPrice"
        :size="horizontal ? 'md' : 'sm'"
      />
      
      <p v-if="product.subInfo" class="product-subinfo">{{ product.subInfo }}</p>
    </div>
  </div>
</template>

<script>
import Badge from './Badge.vue'
import Price from './Price.vue'

export default {
  name: 'ProductCard',
  components: {
    Badge,
    Price
  },
  props: {
    product: {
      type: Object,
      required: true
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit('click', this.product.id)
    },
    getTagType(tag) {
      const tagMap = {
        '热卖': 'warning',
        '新品': 'primary',
        '特惠': 'danger',
        '促销': 'warning',
        '限量': 'secondary',
        '推荐': 'success'
      }
      return tagMap[tag] || 'default'
    }
  }
}
</script>

<style scoped>
.product-card {
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.product-card:active {
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  overflow: hidden;
}

.product-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.placeholder-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: var(--neutral-500);
  background: linear-gradient(135deg, var(--neutral-300), var(--neutral-200));
}

.product-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.product-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.product-name {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-800);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--neutral-600);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-subinfo {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-xs);
  color: var(--neutral-500);
}

/* 横向布局 */
.product-card.horizontal {
  flex-direction: row;
  height: auto;
}

.product-card.horizontal .product-image {
  width: 120px;
  height: 120px;
  padding-bottom: 0;
  flex-shrink: 0;
}

.product-card.horizontal .product-info {
  flex: 1;
  padding: var(--spacing-sm);
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-info {
    padding: var(--spacing-sm);
  }
  
  .product-name {
    font-size: var(--font-size-sm);
  }
}
</style> 