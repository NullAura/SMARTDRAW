<template>
  <div class="price-component" :style="style">
    <div v-if="isEditing" class="edit-mode">
      <div class="price-input">
        <span class="currency">¥</span>
        <input type="number" v-model="localPrice" @blur="finishEdit">
      </div>
      <div class="original-price" v-if="showOriginal">
        <span>原价：</span>
        <input type="number" v-model="localOriginalPrice" @blur="finishEdit">
      </div>
    </div>
    <div v-else class="display-mode" @dblclick="startEdit">
      <div class="current-price">
        <span class="currency">¥</span>
        <span class="amount">{{ formattedPrice }}</span>
      </div>
      <div class="original-price" v-if="showOriginal">
        <span>原价：</span>
        <span class="amount">{{ formattedOriginalPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceComponent',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isEditing: false,
      localPrice: this.data.price || 0,
      localOriginalPrice: this.data.originalPrice || 0
    }
  },
  computed: {
    price() {
      return this.data.price || 0
    },
    originalPrice() {
      return this.data.originalPrice || 0
    },
    showOriginal() {
      return this.data.showOriginal || false
    },
    formattedPrice() {
      return this.price.toFixed(2)
    },
    formattedOriginalPrice() {
      return this.originalPrice.toFixed(2)
    },
    style() {
      return {
        fontSize: `${this.data.fontSize || 20}px`,
        color: this.data.color || '#f56c6c',
        textAlign: this.data.align || 'left'
      }
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true
      this.localPrice = this.price
      this.localOriginalPrice = this.originalPrice
    },
    finishEdit() {
      this.isEditing = false
      this.$emit('update:data', {
        ...this.data,
        price: Number(this.localPrice),
        originalPrice: Number(this.localOriginalPrice)
      })
    }
  }
}
</script>

<style scoped>
.price-component {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.edit-mode,
.display-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-input,
.current-price {
  display: flex;
  align-items: center;
  gap: 5px;
}

.currency {
  font-size: 0.8em;
}

.amount {
  font-weight: bold;
}

input[type="number"] {
  width: 100px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.original-price {
  font-size: 0.8em;
  color: #909399;
  text-decoration: line-through;
}

.original-price input {
  width: 80px;
}
</style> 