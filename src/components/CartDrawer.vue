<template>
  <div class="cart-drawer-overlay" @click="closeDrawer"></div>
  <div class="cart-drawer">
    <div class="cart-header">
      <h2>购物车</h2>
      <button class="close-btn" @click="closeDrawer">
        <SvgIcon name="close" size="20" />
      </button>
    </div>
    
    <div v-if="cartStore.isEmpty" class="empty-cart">
      <SvgIcon name="cart" size="48" color="#ddd" />
      <p>购物车还是空的</p>
      <button class="continue-shopping" @click="closeDrawer">继续购物</button>
    </div>
    
    <template v-else>
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-info">
            <img :src="item.imageUrl" :alt="item.name" class="item-image" />
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <p class="item-price">¥{{ item.price }}</p>
            </div>
          </div>
          
          <div class="item-actions">
            <div class="quantity-control">
              <button 
                @click="decreaseQuantity(item)" 
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >
                <SvgIcon name="minus" size="14" />
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                @click="increaseQuantity(item)"
                class="quantity-btn"
              >
                <SvgIcon name="plus" size="14" />
              </button>
            </div>
            <button @click="removeItem(item)" class="remove-btn">
              <SvgIcon name="trash" size="16" color="#e53935" />
            </button>
          </div>
        </div>
      </div>
      
      <div class="cart-footer">
        <div class="cart-summary">
          <p>
            <span>总计（{{ cartStore.totalQuantity }}件商品）：</span>
            <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </p>
        </div>
        <button class="checkout-btn" @click="checkout">
          <span>结算</span>
          <SvgIcon name="arrow-right" size="16" />
        </button>
        <button class="clear-cart-btn" @click="clearCart">
          清空购物车
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import SvgIcon from './SvgIcon.vue';

export default defineComponent({
  name: 'CartDrawer',
  components: {
    SvgIcon
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter();
    const cartStore = useCartStore();
    
    const closeDrawer = () => {
      emit('close');
    };
    
    const increaseQuantity = (item) => {
      cartStore.updateItemQuantity(item.id, item.quantity + 1);
    };
    
    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        cartStore.updateItemQuantity(item.id, item.quantity - 1);
      }
    };
    
    const removeItem = (item) => {
      cartStore.removeFromCart(item.id);
    };
    
    const clearCart = () => {
      if (confirm('确定要清空购物车吗？')) {
        cartStore.clearCart();
      }
    };
    
    const checkout = () => {
      router.push('/checkout');
      closeDrawer();
    };
    
    return {
      cartStore,
      closeDrawer,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      checkout
    };
  }
});
</script>

<style scoped>
.cart-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.cart-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-info {
  display: flex;
  gap: 12px;
}

.item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-details h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.item-description {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.item-price {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #e53935;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
}

.quantity-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.quantity-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity {
  width: 32px;
  text-align: center;
  font-size: 14px;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.cart-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.cart-summary {
  margin-bottom: 16px;
}

.cart-summary p {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 14px;
}

.total-price {
  font-weight: 700;
  font-size: 18px;
  color: #e53935;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.clear-cart-btn {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 16px;
  height: 50%;
}

.empty-cart p {
  margin: 0;
  color: #999;
  font-size: 16px;
}

.continue-shopping {
  padding: 10px 20px;
  background-color: #0077cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .cart-drawer {
    max-width: none;
  }
}
</style> 