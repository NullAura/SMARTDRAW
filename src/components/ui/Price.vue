<template>
  <div class="price-component" :class="[size, { discounted: hasDiscount }]">
    <div class="current-price">
      <span class="price-symbol">¥</span>
      <span class="price-integer">{{ integerPart }}</span>
      <span class="price-decimal">.{{ decimalPart }}</span>
    </div>
    <div v-if="hasDiscount" class="original-price">
      <span>¥{{ originalPrice }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceComponent',
  props: {
    price: {
      type: [Number, String],
      required: true
    },
    decimal: {
      type: [Number, String],
      default: '00'
    },
    originalPrice: {
      type: [Number, String],
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    }
  },
  computed: {
    integerPart() {
      return typeof this.price === 'number' ? Math.floor(this.price) : this.price
    },
    decimalPart() {
      return this.decimal.toString().padStart(2, '0')
    },
    hasDiscount() {
      return this.originalPrice !== null
    }
  }
}
</script>

<style scoped>
.price-component {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.current-price {
  display: flex;
  align-items: baseline;
  color: var(--price-color);
  font-weight: var(--font-weight-semibold);
}

.price-symbol {
  font-size: 0.8em;
  margin-right: 1px;
}

.price-integer {
  font-size: 1.2em;
}

.price-decimal {
  font-size: 0.8em;
}

.original-price {
  color: var(--neutral-500);
  text-decoration: line-through;
  font-size: 0.8em;
}

/* 尺寸变体 */
.price-component.sm .price-integer {
  font-size: 1em;
}

.price-component.lg .price-integer {
  font-size: 1.5em;
}

.price-component.lg .price-symbol,
.price-component.lg .price-decimal {
  font-size: 0.9em;
}

/* 折扣动画 */
.price-component.discounted .current-price {
  position: relative;
}

@keyframes priceFlash {
  0% { color: var(--price-color); }
  50% { color: var(--state-warning); }
  100% { color: var(--price-color); }
}

.discounted .current-price {
  animation: priceFlash 3s infinite;
}
</style> 