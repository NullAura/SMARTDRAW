<template>
  <div class="product-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="back-btn" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="nav-title">商品详情</div>
      <div class="nav-icons">
        <i class="fas fa-share-alt"></i>
        <i class="fas fa-ellipsis-v"></i>
      </div>
    </div>

    <!-- 商品图片展示 -->
    <div class="product-gallery">
      <div class="main-image">
        <img v-if="product.imageUrl" :src="product.imageUrl" alt="产品图片" class="product-img"/>
        <div v-else class="placeholder-image">{{ product.name ? product.name.charAt(0) : '图' }}</div>
      </div>
      <div class="thumbnail-list">
        <div class="thumbnail active">
          <img v-if="product.imageUrl" :src="product.imageUrl" alt="产品缩略图" class="thumbnail-img"/>
          <div v-else class="placeholder-image-small">{{ product.name ? product.name.charAt(0) : '图' }}</div>
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

    <!-- 评价区域 -->
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

    <!-- 店铺信息 -->
    <div class="shop-section">
      <div class="shop-info">
        <div class="shop-avatar">
          <div class="placeholder-avatar">店</div>
        </div>
        <div class="shop-detail">
          <div class="shop-name">智能家居旗舰店</div>
          <div class="shop-rating">
            <span class="rating-item">描述 4.9</span>
            <span class="rating-item">物流 4.8</span>
            <span class="rating-item">服务 4.9</span>
          </div>
        </div>
      </div>
      <div class="shop-btn">
        <span>进店逛逛</span>
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>

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
            <div class="spec-value">{{ product.color || '经典白色' }}</div>
          </div>
          <div class="spec-row">
            <div class="spec-label">产地</div>
            <div class="spec-value">{{ product.origin || '中国' }}</div>
          </div>
        </div>
        
        <div class="detail-image">
          <div class="placeholder-image-detail">详细图片2</div>
        </div>
      </div>
    </div>

    <!-- 底部固定栏 -->
    <div class="bottom-action-bar">
      <div class="action-buttons">
        <div class="action-btn">
          <i class="fas fa-headset"></i>
          <span>客服</span>
        </div>
        <div class="action-btn" @click="toggleCollect">
          <i :class="isCollected ? 'fas fa-star' : 'far fa-star'"></i>
          <span>收藏</span>
        </div>
        <div class="action-btn" @click="goToCart">
          <i class="fas fa-shopping-cart"></i>
          <span>购物车</span>
          <div class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</div>
        </div>
      </div>
      <div class="main-buttons">
        <div class="add-to-cart-btn" @click="addToCart">
          <span>加入购物车</span>
        </div>
        <div class="buy-now-btn" @click="buyNow">
          <span>立即购买</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入沙发图片
import sofa1Image from '@/assets/images/sofa1.png'

export default {
  name: 'ProductDetail',
  data() {
    return {
      productId: '',
      product: {},
      isCollected: false,
      cartCount: 0,
      // 图片资源
      sofa1Image,
      // 模拟商品数据
      productData: [
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
      ]
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    toggleCollect() {
      this.isCollected = !this.isCollected;
      if (this.isCollected) {
        this.$toast.success('收藏成功');
      } else {
        this.$toast.info('已取消收藏');
      }
    },
    addToCart() {
      // 从localStorage获取现有购物车数据
      let cartItems = [];
      const cartData = localStorage.getItem('cartItems');
      if (cartData) {
        cartItems = JSON.parse(cartData);
      }
      
      // 检查商品是否已在购物车中
      const existingItemIndex = cartItems.findIndex(item => item.id === this.product.id);
      
      if (existingItemIndex !== -1) {
        // 如果商品已存在，增加数量
        cartItems[existingItemIndex].quantity += 1;
      } else {
        // 否则添加新商品
        cartItems.push({
          id: this.product.id,
          name: this.product.name,
          description: this.product.description,
          color: this.product.color || '默认',
          price: this.product.price,
          priceDecimal: this.product.priceDecimal,
          quantity: 1,
          selected: true
        });
      }
      
      // 保存到localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      // 更新购物车数量
      this.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      
      // 创建一个自定义事件来更新其他页面的购物车数量
      // 这里使用localStorage事件触发，但需要触发一个特定的存储事件
      localStorage.setItem('cartUpdated', Date.now().toString());
      
      this.$toast.success('已加入购物车');
    },
    buyNow() {
      this.addToCart();
      this.$router.push('/cart');
    },
    goToCart() {
      this.$router.push('/cart');
    },
    // 根据URL参数获取商品数据
    getProductData() {
      const productId = this.$route.params.id;
      const product = this.productData.find(p => p.id === productId);
      if (product) {
        this.product = product;
      } else {
        // 如果没有找到对应的商品，使用第一个商品作为默认
        this.product = this.productData[0] || {};
      }
    },
    // 从localStorage获取购物车数量
    getCartCount() {
      const cartData = localStorage.getItem('cartItems');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        this.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      }
    }
  },
  created() {
    this.getProductData();
    this.getCartCount();
  }
};
</script>

<style scoped>
.product-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  position: sticky;
  top: 0;
  z-index: 100;
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

.product-gallery {
  background: #fff;
  padding-bottom: 10px;
}

.main-image {
  width: 100%;
  height: 300px;
  position: relative;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #fff;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #bbb;
  background-color: #f0f0f0;
}

.thumbnail-list {
  display: flex;
  padding: 10px;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail.active {
  border: 2px solid #ff5000;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #bbb;
  background-color: #f0f0f0;
}

.product-price-section {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.price-container {
  display: flex;
  align-items: baseline;
}

.price-tag {
  color: #ff5000;
}

.price-symbol {
  font-size: 16px;
  font-weight: bold;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
}

.price-decimal {
  font-size: 16px;
}

.original-price {
  margin-left: 10px;
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}

.product-sale-info {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-tag {
  background: #ff5000;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.sale-count {
  color: #999;
  font-size: 12px;
}

.product-title-section {
  background: #fff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.product-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.collect-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  font-size: 12px;
  margin-left: 15px;
}

.collect-btn i {
  font-size: 18px;
  margin-bottom: 3px;
  color: #ff5000;
}

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

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  height: 50px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.action-buttons {
  display: flex;
  width: 40%;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  position: relative;
}

.action-btn i {
  font-size: 18px;
  margin-bottom: 2px;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 20%;
  background: #ff5000;
  color: white;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 10px;
  padding: 0 4px;
}

.main-buttons {
  display: flex;
  width: 60%;
}

.add-to-cart-btn, .buy-now-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.add-to-cart-btn {
  background: #ffeee5;
  color: #ff5000;
}

.buy-now-btn {
  background: #ff5000;
  color: white;
}
</style> 