<template>
  <div class="home-container" data-v-22686b16>
    <!-- 侧边栏，在电脑端始终可见 -->
    <div :class="['sidebar', { active: sidebarOpen, 'desktop-sidebar': isDesktop }]">
      <div class="sidebar-header">
        <h3>购物车</h3>
        <i class="fas fa-times mobile-only" @click="toggleSidebar"></i>
      </div>
      <div class="cart-sidebar-content">
        <div v-if="cartProducts.length === 0" class="empty-cart-notice">
          <i class="fas fa-shopping-basket"></i>
          <p>购物车为空</p>
          <button @click="goToStore">去商城看看</button>
        </div>
        <div v-else class="cart-items-list">
          <div 
            v-for="(item, index) in cartProducts" 
            :key="index"
            class="cart-product-item"
            draggable="true"
            @dragstart="dragCartItem($event, item)"
          >
            <div class="cart-product-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" alt="商品图片" class="cart-product-img" />
              <div v-else class="placeholder-image">{{ item.name.charAt(0) }}</div>
            </div>
            <div class="cart-product-info">
              <div class="cart-product-name">{{ item.name }}</div>
              <div class="cart-product-desc" v-if="item.description">{{ item.description }}</div>
              <div class="cart-product-price">¥{{ item.price }}.{{ item.priceDecimal }}</div>
              <div class="cart-product-quantity">
                <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)">+</button>
              </div>
            </div>
            <div class="cart-product-actions">
              <button class="delete-btn" @click="removeFromCart(item)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-if="cartProducts.length > 0" class="cart-summary">
          <div class="summary-row">
            <span>商品总数：</span>
            <span>{{ totalQuantity }}件</span>
          </div>
          <div class="summary-row">
            <span>总金额：</span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
          <button class="checkout-btn" @click="checkout">
            <i class="fas fa-shopping-cart"></i>
            结算
          </button>
        </div>
      </div>
    </div>

    <div class="main-content" data-v-2dc54a20>
      <!-- 顶部标签栏，只在移动端显示 -->
      <div class="top-header mobile-only">
        <div class="header-left">
          <i class="fas fa-bars menu-icon" @click="toggleSidebar"></i>
          <h1>智绘家居</h1>
        </div>
      </div>

      <!-- 功能切换栏 -->
      <div class="function-bar">
        <div class="scroll-hint left" v-show="activeFunction > 0">
          <i class="fas fa-chevron-left"></i>
        </div>
        <div
            class="function-track"
            :style="{ transform: `translateX(${trackPosition}%)` }"
            @touchstart.passive="handleTouchStart"
            @touchmove.passive="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="isDesktop && handleMouseDown"
        >
          <div
              v-for="(func, index) in functions"
              :key="func.id"
              class="function-item"
              :class="{ active: activeFunction === index }"
              @click="selectFunction(index)"
          >
            {{ func.name }}
          </div>
        </div>
        <div class="scroll-hint right" v-show="activeFunction < functions.length - 1">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>

      <!-- 内容过渡区 -->
      <transition :name="transitionName" mode="out-in">
        <div class="content-area" :key="activeFunction">
          <!-- 输入区域 -->
          <div class="input-section">
            <template v-if="isReplaceMode">
              <div class="combined-upload">
                <div
                    v-for="(img, idx) in replaceImages"
                    :key="idx"
                    class="upload-box replace-mode"
                    :class="{ 'drag-over': idx === 1 && isDraggingOver }"
                    @click="triggerUpload(idx)"
                    @dragover.prevent="idx === 1 && handleDragOver($event)"
                    @dragleave="idx === 1 && handleDragLeave($event)"
                    @drop="idx === 1 && dropCartItem($event)"
                >
                  <img v-if="img" :src="img.preview" class="preview-thumbnail" alt="">
                  <div v-else class="upload-placeholder">
                    <i class="fas fa-image"></i>
                    <p>{{ idx === 0 ? '原始家居图' : '替换家具' }}</p>
                  </div>
                  <input
                      type="file"
                      :ref="el => fileInputs[idx] = el"
                      @change="e => handleUpload(e, idx)"
                      accept="image/*"
                  >
                </div>
              </div>
              <!-- 从购物车导入按钮，去掉条件判断，始终显示 -->
              <div 
                  class="import-from-cart"
                  :class="{ 'replace-mode': replaceImages[1] !== null }"
                  @click="showCartItems"
              >
                <i class="fas" :class="replaceImages[1] ? 'fa-sync-alt' : 'fa-shopping-cart'"></i>
                <p>{{ replaceImages[1] ? '重新选择替换家具' : '从购物车导入替换家具' }}</p>
              </div>
            </template>

            <div v-else class="simple-upload">
              <div class="upload-box simple-mode" @click="triggerUpload(-1)">
                <img v-if="simpleImage" :src="simpleImage.preview" class="preview-thumbnail" alt="">
                <div v-else class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>点击上传参考图</p>
                </div>
                <input
                    type="file"
                    :ref="el => simpleInput = el"
                    @change="handleSimpleUpload"
                    accept="image/*"
                >
              </div>
            </div>
          </div>

          <!-- 输出预览 -->
          <div class="download-box">
            <div class="output-preview">
              <template v-if="generatedImage">
                <img
                    :src="generatedImage"
                    class="result-image"
                    loading="lazy"
                    alt="生成结果">
                <div class="toolbar">
                  <button @click="downloadImage">
                    <i class="fas fa-download"></i>
                  </button>
                  <button @click="shareImage">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
              </template>
              <div v-else class="download-placeholder">
                <div class="placeholder-content">
                  <i class="fas fa-image"></i>
                  <p>生成结果预览</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 评价框 -->
          <div class="review-box" v-if="replaceImages[0]">
            <div class="review-header">
              <h3>AI评价</h3>
              <button 
                class="get-ai-review-btn"
                @click="getAIReview"
                :disabled="isGettingAIReview"
              >
                <i class="fas fa-robot"></i>
                {{ isGettingAIReview ? '获取评价中...' : '获取AI评价' }}
              </button>
            </div>
            <div class="review-content" v-if="aiReview">
              <div class="ai-review-text">{{ aiReview }}</div>
            </div>
            <div class="review-placeholder" v-else>
              <i class="fas fa-comment-alt"></i>
              <p>点击"获取AI评价"按钮，让AI分析您的家居设计</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 提示词输入 -->
      <div class="prompt-section">
        <div class="prompt-controls">
          <textarea
              v-model.trim="prompt"
              placeholder="请输入创作提示词..."
              rows="3"
              @input="debouncedSaveDraft"
          ></textarea>
          <div class="prompt-actions">
            <button
                class="polish-btn"
                :disabled="isPolishing || !prompt.trim()"
                @click="polishPrompt"
            >
              <i class="fas fa-magic"></i>
              {{ isPolishing ? '润色中...' : 'AI润色' }}
              <span v-if="isPolishing" class="loading-dots"></span>
            </button>
            <button
                v-if="showRevertButton"
                class="revert-btn"
                @click="revertPrompt"
            >
              <i class="fas fa-undo"></i>
              取消润色
            </button>
            <button
                class="generate-btn"
                :disabled="isGenerating"
                @click="generateImage"
            >
              <i class="fas fa-magic"></i>
              {{ isGenerating ? '生成中...' : '立即生成' }}
              <span v-if="isGenerating" class="loading-dots"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="sidebarOpen" class="sidebar-mask" @click="toggleSidebar"></div>

    <!-- 购物车商品选择弹窗 -->
    <div v-if="cartSelectVisible" class="cart-select-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>选择购物车商品</h3>
          <i class="fas fa-times" @click="closeCartSelect"></i>
        </div>
        
        <!-- 搜索框 -->
        <div class="cart-search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="cartSearchQuery" 
            placeholder="搜索商品名称..."
            @input="filterCartItems"
          >
        </div>
        
        <div class="cart-items-list">
          <div v-if="filteredCartProducts.length === 0" class="empty-cart-notice">
            <i class="fas fa-shopping-basket"></i>
            <p>{{ cartProducts.length === 0 ? '购物车中没有商品' : '没有找到匹配的商品' }}</p>
            <button v-if="cartProducts.length === 0" @click="goToStore">去商城看看</button>
            <button v-else @click="cartSearchQuery = ''">查看全部</button>
          </div>
          <div 
            v-for="(item, index) in filteredCartProducts" 
            :key="index"
            class="cart-product-item"
            @click="selectCartItem(item)"
          >
            <div class="cart-product-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" alt="商品图片" class="cart-product-img" />
              <div v-else class="placeholder-image">{{ item.name.charAt(0) }}</div>
            </div>
            <div class="cart-product-info">
              <div class="cart-product-name">{{ item.name }}</div>
              <div class="cart-product-desc" v-if="item.description">{{ item.description }}</div>
              <div class="cart-product-price">¥{{ item.price }}.{{ item.priceDecimal }}</div>
            </div>
            <div class="select-indicator">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        
        <!-- 底部按钮区域 -->
        <div class="cart-modal-footer">
          <button class="cancel-btn" @click="closeCartSelect">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import 'vant/es/toast/style'
import { AI_API_BASE_URL, buildUrl } from '@/config'

// 响应式状态
const sidebarOpen = ref(false)
const activeFunction = ref(0)
const trackPosition = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
const transitionName = ref('slide-right')
const isGenerating = ref(false)
const router = useRouter()
const isMobile = ref(window.innerWidth <= 768)
const isDesktop = ref(window.innerWidth > 768)
const isDraggingOver = ref(false)

// 图片相关
const replaceImages = ref([null, null])
const simpleImage = ref(null)
const generatedImage = ref('')
const fileInputs = ref([])
const simpleInput = ref(null)

// 购物车相关
const cartSelectVisible = ref(false)
const cartProducts = ref([])
const cartSearchQuery = ref('')
const filteredCartProducts = ref([])

// 计算购物车总数量
const totalQuantity = computed(() => {
  return cartProducts.value.reduce((total, item) => total + (item.quantity || 1), 0)
})

// 计算购物车总金额
const totalPrice = computed(() => {
  return cartProducts.value.reduce((total, item) => {
    const price = parseFloat(`${item.price}.${item.priceDecimal}`)
    return total + (price * (item.quantity || 1))
  }, 0).toFixed(2)
})

// 增加商品数量
const increaseQuantity = (item) => {
  if (!item.quantity) {
    item.quantity = 1
  }
  item.quantity++
  updateCartStorage()
}

// 减少商品数量
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
    updateCartStorage()
  }
}

// 从购物车移除商品
const removeFromCart = (item) => {
  const index = cartProducts.value.findIndex(p => p.id === item.id)
  if (index !== -1) {
    cartProducts.value.splice(index, 1)
    updateCartStorage()
    showToast({
      message: '已从购物车移除',
      type: 'success'
    })
  }
}

// 更新本地存储
const updateCartStorage = () => {
  localStorage.setItem('cartItems', JSON.stringify(cartProducts.value))
}

// 结算功能
const checkout = () => {
  if (cartProducts.value.length === 0) {
    showToast({
      message: '购物车为空',
      type: 'fail'
    })
    return
  }
  
  // 这里可以添加结算逻辑，比如跳转到结算页面
  showToast({
    message: '正在跳转到结算页面...',
    type: 'loading'
  })
  
  // 模拟跳转延迟
  setTimeout(() => {
    router.push('/checkout')
  }, 1000)
}

// 加载购物车数据
const loadCartItems = () => {
  try {
    const cartData = localStorage.getItem('cartItems')
    console.log('购物车原始数据:', cartData)
    
    if (cartData) {
      try {
        const parsedData = JSON.parse(cartData)
        console.log('解析后的购物车数据:', parsedData)
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // 确保每个商品都有数量属性
          cartProducts.value = parsedData.map(item => ({
            ...item,
            quantity: item.quantity || 1
          }))
          filteredCartProducts.value = [...cartProducts.value]
          console.log('购物车商品数量:', parsedData.length)
        } else {
          console.log('购物车为空或格式不正确')
          cartProducts.value = []
          filteredCartProducts.value = []
        }
      } catch (e) {
        console.error('购物车数据解析失败:', e)
        cartProducts.value = []
        filteredCartProducts.value = []
      }
    } else {
      console.log('购物车本地存储为空')
      cartProducts.value = []
      filteredCartProducts.value = []
    }
  } catch (error) {
    console.error('加载购物车数据失败:', error)
    cartProducts.value = []
    filteredCartProducts.value = []
  }
}

// 提示词
const prompt = ref('')
const debouncedSaveDraft = useDebounceFn(() => {
  localStorage.setItem('draft_prompt', prompt.value)
}, 1000)

// 功能配置
const functions = ref([
  { id: 1, name: '智能替换', type: 'replace' },
  { id: 2, name: '快速生成', type: 'simple' }
])

// 计算属性
const isReplaceMode = computed(() => functions.value[activeFunction.value].type === 'replace')

// 侧边栏开关
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 处理移动端触摸开始事件
const handleTouchStart = (e) => {
  // 记录初始触摸点
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

// 处理移动端触摸移动事件
const handleTouchMove = (e) => {
  // 如果没有记录初始触摸点，则不处理
  if (touchStartX.value === 0) return
  
  // 获取当前触摸点
  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY
  
  // 计算水平和垂直方向的移动距离
  const deltaX = touchX - touchStartX.value
  const deltaY = touchY - touchStartY.value
  
  // 如果垂直移动距离大于水平移动距离，则判定为上下滚动，不处理左右滑动
  if (Math.abs(deltaY) > Math.abs(deltaX)) return
  
  // 阻止默认行为，避免页面一起滚动
  // e.preventDefault() // 在passive模式下不能调用
  
  // 限制移动端滑动灵敏度
  if (Math.abs(deltaX) < 30) return

  // 计算应该切换到哪个功能
  const direction = deltaX > 0 ? -1 : 1 // 正值表示向右滑，切换到上一个功能；负值表示向左滑，切换到下一个功能
  const newIndex = Math.min(Math.max(activeFunction.value + direction, 0), functions.value.length - 1)
  
  // 如果到了边界，则不继续处理
  if ((newIndex === 0 && direction === -1) || (newIndex === functions.value.length - 1 && direction === 1)) {
    return
  }
  
  // 设置过渡效果
  transitionName.value = direction > 0 ? 'slide-left' : 'slide-right'
}

// 处理移动端触摸结束事件
const handleTouchEnd = (e) => {
  // 如果没有记录初始触摸点，则不处理
  if (touchStartX.value === 0) return
  
  // 计算水平移动距离
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  
  // 如果移动距离足够大，则切换功能
  if (Math.abs(deltaX) > 50) { // 阈值设为50，可以根据需要调整
    const direction = deltaX > 0 ? -1 : 1 // 正值表示向右滑，切换到上一个功能；负值表示向左滑，切换到下一个功能
    const newIndex = Math.min(Math.max(activeFunction.value + direction, 0), functions.value.length - 1)
    
    // 切换功能
    if (newIndex !== activeFunction.value) {
      selectFunction(newIndex)
    }
  }
  
  // 重置触摸点
  touchStartX.value = 0
  touchStartY.value = 0
}

// 初始化滑块位置
onMounted(() => {
  trackPosition.value = -activeFunction.value * 50
  window.addEventListener('resize', handleResize)
  // 添加全局鼠标事件监听
  if (isDesktop.value) {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
  }
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  // 移除全局鼠标事件监听
  if (isDesktop.value) {
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('mousemove', handleMouseMove)
  }
})

// 触发文件选择
const triggerUpload = (index) => {
  if (index === -1) {
    simpleInput.value?.click()
  } else {
    fileInputs.value[index]?.click()
  }
}

// 创建图片缩略图
const createImageThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('请选择图片文件'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const maxSize = 800

        // 保持宽高比缩放
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 保存原始文件，不进行处理
        resolve({
          file: file, // 使用原始文件，与测试脚本保持一致
          preview: canvas.toDataURL('image/jpeg', 0.8),
          dimensions: { width: canvas.width, height: canvas.height }
        })
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 处理上传
const handleUpload = async (event, index) => {
  try {
    const file = event.target.files[0]
    if (!file) return

    const processed = await createImageThumbnail(file)
    replaceImages.value = replaceImages.value.map((item, i) =>
        i === index ? processed : item
    )
  } catch (error) {
    console.error('上传失败:', error.message)
    showToast({
      message: '上传失败，请重试',
      type: 'fail'
    })
  }
}

const handleSimpleUpload = async (event) => {
  try {
    const file = event.target.files[0]
    if (!file) return

    simpleImage.value = await createImageThumbnail(file)
  } catch (error) {
    console.error('上传失败:', error.message)
    showToast({
      message: '上传失败，请重试',
      type: 'fail'
    })
  }
}

// 生成图片
const generateImage = async () => {
  try {
    if ((!simpleImage.value && !replaceImages.value[0]) || !prompt.value.trim()) {
      showToast({
        message: '请上传图片并输入提示词',
        type: 'fail',
        position: 'bottom'
      })
      return
    }
    
    isGenerating.value = true
    
    // 显示加载提示
    const loadingToast = showLoadingToast({
      message: '正在生成中，请稍候...',
      forbidClick: true,
      duration: 0
    })
    
    try {
      // 智能替换模式
      if (isReplaceMode.value) {
        // 检查是否上传了两张图片
        if (!replaceImages.value[0] || !replaceImages.value[1]) {
          throw new Error('请上传原始图片和替换家具图片')
        }

        // 创建FormData
        const formData = new FormData()
        formData.append('workflow_type', 'mergin')  // 使用双图模式
        formData.append('image1', replaceImages.value[0].file, replaceImages.value[0].file.name)
        formData.append('image2', replaceImages.value[1].file, replaceImages.value[1].file.name)
        formData.append('username', 'testuser')
        formData.append('prompt', prompt.value.trim())
        formData.append('output_format', 'url')

        console.log('智能替换模式：准备发送请求...')
        console.log('FormData内容:', {
          workflow_type: 'mergin',
          image1: replaceImages.value[0].file.name,
          image2: replaceImages.value[1].file.name,
          username: 'testuser',
          prompt: prompt.value.trim(),
          output_format: 'url'
        })

        // 发送请求到服务器
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1200000) // 20分钟超时

        try {
          const response = await fetch('/generate', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          })

          // 清除超时器
          clearTimeout(timeoutId)

          console.log('服务器响应状态:', response.status)
          console.log('响应头:', Object.fromEntries(response.headers.entries()))

          if (!response.ok) {
            const errorText = await response.text()
            console.error('服务器错误响应:', errorText)
            throw new Error(`生成请求失败: ${response.status}, ${errorText}`)
          }

          const result = await response.json()
          console.log('生成结果:', result)

          if (result.status !== 'success') {
            throw new Error(`生成状态异常: ${result.status}`)
          }

          if (!result.outputs || result.outputs.length === 0) {
            throw new Error('没有返回输出图片')
          }

          // 修改图片URL构建，使用代理处理
          const lastImagePath = result.outputs[result.outputs.length - 1]
          const imageUrl = lastImagePath
          console.log('设置生成图片URL:', imageUrl)

          // 预加载图片
          const img = new Image()
          console.log('开始预加载图片...')

          // 设置加载超时
          const imgLoadTimeout = setTimeout(() => {
            console.error('图片加载超时!')
            img.src = '' // 中止当前加载
            showToast({
              message: '图片加载超时，请重试',
              type: 'fail'
            })
          }, 30000) // 30秒超时

          // 显示预加载提示
          const preloadToast = showLoadingToast({
            message: '正在加载图片...',
            forbidClick: true,
            duration: 0
          })

          // 定义加载成功处理
          img.onload = function() {
            clearTimeout(imgLoadTimeout)
            preloadToast.close()
            
            console.log('图片预加载成功！尺寸:', img.width, 'x', img.height)
            generatedImage.value = imageUrl
            
            console.log('成功更新UI显示生成图片')
            
            showToast({
              message: '生成成功！',
              type: 'success',
              position: 'bottom'
            })
          }

          // 定义加载失败处理
          img.onerror = function(err) {
            clearTimeout(imgLoadTimeout)
            preloadToast.close()
            
            console.error('图片预加载失败:', err)
            console.error('失败URL:', imageUrl)
            
            // 尝试验证URL是否可访问
            fetch(imageUrl, { method: 'HEAD' })
              .then(response => {
                console.log('URL可访问性检查:', response.status, response.statusText)
                console.log('Content-Type:', response.headers.get('Content-Type'))
              })
              .catch(fetchErr => {
                console.error('URL不可访问:', fetchErr)
              })
            
            showToast({
              message: '图片加载失败，请重试',
              type: 'fail'
            })
          }

          // 开始加载图片
          img.src = imageUrl
          console.log('已设置图片源，等待加载完成...')

        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            throw new Error('请求超时，请重试')
          }
          throw fetchError
        } finally {
          clearTimeout(timeoutId)
        }

        return
      }
      
      // 以下是快速生成模式的逻辑
      // 准备图片数据
      const imageData = simpleImage.value
      if (!imageData || !imageData.file) {
        throw new Error('图片数据无效')
      }
      
      console.log('准备上传图片:', imageData.file.name, imageData.file.type, imageData.file.size)
      
      // 创建FormData - 严格按照服务器接口要求
      const formData = new FormData()
      formData.append('workflow_type', 'fastbd')  // 使用单图模式
      formData.append('image', imageData.file, imageData.file.name)
      formData.append('username', 'testuser')
      formData.append('prompt', prompt.value.trim())
      formData.append('output_format', 'url')
      
      console.log('请求参数设置完成，开始发送请求...')
      console.log('FormData内容:', {
        workflow_type: 'fastbd',
        image: imageData.file.name,
        username: 'testuser',
        prompt: prompt.value.trim(),
        output_format: 'url'
      })
      
      // 发送请求到服务器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1200000)
      
      try {
        const response = await fetch('/generate', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        })
        
        // 清除超时器
        clearTimeout(timeoutId)
        
        console.log('服务器响应状态:', response.status)
        console.log('响应头:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('服务器错误响应:', errorText)
          throw new Error(`生成请求失败: ${response.status}, ${errorText}`)
        }
        
        const result = await response.json()
        console.log('生成结果:', result)
        
        if (result.status !== 'success') {
          throw new Error(`生成状态异常: ${result.status}`)
        }
        
        if (!result.outputs || result.outputs.length === 0) {
          throw new Error('没有返回输出图片')
        }
        
        // 修改图片URL构建，使用代理处理
        const lastImagePath = result.outputs[result.outputs.length - 1]
        const imageUrl = lastImagePath
        console.log('设置生成图片URL:', imageUrl)
        
        // 预加载图片
        const img = new Image()
        console.log('开始预加载图片...')
        
        // 设置加载超时
        const imgLoadTimeout = setTimeout(() => {
          console.error('图片加载超时!')
          img.src = '' // 中止当前加载
          showToast({
            message: '图片加载超时，请重试',
            type: 'fail'
          })
        }, 30000)
        
        // 显示预加载提示
        const preloadToast = showLoadingToast({
          message: '正在加载图片...',
          forbidClick: true,
          duration: 0
        })
        
        // 定义加载成功处理
        img.onload = function() {
          clearTimeout(imgLoadTimeout)
          preloadToast.close()
          
          console.log('图片预加载成功！尺寸:', img.width, 'x', img.height)
          generatedImage.value = imageUrl
          
          console.log('成功更新UI显示生成图片')
          
          showToast({
            message: '生成成功！',
            type: 'success',
            position: 'bottom'
          })
        }
        
        // 定义加载失败处理
        img.onerror = function(err) {
          clearTimeout(imgLoadTimeout)
          preloadToast.close()
          
          console.error('图片预加载失败:', err)
          console.error('失败URL:', imageUrl)
          
          // 尝试验证URL是否可访问
          fetch(imageUrl, { method: 'HEAD' })
            .then(response => {
              console.log('URL可访问性检查:', response.status, response.statusText)
              console.log('Content-Type:', response.headers.get('Content-Type'))
            })
            .catch(fetchErr => {
              console.error('URL不可访问:', fetchErr)
            })
          
          showToast({
            message: '图片加载失败，请重试',
            type: 'fail'
          })
        }
        
        // 开始加载图片
        img.src = imageUrl
        console.log('已设置图片源，等待加载完成...')
        
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('请求超时，请重试')
        }
        throw fetchError
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('图片生成测试失败:', error.message)
      showToast({
        message: `生成失败: ${error.message}`,
        type: 'fail'
      })
    } finally {
      // 关闭加载提示
      loadingToast.close()
    }
  } catch (error) {
    console.error('生成图片失败:', error)
    showToast({
      message: `操作失败: ${error.message}`,
      type: 'fail'
    })
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = async () => {
  if (!generatedImage.value) return
  
  try {
    // 图片URL可能是相对路径，需要完整URL
    const fullUrl = generatedImage.value.startsWith('http') 
      ? generatedImage.value 
      : window.location.origin + generatedImage.value
      
    const response = await fetch(fullUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `智绘家居_${new Date().getTime()}.jpg`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    showToast({
      message: '图片已下载',
      position: 'bottom'
    })
  } catch (error) {
    console.error('下载图片失败:', error)
    showToast({
      message: '下载失败，请重试',
      type: 'fail'
    })
  }
}

// 分享图片
const shareImage = async () => {
  if (!generatedImage.value) return
  
  try {
    // 确保使用完整URL
    const fullUrl = generatedImage.value.startsWith('http') 
      ? generatedImage.value 
      : window.location.origin + generatedImage.value
      
    if (navigator.share) {
      // 原生分享API
      const response = await fetch(fullUrl)
      const blob = await response.blob()
      const file = new File([blob], `智绘家居_${new Date().getTime()}.jpg`, { type: blob.type })
      
      await navigator.share({
        title: '智绘家居设计',
        text: '查看我用智绘家居生成的创意设计！',
        files: [file]
      })
    } else {
      // 复制图片链接
      await navigator.clipboard.writeText(fullUrl)
      showToast({
        message: '图片链接已复制到剪贴板',
        position: 'bottom'
      })
    }
  } catch (error) {
    console.error('分享图片失败:', error)
    showToast({
      message: '分享失败，请重试',
      type: 'fail'
    })
  }
}

// 显示购物车商品选择弹窗
const showCartItems = () => {
  loadCartItems() // 每次打开弹窗时重新加载数据
  cartSearchQuery.value = ''
  cartSelectVisible.value = true
}

// 关闭购物车商品选择弹窗
const closeCartSelect = () => {
  cartSelectVisible.value = false
}

// 选择购物车商品
const selectCartItem = async (item) => {
  try {
    console.log('选择的商品:', item)
    
    // 输入验证
    if (!item || !item.name) {
      console.error('无效的商品数据')
      showToast({
        message: '商品数据无效',
        type: 'fail'
      })
      return
    }
    
    // 首先显示加载状态
    const loadingToast = showLoadingToast({
      message: '正在加载商品图片...',
      forbidClick: true,
      duration: 0
    })
    
    try {
      // 如果商品已有图片URL，则直接使用
      if (item.imageUrl) {
        console.log('使用现有商品图片URL:', item.imageUrl)
        
        try {
          // 从URL加载图片
          const response = await fetch(item.imageUrl)
          const blob = await response.blob()
          const file = new File([blob], `${item.name}.jpg`, { type: 'image/jpeg' })
          
          // 创建缩略图
          const processed = {
            file,
            preview: item.imageUrl,
            dimensions: { width: 400, height: 400 },
            productInfo: { ...item }
          }
          
          // 设置为替换家具图片
          replaceImages.value = replaceImages.value.map((img, idx) => 
            idx === 1 ? processed : img
          )
          
          loadingToast.close()
          showToast({
            message: `已选择 ${item.name}`,
            position: 'bottom'
          })
          
          closeCartSelect()
          
          if (replaceImages.value[0] !== null) {
            setTimeout(() => {
              showToast({
                message: '家具替换准备就绪，可以点击"立即生成"',
                position: 'bottom'
              })
            }, 1000)
          } else {
            setTimeout(() => {
              showToast({
                message: '请上传原始家居图片',
                position: 'bottom'
              })
            }, 1000)
          }
          
          return
        } catch (imgError) {
          console.error('加载现有图片URL失败，将创建替代图像:', imgError)
        }
      }
      
      // 模拟创建图像数据
      const placeholderCanvas = document.createElement('canvas')
      const ctx = placeholderCanvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('无法创建Canvas上下文')
      }
      
      placeholderCanvas.width = 400
      placeholderCanvas.height = 400
      
      // 绘制一个渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 400, 400)
      gradient.addColorStop(0, '#f8f4eb')
      gradient.addColorStop(1, '#e5dfd3')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 400, 400)
      
      // 绘制边框
      ctx.strokeStyle = '#dccfbf'
      ctx.lineWidth = 10
      ctx.strokeRect(10, 10, 380, 380)
      
      // 在中心绘制商品名称首字母
      ctx.fillStyle = '#3c2913'
      ctx.font = 'bold 160px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.name.charAt(0), 200, 180)
      
      // 在下方绘制商品名称
      ctx.font = 'bold 36px Arial'
      
      // 截断过长的商品名
      let displayName = item.name
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 10) + '...'
      }
      
      ctx.fillText(displayName, 200, 300)
      
      // 创建一个模拟文件对象
      const dataUrl = placeholderCanvas.toDataURL('image/jpeg', 0.9)
      console.log('生成的图片数据URL长度:', dataUrl.length)
      
      // 从DataURL中提取Base64数据
      const base64Data = dataUrl.split(',')[1]
      
      if (!base64Data) {
        throw new Error('生成的图片数据无效')
      }
      
      // 转换Base64为Blob
      const byteCharacters = atob(base64Data)
      const byteArrays = []
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i))
      }
      
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' })
      console.log('Blob大小:', blob.size, 'bytes')
      
      if (blob.size === 0) {
        throw new Error('生成的Blob大小为0')
      }
      
      // 创建File对象
      const file = new File([blob], `${item.name}.jpg`, { type: 'image/jpeg' })
      
      // 创建商品图像缩略图
      const processed = {
        file,
        preview: dataUrl,
        dimensions: { width: 400, height: 400 },
        productInfo: { ...item } // 保存商品信息以便在生成过程中使用
      }
      
      console.log('图片处理完成，准备设置替换家具图片')
      
      // 设置为替换家具图片
      replaceImages.value = replaceImages.value.map((img, idx) => 
        idx === 1 ? processed : img
      )
      
      console.log('替换家具图片已设置:', replaceImages.value[1] !== null)
      
      // 不再自动添加提示词
      
      // 关闭加载提示
      loadingToast.close()
      
      // 显示成功提示
      showToast({
        message: `已选择 ${item.name}`,
        position: 'bottom'
      })
      
      // 关闭弹窗
      closeCartSelect()
      
      // 如果原始家居图也已上传，可以建议用户直接生成
      if (replaceImages.value[0] !== null) {
        // 轻微延迟，让用户看到图像已加载
        setTimeout(() => {
          showToast({
            message: '家具替换准备就绪，可以点击"立即生成"',
            position: 'bottom'
          })
        }, 1000)
      } else {
        // 提示用户上传原始图片
        setTimeout(() => {
          showToast({
            message: '请上传原始家居图片',
            position: 'bottom'
          })
        }, 1000)
      }
    } catch (innerError) {
      console.error('图片处理过程中出错:', innerError)
      loadingToast.close()
      
      // 确保在备用方案中也不添加提示词
      try {
        console.log('使用备用方案生成图片')
        
        // 创建简单的纯色背景图像
        const simpleCanvas = document.createElement('canvas')
        simpleCanvas.width = 200
        simpleCanvas.height = 200
        const simpleCtx = simpleCanvas.getContext('2d')
        
        if (!simpleCtx) {
          throw new Error('无法创建简单Canvas上下文')
        }
        
        // 绘制背景
        simpleCtx.fillStyle = '#e5dfd3'
        simpleCtx.fillRect(0, 0, 200, 200)
        
        // 绘制文字
        simpleCtx.fillStyle = '#3c2913'
        simpleCtx.font = '80px Arial'
        simpleCtx.textAlign = 'center'
        simpleCtx.textBaseline = 'middle'
        simpleCtx.fillText(item.name.charAt(0), 100, 100)
        
        const simpleDataUrl = simpleCanvas.toDataURL('image/jpeg', 0.8)
        
        // 将DataURL转换为Blob
        const simpleBase64 = simpleDataUrl.split(',')[1]
        const simpleByteCharacters = atob(simpleBase64)
        const simpleByteArray = new Uint8Array(simpleByteCharacters.length)
        
        for (let i = 0; i < simpleByteCharacters.length; i++) {
          simpleByteArray[i] = simpleByteCharacters.charCodeAt(i)
        }
        
        // 创建Blob对象
        const simpleBlob = new Blob([simpleByteArray], { type: 'image/jpeg' })
        
        // 创建一个简单的File对象
        const simpleFile = new File([simpleBlob], `${item.name}.jpg`, { type: 'image/jpeg' })
        
        // 创建简单的商品图像对象
        const simplePlaceholder = {
          file: simpleFile,
          preview: simpleDataUrl,
          dimensions: { width: 200, height: 200 },
          productInfo: { ...item }
        }
        
        // 设置为替换家具图片
        replaceImages.value = replaceImages.value.map((img, idx) => 
          idx === 1 ? simplePlaceholder : img
        )
        
        console.log('使用备用方案设置替换家具图片成功')
        
        // 不再自动添加提示词
        
        showToast({
          message: `已选择 ${item.name}`,
          position: 'bottom'
        })
        
        closeCartSelect()
      } catch (fallbackError) {
        console.error('备用图片处理方案也失败:', fallbackError)
        showToast({
          message: '无法处理图片，请重试',
          type: 'fail'
        })
      }
    }
  } catch (error) {
    console.error('选择购物车商品失败:', error)
    showToast({
      message: '选择商品失败，请重试',
      type: 'fail'
    })
  }
}

// 跳转到商城
const goToStore = () => {
  router.push('/store')
}

// 初始化草稿和购物车数据
onMounted(() => {
  const draft = localStorage.getItem('draft_prompt')
  if (draft) prompt.value = draft
  
  // 加载购物车数据
  loadCartItems()
  
  // 添加 storage 事件监听
  window.addEventListener('storage', handleStorageChange)
})

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// 筛选购物车商品
const filterCartItems = () => {
  const query = cartSearchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredCartProducts.value = [...cartProducts.value]
    return
  }
  
  filteredCartProducts.value = cartProducts.value.filter(item => 
    item.name.toLowerCase().includes(query) || 
    (item.description && item.description.toLowerCase().includes(query))
  )
}

// 处理窗口大小变化
const handleResize = () => {
  const newIsMobile = window.innerWidth <= 768
  const newIsDesktop = window.innerWidth > 768
  
  // 如果从移动端切换到桌面端，或从桌面端切换到移动端
  if (isMobile.value !== newIsMobile || isDesktop.value !== newIsDesktop) {
    isMobile.value = newIsMobile
    isDesktop.value = newIsDesktop
    
    // 更新事件监听器
    if (isDesktop.value) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mousemove', handleMouseMove)
    } else {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
    
    // 重置功能位置
    trackPosition.value = -activeFunction.value * 50
  }
}

// 添加鼠标拖动相关的变量
const isDragging = ref(false)
const mouseStartX = ref(0)

// 鼠标按下事件处理
const handleMouseDown = (e) => {
  // 只在桌面端处理
  if (!isDesktop.value) return
  
  // 阻止默认行为
  e.preventDefault()
  
  // 设置拖动状态
  isDragging.value = true
  mouseStartX.value = e.clientX
}

// 鼠标移动事件处理
const handleMouseMove = (e) => {
  // 如果不在拖动状态或不是桌面端，则不处理
  if (!isDragging.value || !isDesktop.value) return
  
  // 计算移动距离，并转换为百分比
  const delta = e.clientX - mouseStartX.value
  
  // 只处理足够大的移动距离
  if (Math.abs(delta) > 20) {
    // 确定新的功能索引
    const direction = delta > 0 ? -1 : 1
    const newIndex = Math.min(Math.max(activeFunction.value + direction, 0), functions.value.length - 1)
    
    // 如果索引变化了，设置过渡效果并更新状态
    if (newIndex !== activeFunction.value) {
      transitionName.value = newIndex > activeFunction.value ? 'slide-left' : 'slide-right'
      activeFunction.value = newIndex
      trackPosition.value = -newIndex * 50
    }
    
    // 停止拖动
    isDragging.value = false
  }
}

// 鼠标释放事件处理
const handleMouseUp = () => {
  // 停止拖动
  isDragging.value = false
}

// 添加润色相关的状态
const isPolishing = ref(false)
const showRevertButton = ref(false)
const originalPrompt = ref('')

// 润色提示词
const polishPrompt = async () => {
  if (!prompt.value) {
    showToast('请输入提示词', 'error');
    return;
  }
  
  if (isPolishing.value) {
    showToast('正在润色中，请稍候', 'warning');
    return;
  }
  
  isPolishing.value = true;
  const toast = showToast('正在润色中...', 'loading');
  
  try {
    const response = await fetch(buildUrl(AI_API_BASE_URL, '/api/polish'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt.value })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('润色失败:', {
        status: response.status,
        error: errorData
      });
      showToast(errorData.error || '润色失败，请稍后再试', 'error');
      return;
    }
    
    const data = await response.json();
    if (data.polished_prompt) {
      originalPrompt.value = prompt.value;
      prompt.value = data.polished_prompt;
      showRevertButton.value = true;
      showToast('润色完成', 'success');
    } else {
      showToast('润色失败，返回数据格式错误', 'error');
    }
  } catch (error) {
    console.error('润色请求异常:', error);
    showToast('润色失败，请稍后再试', 'error');
  } finally {
    isPolishing.value = false;
    toast.close();
  }
};

// 取消润色
const revertPrompt = () => {
  if (originalPrompt.value) {
    prompt.value = originalPrompt.value
    showRevertButton.value = false
    showToast({
      message: '已恢复原始提示词',
      type: 'success'
    })
  }
}

// 监听 localStorage 变化
const handleStorageChange = (e) => {
  if (e.key === 'cartItems') {
    loadCartItems()
  }
}

const isGettingAIReview = ref(false)
const aiReview = ref('')
const loading = ref(false)

const getAIReview = async () => {
  if (!replaceImages.value || !replaceImages.value.length || !replaceImages.value[0]) {
    showToast({ message: '请先上传家居图片', type: 'fail' })
    return
  }

  try {
    loading.value = true
    const imageUrl = replaceImages.value[0].preview
    if (!imageUrl) {
      showToast({ message: '图片预览地址无效', type: 'fail' })
      return
    }

    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'home_image.jpg', { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('file', file)

    const result = await fetch(buildUrl(AI_API_BASE_URL, '/api/openai_review'), {
      method: 'POST',
      body: formData
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || '获取AI评价失败')
    }

    const data = await result.json()
    aiReview.value = data.review
    showToast({ message: 'AI评价获取成功', type: 'success' })
  } catch (error) {
    console.error('获取AI评价失败:', error)
    showToast({ message: error.message || '获取AI评价失败', type: 'fail' })
  } finally {
    loading.value = false
  }
}

// 选择功能
const selectFunction = (index) => {
  if (index === activeFunction.value) return
  
  transitionName.value = index > activeFunction.value ? 'slide-left' : 'slide-right'
  activeFunction.value = index
  
  // 在移动端，确保被选中的功能项可见
  if (isMobile.value) {
    // 使用setTimeout确保DOM已更新
    setTimeout(() => {
      const functionItems = document.querySelectorAll('.function-item')
      if (functionItems && functionItems[index]) {
        functionItems[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    }, 100)
  } else {
    // 桌面端使用trackPosition
    trackPosition.value = -index * 50
  }
}

// 添加拖拽购物车商品的功能
const dragCartItem = (event, item) => {
  console.log('开始拖拽商品:', item.name)
  event.dataTransfer.setData('application/json', JSON.stringify(item))
  // 添加拖拽样式
  event.target.closest('.cart-product-item').classList.add('dragging')
  
  // 当拖拽结束时移除样式
  event.target.addEventListener('dragend', () => {
    event.target.closest('.cart-product-item').classList.remove('dragging')
  }, { once: true })
}

// 处理拖拽经过替换家具区域的效果
const handleDragOver = () => {
  isDraggingOver.value = true
}

// 处理拖拽离开替换家具区域的效果
const handleDragLeave = () => {
  isDraggingOver.value = false
}

// 放置购物车商品到替换家具区域
const dropCartItem = async (event) => {
  isDraggingOver.value = false
  
  try {
    const itemData = event.dataTransfer.getData('application/json')
    if (!itemData) return
    
    const item = JSON.parse(itemData)
    console.log('放置商品到替换家具区:', item)
    
    // 调用已有的选择商品方法
    await selectCartItem(item)
  } catch (error) {
    console.error('放置商品失败:', error)
    showToast({
      message: '放置商品失败，请重试',
      type: 'fail'
    })
  }
}
</script>

<style scoped>
/* 设置全局主题色变量 */
:root {
  --primary-color: #3c2913;
  --primary-light: rgba(60, 41, 19, 0.1);
  --primary-dark: #2a1d0f;
  --accent-color: #f0c674;
  --text-primary: #303133;
  --text-secondary: #606266;
  --bg-light: #f4f1ec;  /* 更新背景色 */
  --bg-white: #ffffff;
  --border-color: #dccfbf;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
}

/* 原有样式保持不变，但使用新的变量 */
.home-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100vw;
  position: relative;
  min-height: 100vh;
  background: var(--bg-light);
  display: flex;
  position: relative;
  overflow-x: hidden;
  margin-top: -60px;
}

.main-content {
  padding: 0;
  width: 100%;
  max-width: 100vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  background-color: var(--bg-light) !important;
}

/* 卡片样式优化 */
.upload-box, .download-box, .prompt-section, .review-box, .input-section {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.upload-box:hover, .download-box:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 优化按钮样式 */
.generate-btn, .get-ai-review-btn, .polish-btn, .checkout-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.generate-btn:hover:not(:disabled), .get-ai-review-btn:hover:not(:disabled), 
.polish-btn:hover:not(:disabled), .checkout-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.generate-btn:active:not(:disabled), .get-ai-review-btn:active:not(:disabled),
.polish-btn:active:not(:disabled), .checkout-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-btn:disabled, .get-ai-review-btn:disabled, .polish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 按钮里的图标动画 */
.generate-btn i, .get-ai-review-btn i, .polish-btn i {
  transition: transform 0.4s ease;
}

.generate-btn:hover:not(:disabled) i, .get-ai-review-btn:hover:not(:disabled) i, 
.polish-btn:hover:not(:disabled) i {
  transform: rotate(15deg);
}

/* 优化上传框样式 */
.upload-box {
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  opacity: 0.8;
  position: relative;
  margin: 6px;
  height: 300px;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box:hover {
  opacity: 1;
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.upload-box.replace-mode,
.upload-box.simple-mode {
  height: 300px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
}

.upload-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  opacity: 0.7;
  transition: all var(--transition-normal);
}

.upload-box:hover .upload-placeholder i {
  opacity: 1;
  transform: scale(1.1);
}

/* 优化顶部导航栏 */
.top-header {
  background: linear-gradient(to right, var(--bg-white), #f5f2ed);
  border-bottom: 1px solid rgba(220, 207, 191, 0.3);
}

.header-left h1 {
  background: linear-gradient(to right, #3c2913, #8a7350);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

/* 优化功能切换栏 */
.function-bar {
  background: linear-gradient(to bottom, var(--bg-white), #f5f2ed);
  border-radius: var(--radius-sm);
  margin-top: 20px;
}

.function-item {
  position: relative;
  transition: all var(--transition-normal);
}

.function-item.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--primary-color);
  border-radius: 2px;
}

/* 优化文本输入框 */
textarea {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(60, 41, 19, 0.1);
  outline: none;
}

/* 优化结果预览区域 */
.output-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(145deg, #f8f8f8, #ffffff);
  border-radius: var(--radius-md);
}

.download-placeholder {
  text-align: center;
  padding: 2rem;
}

.download-placeholder i {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: var(--border-color);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.result-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
  transition: transform var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

/* 优化工具栏按钮 */
.toolbar button {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar button:hover {
  transform: translateY(-3px) rotate(5deg);
  box-shadow: var(--shadow-md);
  background: var(--primary-color);
  color: white;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 优化侧边栏样式 */
.sidebar {
  background: linear-gradient(to bottom, #f7f4f0, #e9e2d8);
  border-right: 1px solid rgba(220, 207, 191, 0.5);
}

.sidebar-header {
  padding: 1.2rem;
  background: rgba(60, 41, 19, 0.06);
}

.sidebar-header h3 {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0;
}

/* 优化购物车商品样式 */
.cart-product-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  transition: all var(--transition-normal);
}

.cart-product-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.cart-product-image {
  overflow: hidden;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.cart-product-img {
  transition: transform 0.5s ease;
}

.cart-product-item:hover .cart-product-img {
  transform: scale(1.05);
}

.cart-product-name {
  font-weight: 500;
  color: var(--text-primary);
}

.cart-product-price {
  background: linear-gradient(to right, #ff6b00, #ff9500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

/* 优化评论区 */
.review-box {
  background: linear-gradient(to bottom, var(--bg-white), #f5f2ed);
}

.review-content {
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-color);
}

.ai-review-text {
  position: relative;
  padding-left: 5px;
  font-style: italic;
  color: var(--text-primary);
}

.ai-review-text::before {
  content: '"';
  position: absolute;
  left: -15px;
  top: -5px;
  font-size: 24px;
  color: var(--primary-color);
  opacity: 0.5;
}

.ai-review-text::after {
  content: '"';
  position: absolute;
  right: -5px;
  bottom: -15px;
  font-size: 24px;
  color: var(--primary-color);
  opacity: 0.5;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header-left h1 {
    font-size: 1.1rem;
  }
  
  .upload-box {
    height: 160px;
  }
  
  .combined-upload {
    flex-direction: column;
    gap: 12px;
  }
  
  .prompt-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .generate-btn, .polish-btn {
    height: 44px;
  }
  
  .download-placeholder i {
    font-size: 2.5rem;
  }
}

/* 加载动画 */
.loading-dots::after {
  content: '...';
  animation: dots 1.5s steps(5, end) infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* 新增3D悬浮效果 */
.upload-box, .download-box, .review-box {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.upload-box:hover, .download-box:hover, .review-box:hover {
  transform: translateY(-5px) rotateX(2deg) rotateY(2deg);
}

/* 自定义动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-product-item, .upload-box, .download-box, .review-box {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.1s);
}

/* 自定义高光效果 */
.generate-btn::before, .get-ai-review-btn::before, .polish-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  transition: transform 0.7s;
  opacity: 0;
}

.generate-btn:hover::before, .get-ai-review-btn:hover::before, .polish-btn:hover::before {
  transform: rotate(30deg) translate(50%, 50%);
  opacity: 1;
}

.sidebar {
  position: fixed;
  left: -250px;
  top: 0;
  width: 250px;
  height: 100%;
  background: #e4d8cc;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
  z-index: 1000;
}

.sidebar.active {
  left: 0;
}

.desktop-sidebar {
  position: relative;
  left: 0;
  flex-shrink: 0;
  height: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.sidebar-menu {
  padding: 1rem;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-active {
  background-color: rgba(60, 41, 19, 0.05);
  color: var(--primary-color);
}

.sidebar-menu i {
  margin-right: 12px;
  width: 20px;
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  background: linear-gradient(to top, #f3eadd, #f8f9fa);
}

.top-nav i {
  font-size: 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
}

.image-upload-container {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
@media (max-width: 768px) {
  .download-box {
    height: 300px;
    margin: 0 10px;
  }
  .result-image:hover {
    transform: scale(1.03);
    cursor: zoom-in;
  }

  .result-image.zoomed {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    max-width: 90vw;
    max-height: 90vh;
    z-index: 1000;
    cursor: zoom-out;
  }
  .result-image {
    max-width: 120%;
  }
}

.upload-box {
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  opacity: 0.8;
  position: relative;
  margin: 6px;
  height: 300px;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box:hover {
  opacity: 1;
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.upload-box.replace-mode,
.upload-box.simple-mode {
  height: 300px;
}

.download-box {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-top: 16px;
}

.output-preview {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .upload-box,
  .upload-box.simple-mode,
  .upload-box.replace-mode {
    height: 200px;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
  }
  
  .output-preview {
    height: 200px;
  }
  
  .combined-upload {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .download-box {
    margin-left: 6px;
    margin-right: 6px;
  }
}

.download-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--text-secondary);
}

.download-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.download-placeholder p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .upload-box {
    height: 200px;
  }

  .download-placeholder i {
    font-size: 2.5rem;
  }
  
  .download-placeholder p {
    font-size: 0.8rem;
  }
}

.upload-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

input[type="file"] {
  display: none;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  resize: none;
  margin-bottom: 1rem;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.generate-btn:hover {
  background: linear-gradient(to right, var(--primary-color), #5a4127);
  box-shadow: 0 6px 16px rgba(60, 41, 19, 0.3);
}

.generate-btn:active {
  transform: scale(0.96);
}

.generate-btn:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  animation: btn-ripple 0.6s ease-out;
}

@keyframes btn-ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #a0a0a0;
  box-shadow: none;
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
}

@media (max-width: 768px) {
  .upload-box {
    height: 200px;
  }
}

.placeholder-content {
  display: flex; /* 使用 Flexbox 布局 */
  flex-direction: column; /* 设置主轴为垂直方向 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  padding: 2rem;
  color: var(--text-color);
  opacity: 0.8;
  border-radius: 12px;
}

.function-track {
  display: flex;
  position: absolute;
  width: 200%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.function-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--text-secondary);
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  will-change: transform;
}

.function-item.active {
  color: var(--primary-color);
}

/* 布局优化 */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 50vh;
  padding-bottom: 20px; /* 添加底部内边距 */
}

.input-section {
  flex: 1;
  position: relative;
  width: 100%;
  margin: 0;
}

.combined-upload {
  display: flex;
  gap: 0.5rem;
  height: 140px;
  width: 100%;
}

.simple-upload {
  height: 140px;
  display: flex;
  justify-content: center;
}

.download-box {
  width: 100%;
  min-height: 280px; /* 改为最小高度 */
  margin: 0.3rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .download-box {
    min-height: 240px; /* 改为最小高度 */
    margin: 0 10px;
  }
}

.upload-box {
  background: #fff;
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
}

.output-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.result-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.toolbar {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.toolbar button {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.toolbar button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.prompt-section {
  margin-top: auto;
  padding: 1rem;
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .combined-upload {
    height: 120px;
  }

  .simple-upload {
    height: 120px;
  }

  .download-box {
    height: 240px; /* 移动端固定高度 */
  }
}

/* 性能优化相关 */
input[type="file"] {
  display: none;
}

img {
  content-visibility: auto;
}

.menu-button {
  display: none;
}

/* 修改顶部标签栏样式 */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0;
  margin-left: 20px; /* 左移智绘家居字样 */
}

.header-right {
  margin-right: 20px; /* 右移右侧字样 */
}

.menu-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.header-left h1 {
  font-size: 1.2rem;
  color: #000;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .top-header {
    padding: 12px 16px;
  }

  .header-left {
    margin-left: 10px; /* 移动端左移距离 */
  }

  .header-right {
    margin-right: 10px; /* 移动端右移距离 */
  }

  .header-left h1 {
    font-size: 1.1rem;
  }
  .combined-upload[data-v-2dc54a20] {
    height: 500px;
  }
}

.scroll-hint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.scroll-hint.left {
  left: 10px;
}

.scroll-hint.right {
  right: 10px;
}

.scroll-hint i {
  color: var(--primary-color);
  font-size: 1.2rem;
  animation: arrowPulse 1.5s infinite;
}

@keyframes arrowPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@media (max-width: 768px) {
  .scroll-hint {
    width: 30px;
    height: 30px;
  }

  .function-bar[data-v-2dc54a20] {
    position: sticky;
    top: 110px;
    background: white;
    padding: 0;
    z-index: 5;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .scroll-hint i {
    font-size: 1rem;
  }
  
  .scroll-hint.left {
    left: 5px;
  }
  
  .scroll-hint.right {
    right: 5px;
  }
}

/* 从购物车导入按钮样式 */
.import-from-cart {
  margin-top: 10px;
  padding: 12px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.import-from-cart:hover {
  background: rgba(220, 207, 191, 0.3);
  transform: translateY(-2px);
}

.import-from-cart i {
  font-size: 20px;
  color: var(--primary-color);
  margin-right: 10px;
  transition: transform 0.3s;
}

.import-from-cart:hover i {
  transform: rotate(15deg);
}

.import-from-cart.replace-mode {
  border-color: #b9a88a;
  background: rgba(244, 240, 232, 0.9);
}

.import-from-cart.replace-mode i {
  color: #8a7350;
}

.import-from-cart.replace-mode:hover i {
  transform: rotate(180deg);
}

.import-from-cart p {
  margin: 0;
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

/* 购物车商品选择弹窗样式 */
.cart-select-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 92%;
  max-width: 420px;
  max-height: 85vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--primary-color);
}

.modal-header i {
  font-size: 20px;
  cursor: pointer;
  color: var(--primary-color);
  transition: transform 0.2s;
  padding: 8px;
}

.modal-header i:hover {
  transform: rotate(90deg);
}

.cart-search-box {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  background: #f9f9f9;
}

.cart-search-box i {
  color: #999;
  margin-right: 10px;
}

.cart-search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  padding: 8px 0;
}

.cart-items-list {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  max-height: 50vh;
}

.cart-product-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  position: relative;
}

.cart-product-item:hover {
  background: #f9f9f9;
}

.cart-product-item:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

.cart-product-image {
  width: 64px;
  height: 64px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  flex-shrink: 0;
  border: 1px solid #eee;
  overflow: hidden;
}

.cart-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cart-product-name {
  font-size: 16px;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.cart-product-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}

.cart-product-price {
  font-size: 15px;
  color: #ff6b00;
  font-weight: 500;
}

.select-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  opacity: 0;
  transition: opacity 0.2s;
}

.cart-product-item:hover .select-indicator {
  opacity: 0.5;
}

.empty-cart-notice {
  padding: 40px 20px;
  text-align: center;
}

.empty-cart-notice i {
  font-size: 40px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-cart-notice p {
  margin-bottom: 20px;
  color: #999;
}

.empty-cart-notice button {
  padding: 8px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-cart-notice button:hover {
  background: #2a1d0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* 底部按钮区域 */
.cart-modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

/* 适配移动设备 */
@media (max-width: 480px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    height: 80vh;
    border-radius: 12px 12px 0 0;
    position: fixed;
    bottom: 0;
    top: auto;
    animation: slideInBottom 0.3s ease;
  }
  
  @keyframes slideInBottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  .cart-items-list {
    max-height: none;
  }
}

.cart-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 8px;
}

/* 桌面端布局优化 */
/* 桌面端布局优化 - 替换原有@media (min-width: 769px)部分 */
@media (min-width: 769px) {
  .home-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f6f2 0%, #e9e4db 100%);  /* 新的渐变背景 */
    overflow: hidden;
    padding-top: 20px; /* 减小顶部内边距 */
    padding-bottom: 0; /* 减小底部内边距 */
    position: relative;
    overflow-x: hidden;
    margin-top: -20px; /* 桌面端也保持相同的上移距离 */
  }

  .top-header.mobile-only {
    display: none;
  }

  .sidebar {
    width: 300px;
    height: calc(100vh - 80px);
    position: fixed;
    left: 0;
    top: 80px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f6f2 100%);  /* 更新侧边栏背景 */
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08);
    padding: 1.5rem 0;
    transition: all 0.3s;
    z-index: 10;
    border-right: 1px solid #f0f0f0;
    overflow-y: auto;
  }

  .cart-sidebar-content {
    padding: 1rem;
    height: calc(100% - 60px);
    overflow-y: auto;
  }

  .cart-items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cart-product-item {
    display: flex;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .cart-product-item:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }

  .cart-product-image {
    width: 80px;
    height: 80px;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 1rem;
    flex-shrink: 0;
  }

  .cart-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .cart-product-name {
    font-size: 1rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .cart-product-desc {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .cart-product-price {
    font-size: 1.1rem;
    color: #ff6b00;
    font-weight: 500;
  }

  .empty-cart-notice {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .empty-cart-notice i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 1rem;
  }

  .empty-cart-notice p {
    color: #999;
    margin-bottom: 1.5rem;
  }

  .empty-cart-notice button {
    padding: 0.8rem 1.5rem;
    background: #3c2913;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .empty-cart-notice button:hover {
    background: #2a1d0f;
    transform: translateY(-2px);
  }

  /* 隐藏桌面端的导入按钮 */
  .import-from-cart {
    display: none;
  }

  .sidebar-header {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .sidebar-menu {
    padding: 1rem 1.5rem;
  }

  .sidebar-menu a {
    padding: 0.8rem 1rem;
    margin: 0.5rem 0;
    border-radius: 6px;
    font-size: 0.95rem;
  }

  .main-content {
    flex: 1;
    margin-left: 300px;
    padding: 2rem 3rem;
    max-width: calc(100% - 300px);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 0; /* 移除顶部margin，因为已经在container中设置了 */
  }

  .function-bar {
    position: sticky;
    top: 80px; /* 固定在顶部导航栏下方 */
    background: linear-gradient(to right, rgba(255,255,255,0.95), rgba(248,246,242,0.95)) !important;  /* 更新功能栏背景 */
    backdrop-filter: blur(10px);
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    height: 60px;
    z-index: 5; /* 确保在内容之上，但在顶部导航栏之下 */
  }

  .function-track {
    display: flex;
    position: relative;
    width: auto;
    height: auto;
    transform: none !important;
  }

  .function-item {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    color: #666;
    border-radius: 6px;
    transition: all 0.3s;
    border-bottom: none;
  }

  .function-item.active {
    color: #3c2913;
    background: rgba(60, 41, 19, 0.1);
    font-weight: 500;
  }

  .scroll-hint {
    display: none;
  }

  .content-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 0;
    flex: 1;
  }

  .input-section {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  .combined-upload {
    display: flex;
    gap: 1.5rem;
    height: 280px;
  }

  .simple-upload {
    height: 280px;
  }

  .upload-box {
    height: 100%;
    min-height: 280px;
    border: 2px dashed #e0e0e0;
    transition: all 0.3s;
    flex: 1;
  }

  .upload-box:hover {
    border-color: #b9a88a;
    transform: translateY(-2px);
  }

  .upload-placeholder {
    padding: 2rem;
  }

  .upload-placeholder i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #dccfbf;
  }

  .upload-placeholder p {
    font-size: 0.95rem;
    color: #999;
  }

  .download-box {
    width: 100%;
    height: 100%;
    min-height: 280px;
    margin: 0;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .output-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .result-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    transition: transform 0.3s;
  }

  .result-image:hover {
    transform: scale(1.02);
  }

  .toolbar {
    position: absolute;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    gap: 0.8rem;
  }

  .toolbar button {
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar button:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    background: #3c2913;
    color: white;
  }

  .prompt-section {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-top: 0;
  }

  textarea {
    width: 100%;
    min-height: 100px;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    resize: none;
    font-size: 0.95rem;
    transition: all 0.3s;
  }

  textarea:focus {
    border-color: #b9a88a;
    box-shadow: 0 0 0 2px rgba(185, 168, 138, 0.2);
  }

  .generate-btn {
    width: 100%;
    padding: 0.9rem;
    background: #3c2913;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .generate-btn:hover {
    background: #2a1d0f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .generate-btn:disabled {
    background: #dccfbf;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }

  .import-from-cart {
    margin-top: 0.5rem;
    padding: 1rem;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.3s;
    width: 100%;
  }

  .import-from-cart:hover {
    background: rgba(220, 207, 191, 0.3);
    transform: translateY(-2px);
  }

  .import-from-cart i {
    font-size: 1.2rem;
    color: #3c2913;
    margin-right: 0.8rem;
    transition: transform 0.3s;
  }

  .import-from-cart:hover i {
    transform: rotate(15deg);
  }

  .import-from-cart.replace-mode {
    border-color: #b9a88a;
    background: rgba(244, 240, 232, 0.9);
  }

  .import-from-cart.replace-mode i {
    color: #8a7350;
  }

  .import-from-cart.replace-mode:hover i {
    transform: rotate(180deg);
  }

  .import-from-cart p {
    margin: 0;
    font-size: 0.95rem;
    color: #3c2913;
    font-weight: 500;
  }

  .cart-product-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .cart-product-quantity button {
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
  }

  .cart-product-quantity button:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .cart-product-quantity button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cart-product-quantity span {
    min-width: 24px;
    text-align: center;
  }

  .cart-product-actions {
    position: absolute;
    right: 1rem;
    top: 1rem;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.3s;
  }

  .delete-btn:hover {
    color: #ff4d4f;
    transform: scale(1.1);
  }

  .cart-summary {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 1rem;
    border-top: 1px solid #f0f0f0;
    margin-top: auto;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .total-price {
    color: #ff6b00;
    font-weight: 500;
    font-size: 1.1rem;
  }

  .checkout-btn {
    width: 100%;
    padding: 0.8rem;
    background: #3c2913;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .checkout-btn:hover {
    background: #2a1d0f;
    transform: translateY(-2px);
  }
}

/* 移动端优化样式 */
@media (max-width: 768px) {
  /* 整体布局优化 */
  .home-container {
    padding: 0;
    margin-bottom: 70px; /* 增加底部间距，避免与底部导航栏重叠 */
  }
  
  /* 修复顶部导航栏和功能切换栏 */
  .top-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: #fff;
    z-index: 101; /* 确保在功能栏之上 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .function-bar {
    position: fixed;
    top: 50px; /* 紧接着顶部导航栏 */
    left: 0;
    right: 0;
    height: 44px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    z-index: 100;
  }
  
  /* 修复内容区域 */
  .content-area {
    margin-top: 100px; /* 为顶部的两个固定导航栏预留空间 */
    padding: 10px;
  }
  
  /* 优化快速生成功能区域 */
  .input-section {
    margin-bottom: 16px;
  }
  
  .combined-upload, 
  .simple-upload {
    margin-bottom: 16px;
  }
  
  .upload-box {
    height: 180px; /* 调整高度使比例更合适 */
    margin-bottom: 16px;
    border: 2px dashed #ddd;
    border-radius: 12px;
    background: #f9f9f9;
  }
  
  .upload-placeholder {
    padding: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .upload-placeholder i {
    font-size: 36px;
    margin-bottom: 12px;
    color: #999;
  }
  
  .upload-placeholder p {
    font-size: 14px;
    color: #666;
  }
  
  /* 调整下载预览区域 */
  .download-box {
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .output-preview {
    height: 240px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 修复提示词区域 */
  .prompt-section {
    padding: 16px;
    margin-bottom: 80px; /* 增加底部间距，避免与底部导航栏重叠 */
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  textarea {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
  }
  
  .prompt-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .polish-btn, 
  .revert-btn, 
  .generate-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
  }
  
  /* 修复底部导航栏 */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 102; /* 确保在所有元素之上 */
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  
  /* 修复导入按钮 */
  .import-from-cart {
    position: fixed;
    bottom: 70px; /* 调整位置，避免与底部导航栏重叠 */
    right: 16px;
    z-index: 99;
    padding: 10px 16px;
    border-radius: 20px;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* 导入按钮样式 */
.import-from-cart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3c2913;
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.import-from-cart:hover {
  background: #2a1d0f;
  transform: translateY(-2px);
}

.import-from-cart i {
  font-size: 1.2rem;
}

/* 桌面端布局优化 */
@media (min-width: 769px) {
  .home-container {
    padding-top: 60px; /* 减小顶部内边距 */
    padding-bottom: 40px; /* 减小底部内边距 */
    position: relative;
    overflow-x: hidden;
    margin-top: -20px; /* 桌面端也保持相同的上移距离 */
  }

  .sidebar-header[data-v-2dc54a20] {
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.06);
  }

  .main-content {
    flex: 1;
    margin-left: 300px;
    padding: 2rem 3rem;
    max-width: calc(100% - 300px);
    display: flex;
    flex-direction: column;
  }

  .sidebar {
    width: 300px;
    height: calc(100vh - 80px);
    position: fixed;
    left: 0;
    top: 80px;
    background: #ffffff;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08);
    padding: 1.5rem 0;
    transition: all 0.3s;
    z-index: 10;
    border-right: 1px solid #f0f0f0;
    overflow-y: auto;
  }

  /* 确保在桌面端完全隐藏导入按钮 */
  .import-from-cart {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
}

@media (max-width: 768px) {
  /* 隐藏底部导入按钮 */
  .import-from-cart {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  /* 优化智能替换功能下的图片上传框 */
  .combined-upload {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .upload-box {
    height: 180px;
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }
  
  .upload-box:hover {
    border-color: #b9a88a;
    background: #f5f5f5;
  }
  
  .upload-placeholder {
    text-align: center;
    padding: 20px;
  }
  
  .upload-placeholder i {
    font-size: 40px;
    color: #999;
    margin-bottom: 12px;
  }
  
  .upload-placeholder p {
    font-size: 15px;
    color: #666;
    margin: 0;
  }
  
  /* 优化预览图片显示 */
  .preview-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
  
  /* 调整内容区域间距 */
  .content-area {
    padding: 16px;
    margin-top: 100px;
    gap: 24px;
  }
  
  .input-section {
    padding: 20px;
  }
  
  /* 优化输出预览区域 */
  .download-box {
    margin-top: 24px;
    padding: 20px;
  }
  
  .output-preview {
    height: 280px;
  }
}

.review-box {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 120px;
  position: relative;
  z-index: 0;
  margin-bottom: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.review-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.get-ai-review-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.get-ai-review-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
}

.get-ai-review-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.review-content {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 100px;
}

.ai-review-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.review-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #999;
  text-align: center;
}

.review-placeholder i {
  font-size: 32px;
  margin-bottom: 10px;
}

.review-placeholder p {
  font-size: 14px;
  margin: 0;
}

/* 桌面端功能选择栏优化 */
@media (min-width: 769px) {
  .function-bar {
    position: sticky;
    top: 80px;
    background: #ffffff;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    height: 60px;
    z-index: 5;
  }

  .function-track {
    display: flex;
    position: relative;
    width: auto;
    height: auto;
    transform: none !important;
  }

  .function-item {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    color: #666;
    border-radius: 6px;
    transition: all 0.3s;
    border-bottom: none;
    cursor: pointer;
  }

  .function-item:hover {
    color: #3c2913;
    background: rgba(60, 41, 19, 0.05);
  }

  .function-item.active {
    color: #3c2913;
    background: rgba(60, 41, 19, 0.1);
    font-weight: 500;
  }
  
  .function-item:active {
    transform: scale(0.97);
    background: rgba(60, 41, 19, 0.15);
  }

  .scroll-hint {
    display: none;
  }
}

.upload-box.replace-mode {
  position: relative;
  border: 2px dashed var(--border-color);
  transition: all 0.3s ease;
}

.upload-box.replace-mode.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(60, 41, 19, 0.05);
  transform: scale(1.02);
}

.cart-product-item {
  cursor: grab;
  transition: all 0.3s ease;
}

.cart-product-item:active {
  cursor: grabbing;
}

.cart-product-item.dragging {
  opacity: 0.7;
  transform: scale(0.95);
}

/* 添加功能栏的样式 */
@media (max-width: 768px) {
  .function-track {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    scroll-behavior: smooth;
  }
  
  .function-track::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
  
  .function-item {
    flex: 0 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #666;
    position: relative;
    padding: 0 16px;
    white-space: nowrap;
  }
  
  .function-item.active {
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .function-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 1.5px;
  }
  
  /* 优化加载状态 */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  /* 统一上传框样式 */
  .upload-box,
  .upload-box.simple-mode,
  .upload-box.replace-mode {
    height: 180px;
    margin-bottom: 16px;
    border: 2px dashed #ddd;
    border-radius: 12px;
    background: #f9f9f9;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 统一预览缩略图样式 */
  .preview-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  /* 统一输出预览框样式 */
  .download-box {
    height: auto;
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .output-preview {
    height: 240px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* 统一结果图片样式 */
  .result-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  /* 统一组合上传布局 */
  .combined-upload {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  /* 处理多图模式下的布局 */
  .replace-mode {
    flex: 1;
  }
  
  /* 确保简单模式上传框与替换模式一致 */
  .simple-upload {
    margin-bottom: 16px;
  }
}

/* 专门用于统一移动端的样式 */
@media (max-width: 768px) {
  /* 清理可能重复的定义，使用一个统一的定义 */
  .upload-box,
  .upload-box.simple-mode,
  .upload-box.replace-mode {
    height: 180px !important;
    margin-bottom: 16px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    border: 2px dashed #ddd !important;
    border-radius: 12px !important;
    background-color: #f9f9f9 !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transform: none !important;
  }
  
  /* 强制覆盖之前的样式 */
  .upload-box:hover {
    transform: none !important;
  }
  
  /* 统一结果预览框 */
  .download-box {
    background: #fff !important;
    border-radius: 12px !important;
    padding: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    margin: 16px 0 !important;
    height: auto !important;
    transform: none !important;
  }
  
  .download-box:hover {
    transform: none !important;
  }
  
  .output-preview {
    height: 180px !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background-color: #f9f9f9 !important;
    border-radius: 8px !important;
  }
  
  /* 统一组合上传布局 */
  .combined-upload {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
    margin-bottom: 16px !important;
  }
  
  /* 统一简单模式上传 */
  .simple-upload {
    margin-bottom: 16px !important;
  }
}
</style>
