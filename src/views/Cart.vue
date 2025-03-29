<!-- src/views/Cart.vue -->
<template>
  <div class="cart-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="back-btn" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="nav-title">购物车</div>
      <div class="nav-icons">
        <i class="fas fa-ellipsis-v"></i>
      </div>
    </div>

    <!-- 购物车列表 -->
    <div class="cart-list">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-image">
          <div class="placeholder-empty-cart">
            <!-- 替代真实图片的空购物车图形 -->
            <div class="cart-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="empty-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
        <p>您的购物车空空的哦~</p>
        <p class="empty-tips">快去添加心仪的宝贝吧</p>
        <button class="go-shopping-btn" @click="goToStore">去逛逛</button>
      </div>

      <template v-else>
        <!-- 购物车店铺分组 -->
        <div class="shop-group">
          <div class="shop-header">
            <div class="shop-select">
              <input type="checkbox" :checked="shopSelected" @change="toggleShopSelect">
              <div class="shop-info">
                <i class="fas fa-store"></i>
                <span class="shop-name">智能家居旗舰店</span>
              </div>
            </div>
            <div class="shop-actions">
              <span>领券</span>
            </div>
          </div>

          <!-- 购物车商品列表 -->
          <div class="cart-items">
            <div 
              v-for="(item, index) in cartItems" 
              :key="item.id" 
              class="cart-item-wrapper"
            >
              <div 
                class="cart-item"
                :style="{ transform: `translateX(${item.offset}px)` }"
                @touchstart="touchStart($event, index)"
                @touchmove="touchMove($event, index)"
                @touchend="touchEnd(index)"
              >
                <div class="item-select">
                  <input type="checkbox" v-model="item.selected" @change="updateTotal">
                </div>
                <div class="item-image" @click="goToProductDetail(item.id)">
                  <div class="placeholder-image">{{ item.name.charAt(0) }}</div>
                </div>
                <div class="item-info">
                  <div class="item-name" @click="goToProductDetail(item.id)">{{ item.name }} {{ item.description }}</div>
                  <div class="item-attrs">
                    <span class="attr-tag">{{ item.color || '默认' }}</span>
                  </div>
                  <div class="item-price-row">
                    <div class="item-price">
                      <span class="price-symbol">¥</span>
                      <span class="price-value">{{ item.price }}</span>
                      <span class="price-decimal">.{{ item.priceDecimal }}</span>
                    </div>
                    <div class="item-quantity">
                      <button class="quantity-btn minus" @click="decreaseQuantity(item)">-</button>
                      <input type="number" v-model="item.quantity" @change="updateTotal" min="1">
                      <button class="quantity-btn plus" @click="increaseQuantity(item)">+</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 左滑显示的操作按钮 -->
              <div class="item-actions">
                <div class="action-btn find-similar" @click.stop="findSimilar(item)">
                  <i class="fas fa-search"></i>
                  <span>找相似</span>
                </div>
                <div class="action-btn delete" @click.stop="directDeleteItem(index)">
                  <i class="fas fa-trash-alt"></i>
                  <span>删除</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 猜你喜欢 -->
        <div class="recommendations">
          <div class="section-title">猜你喜欢</div>
          <div class="recommendations-grid">
            <div 
              v-for="(product, index) in recommendedProducts" 
              :key="index"
              class="recommended-product"
              @click="goToProductDetail(product.id)"
            >
              <div class="product-image">
                <div class="placeholder-image">{{ product.name.charAt(0) }}</div>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">
                  <span class="price-symbol">¥</span>
                  <span>{{ product.price }}.{{ product.priceDecimal }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部结算栏 -->
    <div v-if="cartItems.length > 0" class="bottom-bar">
      <div class="select-all">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll">
        <span>全选</span>
      </div>
      <div class="total-section">
        <div class="total-price">
          <span>合计：</span>
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="discount-info">已优惠：¥{{ discount.toFixed(2) }}</div>
      </div>
      <div class="checkout-btn" @click="checkout">
        结算({{ totalItems }})
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cart',
  data() {
    return {
      cartItems: [],
      recommendedProducts: [
        {
          id: '3',
          name: 'TROFAST 舒法特',
          description: '储物组合带盒',
          price: '697',
          priceDecimal: '40'
        },
        {
          id: '4',
          name: 'GOSIG 古西格',
          description: '毛绒玩具',
          price: '99',
          priceDecimal: '00'
        },
        {
          id: '5',
          name: 'MAMMUT 玛莫特',
          description: '儿童椅',
          price: '89',
          priceDecimal: '99'
        },
        {
          id: '6',
          name: 'SUNDVIK 桑维',
          description: '儿童床',
          price: '1499',
          priceDecimal: '00'
        }
      ],
      totalPrice: 0,
      discount: 0,
      touchStartX: 0,
      touchStartY: 0,
      currentIndex: -1,
      swipeThreshold: 80 // 触发左滑操作的阈值
    };
  },
  computed: {
    allSelected() {
      return this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    },
    shopSelected() {
      return this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    },
    totalItems() {
      return this.cartItems.filter(item => item.selected)
                          .reduce((total, item) => total + item.quantity, 0);
    }
  },
  methods: {
    // 触摸事件相关方法
    touchStart(event, index) {
      // 防止点击事件冒泡
      event.stopPropagation();
      
      // 记录触摸起始位置和当前操作的商品索引
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.currentIndex = index;
      
      // 重置所有其他商品的左滑状态
      this.cartItems.forEach((item, idx) => {
        if (idx !== index) {
          item.offset = 0;
        }
      });
    },
    touchMove(event, index) {
      if (this.currentIndex !== index) return;
      
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      
      // 计算水平和垂直移动的距离
      const moveX = this.touchStartX - touchX;
      const moveY = Math.abs(this.touchStartY - touchY);
      
      // 如果垂直移动更明显，则不处理左滑
      if (moveY > Math.abs(moveX)) return;
      
      // 计算水平偏移量，仅限制左滑（不允许右滑）
      const offset = Math.min(0, -moveX);
      
      // 限制最大左滑距离
      const maxOffset = -160;
      const limitedOffset = Math.max(maxOffset, offset);
      
      // 更新当前项的偏移
      this.cartItems[index].offset = limitedOffset;
    },
    touchEnd(index) {
      if (this.currentIndex !== index) return;
      
      const item = this.cartItems[index];
      
      // 如果左滑距离超过阈值，则展开操作按钮
      if (item.offset < -this.swipeThreshold) {
        item.offset = -160; // 完全展开操作按钮
      } else {
        item.offset = 0; // 否则恢复原位
      }
      
      this.currentIndex = -1;
    },
    findSimilar(item) {
      this.$toast.info(`正在查找与"${item.name}"相似的商品`);
      // 这里可以跳转到相似商品页面
      this.$router.push({
        name: 'ProductList',
        params: { category: encodeURIComponent(item.name) }
      });
    },
    deleteItem(index) {
      const removedItem = this.cartItems[index];
      
      // 确认删除
      if (confirm(`确定要删除"${removedItem.name}"吗？`)) {
        try {
          // 标记为删除中状态，用于动画
          this.$set(this.cartItems[index], 'deleting', true);
          
          // 使用setTimeout延迟实际删除，以便动画有时间执行
          setTimeout(() => {
            // 直接从数组中移除项目
            this.cartItems = this.cartItems.filter((_, i) => i !== index);
            
            // 直接写入localStorage
            const dataToSave = this.cartItems.map(({ offset, deleting, height, ...item }) => item);
            localStorage.setItem('cartItems', JSON.stringify(dataToSave));
            
            // 手动触发购物车数量更新
            localStorage.setItem('cartUpdated', Date.now().toString());
            
            // 更新总价
            this.updateTotal();
            
            this.$toast.success(`已删除"${removedItem.name}"`);
          }, 300); // 与CSS动画时间匹配
        } catch (error) {
          console.error('删除商品失败:', error);
          this.$toast.error('删除失败，请重试');
          
          // 删除失败恢复状态
          this.$set(this.cartItems[index], 'deleting', false);
        }
      } else {
        // 取消删除，恢复卡片位置
        this.cartItems[index].offset = 0;
      }
    },
    
    // 备用删除方法，不使用动画直接删除
    directDeleteItem(index) {
      try {
        // 防止无效索引
        if (index < 0 || index >= this.cartItems.length) {
          console.error('删除商品失败: 无效的索引', index);
          this.$toast.error('删除失败，请刷新页面重试');
          return;
        }

        const removedItem = this.cartItems[index];
        
        // 确认删除
        if (confirm(`确定要删除"${removedItem.name}"吗？`)) {
          // 先取消任何可能的左滑状态
          this.cartItems.forEach(item => item.offset = 0);
          
          // 克隆数组，避免直接修改原数组
          const updatedItems = [...this.cartItems];
          
          // 从数组中移除该项
          updatedItems.splice(index, 1);
          
          // 更新购物车数组
          this.cartItems = updatedItems;
          
          // 移除offset等UI属性并保存到localStorage
          const cleanItems = this.cartItems.map(({ offset, deleting, height, ...item }) => item);
          localStorage.setItem('cartItems', JSON.stringify(cleanItems));
          
          // 触发更新事件
          localStorage.setItem('cartUpdated', Date.now().toString());
          
          // 更新总价
          this.updateTotal();
          
          this.$toast.success(`已删除"${removedItem.name}"`);
        }
      } catch (error) {
        console.error('删除商品失败:', error);
        this.$toast.error('删除失败，请刷新页面重试');
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    goToStore() {
      this.$router.push('/store');
    },
    goToProductDetail(productId) {
      this.$router.push({
        name: 'ProductDetail',
        params: { id: productId }
      });
    },
    toggleSelectAll() {
      const newState = !this.allSelected;
      this.cartItems.forEach(item => {
        item.selected = newState;
      });
      this.updateTotal();
    },
    toggleShopSelect() {
      const newState = !this.shopSelected;
      this.cartItems.forEach(item => {
        item.selected = newState;
      });
      this.updateTotal();
    },
    increaseQuantity(item) {
      item.quantity++;
      this.updateTotal();
      // 触发购物车更新事件
      localStorage.setItem('cartUpdated', Date.now().toString());
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateTotal();
        // 触发购物车更新事件
        localStorage.setItem('cartUpdated', Date.now().toString());
      }
    },
    updateTotal() {
      this.totalPrice = this.cartItems
        .filter(item => item.selected)
        .reduce((total, item) => {
          return total + (parseFloat(item.price + '.' + item.priceDecimal) * item.quantity);
        }, 0);
      
      // 计算折扣：假设满300减30
      this.discount = this.totalPrice >= 300 ? 30 : 0;
    },
    checkout() {
      if (this.totalItems > 0) {
        this.$toast.info('即将跳转到结算页面');
        // 跳转到结算页面的逻辑
      } else {
        this.$toast.error('请至少选择一件商品');
      }
    },
    // 从localStorage获取购物车数据
    getCartData() {
      try {
        const cartData = localStorage.getItem('cartItems');
        
        // 如果没有购物车数据，初始化为空数组
        if (!cartData) {
          this.cartItems = [];
          return;
        }
        
        // 尝试解析购物车数据
        let parsedData = [];
        try {
          parsedData = JSON.parse(cartData);
          
          // 确保解析结果是数组
          if (!Array.isArray(parsedData)) {
            console.error("购物车数据不是有效的数组格式，重置为空数组");
            parsedData = [];
            localStorage.setItem('cartItems', JSON.stringify([]));
          }
        } catch (e) {
          console.error("购物车数据解析失败，重置为空数组", e);
          parsedData = [];
          localStorage.setItem('cartItems', JSON.stringify([]));
        }
        
        // 过滤掉无效数据，确保每个商品都有必要的字段
        parsedData = parsedData.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id && 
          item.name && 
          item.price
        );
        
        // 为每个商品添加必要的UI属性
        this.cartItems = parsedData.map(item => ({
          ...item,
          offset: 0, // 初始左滑偏移量为0
          deleting: false, // 初始删除状态为false
          // 确保数量是有效数字
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          // 确保选中状态是布尔值
          selected: typeof item.selected === 'boolean' ? item.selected : true
        }));
        
      } catch (error) {
        console.error('获取购物车数据时出错，重置为空购物车:', error);
        this.cartItems = [];
        localStorage.setItem('cartItems', JSON.stringify([]));
      } finally {
        // 无论如何都更新总价
        this.updateTotal();
      }
    },
    
    // 保存购物车数据到localStorage
    saveCartData() {
      try {
        // 过滤掉可能的无效数据
        const validItems = this.cartItems.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id && 
          item.name && 
          item.price
        );
        
        // 在保存前去除UI相关属性
        const dataToSave = validItems.map(({ offset, deleting, height, ...item }) => item);
        
        // 保存到localStorage
        localStorage.setItem('cartItems', JSON.stringify(dataToSave));
        
        // 触发购物车更新事件
        localStorage.setItem('cartUpdated', Date.now().toString());
      } catch (error) {
        console.error('保存购物车数据时出错:', error);
        // 尝试保存一个空数组作为恢复
        try {
          localStorage.setItem('cartItems', JSON.stringify([]));
        } catch (e) {
          console.error('恢复空购物车失败:', e);
        }
      }
    }
  },
  created() {
    this.getCartData();
  },
  watch: {
    cartItems: {
      handler(newItems) {
        // 只有当数组中没有正在删除的项目时才保存
        if (!newItems.some(item => item.deleting)) {
          this.saveCartData();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.cart-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-btn {
  font-size: 18px;
  cursor: pointer;
  width: 30px;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
}

.nav-icons {
  display: flex;
  gap: 20px;
  font-size: 18px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  margin: 15px;
  border-radius: 8px;
}

.empty-image {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  position: relative;
}

.placeholder-empty-cart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cart-icon {
  width: 70px;
  height: 70px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 32px;
  margin-bottom: 10px;
}

.empty-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.empty-icon {
  font-size: 40px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-cart p {
  color: #999;
  margin-bottom: 10px;
  font-size: 16px;
}

.empty-tips {
  color: #bbb;
  font-size: 14px !important;
  margin-bottom: 20px !important;
}

.go-shopping-btn {
  background: #ff5000;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
}

.shop-group {
  background: #fff;
  margin-bottom: 10px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.shop-select {
  display: flex;
  align-items: center;
}

.shop-select input[type="checkbox"] {
  margin-right: 10px;
}

.shop-info {
  display: flex;
  align-items: center;
}

.shop-info i {
  margin-right: 5px;
}

.shop-name {
  font-weight: bold;
  font-size: 14px;
}

.shop-actions {
  color: #ff5000;
  font-size: 13px;
}

.cart-items {
  padding: 0 15px;
}

.cart-item-wrapper {
  position: relative;
  overflow: hidden;
  margin-bottom: 1px;
  transition: height 0.3s ease;
}

.cart-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
  background: #fff;
  position: relative;
  z-index: 2;
  transform-origin: center;
  transition: transform 0.3s ease, opacity 0.3s ease;
  width: 100%;
  will-change: transform, opacity;
}

.cart-item.deleting {
  opacity: 0;
  transform: translateX(-100%);
}

.item-actions {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
  z-index: 1;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 0 20px;
  font-size: 12px;
}

.action-btn i {
  font-size: 18px;
  margin-bottom: 4px;
}

.find-similar {
  background-color: #ff9000;
}

.delete {
  background-color: #ff3b30;
}

.item-select {
  display: flex;
  align-items: center;
  padding-right: 10px;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #bbb;
  background-color: #f0f0f0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 5px;
}

.item-attrs {
  margin-bottom: 10px;
}

.attr-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #ff5000;
  font-weight: bold;
}

.price-symbol {
  font-size: 14px;
}

.price-value {
  font-size: 16px;
}

.price-decimal {
  font-size: 12px;
}

.item-quantity {
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
  background: #f5f5f5;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.item-quantity input {
  width: 40px;
  height: 28px;
  border: none;
  text-align: center;
  font-size: 14px;
  -moz-appearance: textfield;
}

.item-quantity input::-webkit-outer-spin-button,
.item-quantity input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.recommendations {
  background: #fff;
  padding: 15px;
  margin-top: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.recommended-product {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 120px;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 13px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #ff5000;
  font-size: 14px;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.select-all {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 15px;
}

.select-all input {
  margin-right: 5px;
}

.total-section {
  flex: 1;
}

.total-price {
  font-size: 14px;
  font-weight: bold;
}

.discount-info {
  font-size: 12px;
  color: #ff5000;
}

.checkout-btn {
  background: #ff5000;
  color: white;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
}
</style> 