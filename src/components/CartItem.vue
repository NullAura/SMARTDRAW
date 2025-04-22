<template>
  <div class="cart-item">
    <div class="cart-item-image">
      <img :src="item.image" :alt="item.name" />
    </div>
    <div class="cart-item-content">
      <div class="cart-item-header">
        <h4 class="cart-item-name">{{ item.name }}</h4>
        <button 
          class="cart-item-remove" 
          @click="removeFromCart"
          aria-label="从购物车移除商品"
        >
          <svg-icon name="trash" size="18" color="#ff4757" />
        </button>
      </div>
      <div class="cart-item-price">¥{{ item.price }}</div>
      <div class="cart-item-footer">
        <div class="cart-item-quantity">
          <button 
            class="quantity-btn" 
            @click="decreaseQuantity"
            :disabled="item.quantity <= 1"
            aria-label="减少数量"
          >
            <svg-icon name="minus" size="16" />
          </button>
          <div class="quantity-value">{{ item.quantity }}</div>
          <button 
            class="quantity-btn" 
            @click="increaseQuantity"
            aria-label="增加数量"
          >
            <svg-icon name="plus" size="16" />
          </button>
        </div>
        <div class="cart-item-subtotal">
          小计: <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/stores/cart';
import SvgIcon from './SvgIcon.vue';

export default {
  name: 'CartItem',
  components: {
    SvgIcon
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const cartStore = useCartStore();

    const removeFromCart = () => {
      cartStore.removeItem(props.item.id);
    };

    const increaseQuantity = () => {
      cartStore.updateItemQuantity(props.item.id, props.item.quantity + 1);
    };

    const decreaseQuantity = () => {
      if (props.item.quantity > 1) {
        cartStore.updateItemQuantity(props.item.id, props.item.quantity - 1);
      }
    };

    return {
      removeFromCart,
      increaseQuantity,
      decreaseQuantity
    };
  }
};
</script>

<style scoped>
.cart-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.cart-item-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.cart-item-remove {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.cart-item-remove:hover {
  opacity: 1;
}

.cart-item-price {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 12px;
}

.cart-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity-value {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: #fff;
}

.cart-item-subtotal {
  font-size: 14px;
  color: #606266;
}

.cart-item-subtotal span {
  color: #f56c6c;
  font-weight: 600;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
  }
  
  .cart-item-image {
    width: 100%;
    height: 120px;
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .cart-item-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cart-item-quantity {
    margin-bottom: 12px;
  }
}
</style> 