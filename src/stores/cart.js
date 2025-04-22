import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 从本地存储获取购物车数据
const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('读取购物车数据失败:', error);
    return [];
  }
};

// 保存购物车数据到本地存储
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(items));
    // 触发更新事件
    localStorage.setItem('cartUpdated', Date.now().toString());
  } catch (error) {
    console.error('保存购物车数据失败:', error);
  }
};

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const items = ref(getStoredCart());
  
  // 计算购物车是否为空
  const isEmpty = computed(() => items.value.length === 0);
  
  // 计算购物车商品总数量
  const totalQuantity = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  // 计算购物车商品总价
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      const price = parseFloat(`${item.price}.${item.priceDecimal || '00'}`);
      return total + (price * item.quantity);
    }, 0);
  });
  
  // 添加商品到购物车
  function addToCart(product, quantity = 1) {
    const existingItem = items.value.find(item => item.id === product.id);
    
    if (existingItem) {
      // 如果商品已存在，增加数量
      existingItem.quantity += quantity;
    } else {
      // 如果商品不存在，添加新商品
      items.value.push({
        id: product.id,
        name: product.name,
        description: product.description || product.shortDescription || '',
        price: product.price,
        priceDecimal: product.priceDecimal || '00',
        imageUrl: product.imageUrl || product.image || product.images?.[0] || '',
        quantity
      });
    }
    
    // 保存到本地存储
    saveCartToStorage(items.value);
    
    return true;
  }
  
  // 从购物车移除商品
  function removeFromCart(productId) {
    const index = items.value.findIndex(item => item.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
      saveCartToStorage(items.value);
      return true;
    }
    return false;
  }
  
  // 更新购物车商品数量
  function updateItemQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveCartToStorage(items.value);
      return true;
    }
    return false;
  }
  
  // 清空购物车
  function clearCart() {
    items.value = [];
    saveCartToStorage(items.value);
  }
  
  return {
    items,
    isEmpty,
    totalQuantity,
    totalPrice,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart
  };
}) 