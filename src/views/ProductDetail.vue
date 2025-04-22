<template>
  <div class="product-detail-container">
    <!-- 顶部导航栏（仅移动端显示） -->
    <div class="top-nav mobile-only">
      <div class="back-btn" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="nav-title">商品详情</div>
      <div class="nav-icons">
        <i class="fas fa-share-alt"></i>
        <i class="fas fa-ellipsis-v"></i>
      </div>
    </div>

    <!-- 桌面端返回按钮 -->
    <div class="desktop-nav desktop-only">
      <div class="container">
        <div class="back-btn" @click="goBack">
          <i class="fas fa-chevron-left"></i>
          <span>返回</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <div>加载中...</div>
    </div>

    <div v-else class="container product-content">
      <!-- 商品展示区域 -->
      <div class="product-main">
        <!-- 商品图片展示 -->
        <div class="product-gallery">
          <div class="main-image">
            <img v-if="product && product.imageUrl" :src="product.imageUrl" alt="产品图片" class="product-img"/>
            <div v-else class="placeholder-image">{{ product && product.name ? product.name.charAt(0) : '图' }}</div>
          </div>
          <div class="thumbnail-list">
            <div class="thumbnail active">
              <img v-if="product && product.imageUrl" :src="product.imageUrl" alt="产品缩略图" class="thumbnail-img"/>
              <div v-else class="placeholder-image-small">{{ product && product.name ? product.name.charAt(0) : '图' }}</div>
            </div>
            <div class="thumbnail">
              <div class="placeholder-image-small">2</div>
            </div>
            <div class="thumbnail">
              <div class="placeholder-image-small">3</div>
            </div>
            <div class="thumbnail">
              <div class="placeholder-image-small">4</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品信息区域，只有在 product 存在时才显示 -->
      <div v-if="product" class="product-info">
        <!-- 商品价格信息 -->
        <div class="product-price-section">
          <div class="price-container">
            <div class="price-tag">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.price }}</span>
              <span class="price-decimal">.{{ product.priceDecimal }}</span>
            </div>
            <div class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</div>
          </div>
          <div class="product-sale-info">
            <span class="product-tag" v-if="product.tag">{{ product.tag }}</span>
            <span class="sale-count">月销{{ product.monthlySales || '100+' }}件</span>
          </div>
        </div>

        <!-- 商品标题 -->
        <div class="product-title-section">
          <h1 class="product-title">{{ product.name }} {{ product.description }}</h1>
          <div class="collect-btn" @click="toggleCollect">
            <i :class="isCollected ? 'fas fa-star' : 'far fa-star'"></i>
            <span>收藏</span>
          </div>
        </div>

        <!-- 优惠券区域 -->
        <div class="coupon-section">
          <div class="section-title">优惠</div>
          <div class="coupon-list">
            <div class="coupon-item">
              <div class="coupon-tag">券</div>
              <div class="coupon-desc">满300减30</div>
            </div>
            <div class="coupon-item">
              <div class="coupon-tag">会员</div>
              <div class="coupon-desc">会员价¥{{ (product.price * 0.9).toFixed(2) }}</div>
            </div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>

        <!-- 配送信息 -->
        <div class="delivery-section">
          <div class="section-title">配送</div>
          <div class="delivery-info">
            <div class="delivery-address">
              <i class="fas fa-map-marker-alt"></i>
              <span>上海市浦东新区</span>
            </div>
            <div class="delivery-fee">
              <span>运费¥18</span>
              <span class="delivery-note">满99包邮</span>
            </div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>

        <!-- 服务保障 -->
        <div class="service-section">
          <div class="section-title">服务</div>
          <div class="service-list">
            <div class="service-item">
              <i class="fas fa-check-circle"></i>
              <span>官方正品</span>
            </div>
            <div class="service-item">
              <i class="fas fa-check-circle"></i>
              <span>7天无理由退货</span>
            </div>
            <div class="service-item">
              <i class="fas fa-check-circle"></i>
              <span>72小时发货</span>
            </div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>

    <!-- 评价区域 -->
    <div v-if="product" class="container">
      <div class="review-section">
        <div class="section-header">
          <div class="left">
            <span class="section-title">评价</span>
            <span class="review-count">{{ product.reviewCount || '999+' }}</span>
            <span class="review-rate">好评率 {{ product.goodRate || '98' }}%</span>
          </div>
          <div class="right">
            <span>查看全部</span>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <!-- 评价内容 -->
        <div class="review-content">
          <div class="reviewer-info">
            <div class="avatar">
              <div class="placeholder-avatar">用</div>
            </div>
            <div class="name">用户1234****</div>
          </div>
          <div class="review-text">
            {{ product.sampleReview || '商品质量非常好，与描述完全一致，发货速度快，客服态度也很好，下次还会购买！' }}
          </div>
          <div class="review-images">
            <div class="review-image">
              <div class="placeholder-image-small">图</div>
            </div>
            <div class="review-image">
              <div class="placeholder-image-small">图</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品详情选项卡和内容 -->
    <div v-if="product" class="container">
      <!-- 商品详情选项卡 -->
      <div class="detail-tabs">
        <div class="tab-item active">商品详情</div>
        <div class="tab-item">产品参数</div>
        <div class="tab-item">用户评价</div>
      </div>

      <!-- 商品详情内容 -->
      <div class="product-details">
        <div class="detail-section">
          <h3>产品特点</h3>
          <p>{{ product.features || '这款产品采用优质材料制作，外观简约时尚，功能齐全，使用方便，是您家居生活的理想选择。' }}</p>
          
          <div class="detail-image">
            <div class="placeholder-image-detail">详细图片1</div>
          </div>
          
          <h3>产品规格</h3>
          <div class="specs-table">
            <div class="spec-row">
              <div class="spec-label">尺寸</div>
              <div class="spec-value">{{ product.size || '72x40x109 厘米' }}</div>
            </div>
            <div class="spec-row">
              <div class="spec-label">材质</div>
              <div class="spec-value">{{ product.material || '优质环保材料' }}</div>
            </div>
            <div class="spec-row">
              <div class="spec-label">颜色</div>
              <div class="spec-value">{{ product.color || '自然木色' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="bottom-actions">
      <div class="action-left">
        <div class="action-item">
          <i class="fas fa-store"></i>
          <span>店铺</span>
        </div>
        <div class="action-item">
          <i class="fas fa-headset"></i>
          <span>客服</span>
        </div>
        <div class="action-item">
          <i :class="isCollected ? 'fas fa-star' : 'far fa-star'" @click="toggleCollection"></i>
          <span>收藏</span>
        </div>
      </div>
      <div class="action-right">
        <button class="cart-btn" @click="addToCart">加入购物车</button>
        <button class="buy-btn" @click="buyNow">立即购买</button>
      </div>
    </div>

    <!-- 加入购物车成功提示 -->
    <div
      v-if="showAddedToast"
      class="added-toast fadeIn"
    >
      <i class="fas fa-check-circle"></i>
      <span>已添加到购物车</span>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SvgIcon from '../components/SvgIcon.vue';
import SvgButton from '../components/SvgButton.vue';
import CartDrawer from '../components/CartDrawer.vue';
import { useCartStore } from '../stores/cart';

// 导入图片
import sofa1Image from '../assets/images/sofa1.png';

export default {
  components: {
    SvgIcon,
    SvgButton,
    CartDrawer
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // 创建本地购物车状态，以防 Pinia 未初始化
    const localCart = ref([]);
    let cartStore = null;
    
    // 尝试获取 Pinia store，如果失败则使用本地状态
    try {
      cartStore = useCartStore();
    } catch (e) {
      console.warn('Pinia store 未初始化，使用本地购物车状态');
    }
    
    const showCart = ref(false);
    const isAddingToCart = ref(false);
    const showAddedToast = ref(false);
    
    // 获取商品ID
    const productId = computed(() => route.params.id);
    
    // 获取当前商品详情
    const product = ref(null);
    const loading = ref(true);
    const selectedImage = ref(0);
    const isCollected = ref(false);
    
    // 根据productId找到对应的产品数据
    const getProductData = () => {
      loading.value = true;
      
      // 模拟加载延迟
      setTimeout(() => {
        // 查找当前商品
        const foundProduct = productData.find(p => p.id === productId.value) || productData[0];
        product.value = foundProduct;
        loading.value = false;
      }, 500);
    };
    
    // 商品添加到购物车
    const addToCart = () => {
      if (!product.value) return;
      
      isAddingToCart.value = true;
      
      setTimeout(() => {
        // 使用 Pinia store
        if (cartStore) {
          cartStore.addToCart(product.value);
        } else {
          // 本地购物车逻辑
          const existingItem = localCart.value.find(item => item.id === product.value.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            localCart.value.push({
              id: product.value.id,
              name: product.value.name,
              description: product.value.description || '',
              price: product.value.price,
              priceDecimal: product.value.priceDecimal || '00',
              imageUrl: product.value.imageUrl || '',
              quantity: 1
            });
          }
          
          // 保存到本地存储
          try {
            localStorage.setItem('cartItems', JSON.stringify(localCart.value));
            // 触发更新事件
            localStorage.setItem('cartUpdated', Date.now().toString());
          } catch (e) {
            console.error('保存购物车失败', e);
          }
        }
        
        isAddingToCart.value = false;
        showAddedToast.value = true;
        
        // 3秒后隐藏提示
        setTimeout(() => {
          showAddedToast.value = false;
        }, 3000);
      }, 500);
    };
    
    // 打开购物车抽屉
    const openCart = () => {
      showCart.value = true;
    };
    
    // 关闭购物车抽屉
    const closeCart = () => {
      showCart.value = false;
    };
    
    // 立即购买
    const buyNow = () => {
      if (!product.value) return;
      
      // 添加到购物车
      if (cartStore) {
        cartStore.addToCart(product.value);
      } else {
        // 本地购物车逻辑，与 addToCart 相同
        const existingItem = localCart.value.find(item => item.id === product.value.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          localCart.value.push({
            id: product.value.id,
            name: product.value.name,
            description: product.value.description || '',
            price: product.value.price,
            imageUrl: product.value.imageUrl || '',
            quantity: 1
          });
        }
        
        try {
          localStorage.setItem('cart', JSON.stringify(localCart.value));
        } catch (e) {
          console.error('保存购物车失败', e);
        }
      }
      
      // 跳转到结算页面，这里暂时跳转到购物车页面
      router.push({ path: '/cart' });
    };
    
    // 收藏/取消收藏
    const toggleCollection = () => {
      isCollected.value = !isCollected.value;
    };
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    // 生命周期钩子
    onMounted(() => {
      getProductData();
      
      // 如果使用本地购物车，尝试从 localStorage 加载
      if (!cartStore) {
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            localCart.value = JSON.parse(savedCart);
          }
        } catch (e) {
          console.error('加载购物车失败', e);
        }
      }
    });
    
    // 商品数据
    const productData = reactive([
      {
        id: '1',
        name: 'DUKTIG 杜克迪',
        description: '玩具厨房, 72x40x109 厘米',
        price: '699',
        priceDecimal: '00',
        originalPrice: '899',
        tag: '热卖',
        subInfo: '满足孩子当小厨师的乐趣',
        monthlySales: '500+',
        reviewCount: '2000+',
        goodRate: '99',
        sampleReview: '质量很好，小朋友非常喜欢，组装简单，很适合过家家游戏！',
        features: '这款玩具厨房专为儿童设计，采用优质材料制作，安全环保。它能够激发儿童的创造力和想象力，让孩子体验做饭的乐趣，培养生活技能。',
        size: '72x40x109 厘米',
        material: '环保木材',
        color: '白色',
        origin: '瑞典'
      },
      {
        id: '2',
        name: 'BYGGLEK 比格列克',
        description: '积木 201件套',
        price: '69',
        priceDecimal: '99',
        originalPrice: '89.99',
        tag: '新品',
        subInfo: '乐高联名，可另配积木盒',
        monthlySales: '1000+',
        reviewCount: '1500+',
        goodRate: '98',
        sampleReview: '乐高联名款，价格实惠，颗粒很多，孩子很喜欢！',
        features: '这套积木包含201个积木颗粒，颜色丰富多样，可以激发儿童的创造力和想象力。它与乐高系统完全兼容，可以与其他乐高产品组合使用。',
        size: '适合5岁以上儿童',
        material: 'ABS塑料',
        color: '多色',
        origin: '丹麦'
      },
      {
        id: '3',
        name: 'KIVIK 希维克',
        description: '三人沙发, 布罗福尔斯 灰色',
        price: '3999',
        priceDecimal: '00',
        originalPrice: '4699.00',
        tag: '特惠',
        subInfo: '舒适耐用的宽敞沙发',
        monthlySales: '200+',
        reviewCount: '850+',
        goodRate: '96',
        sampleReview: '沙发质感超赞，颜色和图片一致，坐上去很舒适，客厅大小正合适！',
        features: '这款希维克三人沙发采用灰色布罗福尔斯面料，质感丰富且耐用。宽大的扶手和柔软的靠垫提供了极佳的舒适感。沙发框架结实耐用，使用高弹力泡沫填充，保证长时间使用仍保持舒适。沙发套可拆卸清洗，让您的家居始终保持干净整洁。',
        size: '228x95x83 厘米',
        material: '高弹力泡沫, 布罗福尔斯面料',
        color: '灰色',
        origin: '瑞典',
        imageUrl: sofa1Image
      }
    ]);
    
    return {
      product,
      loading,
      selectedImage,
      isCollected,
      cartStore,
      localCart,
      showCart,
      isAddingToCart,
      showAddedToast,
      addToCart,
      buyNow,
      openCart,
      closeCart,
      toggleCollection,
      goBack
    };
  }
};
</script>

<style scoped>
.product-detail-container {
  background-color: #f5f7fb;
  min-height: 100vh;
  padding-bottom: 60px;  /* 为底部操作栏留出空间 */
}

/* 移动端顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 10px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 桌面端导航 */
.desktop-nav {
  padding: 1rem 0;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.desktop-nav .back-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-color);
}

.desktop-nav .back-btn span {
  margin-left: 0.5rem;
}

/* 产品内容区域 */
.product-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 商品展示和信息区域 */
.product-main {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.product-info {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  padding: 1rem;
}

/* 商品画廊 */
.product-gallery {
  width: 100%;
}

.main-image {
  width: 100%;
  padding-bottom: 100%;  /* 保持正方形比例 */
  position: relative;
  background-color: #f5f5f5;
  overflow: hidden;
}

.product-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  padding: 10px;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  flex: 0 0 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid #eee;
}

.thumbnail.active {
  border-color: var(--primary-color);
}

/* 商品信息样式 */
.product-price-section {
  margin-bottom: 1rem;
}

.price-container {
  display: flex;
  align-items: baseline;
}

.price-tag {
  color: #ff6b00;
  margin-right: 10px;
}

.price-symbol {
  font-size: 1rem;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.original-price {
  color: #999;
  text-decoration: line-through;
}

.product-title-section {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.product-title {
  font-size: 1.1rem;
  line-height: 1.4;
  margin-right: 10px;
  flex: 1;
}

.collect-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #666;
  margin-left: 10px;
  cursor: pointer;
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.action-left {
  display: flex;
  height: 100%;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 100%;
  font-size: 0.7rem;
  color: #666;
}

.action-item i {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.action-right {
  display: flex;
  gap: 10px;
}

.cart-btn, .buy-btn {
  height: 36px;
  padding: 0 15px;
  border-radius: 18px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.cart-btn {
  background-color: #ffe8cc;
  color: #ff6b00;
}

.buy-btn {
  background-color: #ff6b00;
  color: white;
}

/* 响应式布局 */
@media (min-width: 769px) {
  .product-detail-container {
    padding-bottom: 0;  /* 桌面端不需要为底部操作栏留出空间 */
  }
  
  .product-content {
    flex-direction: row;
    margin-top: 1rem;
    gap: 2rem;
  }
  
  .product-main {
    flex: 0 0 45%;
  }
  
  .product-info {
    flex: 1;
  }
  
  .bottom-actions {
    position: static;
    margin-top: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 60px;
  }
  
  .action-item {
    width: 80px;
    font-size: 0.8rem;
  }
  
  .cart-btn, .buy-btn {
    height: 40px;
    padding: 0 30px;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: var(--container-padding-mobile);
  }
  
  .product-content {
    gap: 0.5rem;
  }
  
  .thumbnail {
    flex: 0 0 50px;
    height: 50px;
  }
}

/* 其他原有样式保持不变 */
.coupon-section, .delivery-section, .service-section {
  background: #fff;
  padding: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 1px;
}

.section-title {
  color: #666;
  font-size: 14px;
  min-width: 60px;
}

.coupon-list, .service-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
}

.coupon-tag {
  background: #ff5000;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
}

.coupon-desc {
  font-size: 13px;
}

.delivery-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-address {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.delivery-fee {
  font-size: 13px;
}

.delivery-note {
  color: #ff5000;
  margin-left: 5px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.service-item i {
  color: #ff5000;
  font-size: 14px;
}

.fa-chevron-right {
  color: #ccc;
  font-size: 14px;
}

.review-section {
  background: #fff;
  padding: 15px;
  margin: 10px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count, .review-rate {
  color: #999;
  font-size: 13px;
}

.right {
  color: #666;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.review-content {
  border-top: 1px solid #f2f2f2;
  padding-top: 15px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.placeholder-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  background-color: #bbb;
}

.name {
  font-size: 13px;
  color: #666;
}

.review-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.review-images {
  display: flex;
  gap: 8px;
}

.review-image {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
}

.shop-section {
  background: #fff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shop-info {
  display: flex;
  align-items: center;
}

.shop-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.shop-name {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 5px;
}

.shop-rating {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.shop-btn {
  border: 1px solid #eee;
  padding: 6px 12px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.detail-tabs {
  display: flex;
  background: #fff;
  margin-bottom: 1px;
  position: sticky;
  top: 50px;
  z-index: 99;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #ff5000;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 2px;
  background: #ff5000;
}

.product-details {
  background: #fff;
  padding: 15px;
}

.detail-section h3 {
  margin: 15px 0 10px;
  font-size: 16px;
}

.detail-section p {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
}

.detail-image {
  width: 100%;
  height: 200px;
  margin: 15px 0;
}

.placeholder-image-detail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #bbb;
  background-color: #f0f0f0;
}

.specs-table {
  margin: 15px 0;
}

.spec-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f2f2f2;
}

.spec-label {
  width: 80px;
  color: #999;
  font-size: 14px;
}

.spec-value {
  flex: 1;
  font-size: 14px;
}

/* 购物车数量标记 */
.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e53935;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加入购物车成功提示 */
.added-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 添加动画 */
.fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  gap: 16px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: var(--primary-color, #ff6b00);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 