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
import { polishDesignPrompt, reviewDesignImage } from '@/api/ai'
import { generateDesignImage } from '@/api/image'
import { createCartProductImage } from '@/features/design/services/cartProductImage'

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

// 构建图片服务请求
const buildGenerationForm = () => {
  const formData = new FormData()

  if (isReplaceMode.value) {
    const [sourceImage, furnitureImage] = replaceImages.value
    if (!sourceImage?.file || !furnitureImage?.file) {
      throw new Error('请上传原始图片和替换家具图片')
    }
    formData.append('workflow_type', 'mergin')
    formData.append('image1', sourceImage.file, sourceImage.file.name)
    formData.append('image2', furnitureImage.file, furnitureImage.file.name)
  } else {
    if (!simpleImage.value?.file) {
      throw new Error('请上传家居图片')
    }
    formData.append('workflow_type', 'fastbd')
    formData.append('image', simpleImage.value.file, simpleImage.value.file.name)
  }

  formData.append('username', 'smartdraw-user')
  formData.append('prompt', prompt.value.trim())
  formData.append('output_format', 'url')
  return formData
}

const preloadGeneratedImage = imageUrl => new Promise((resolve, reject) => {
  const image = new Image()
  const timeoutId = window.setTimeout(() => {
    image.src = ''
    reject(new Error('图片加载超时'))
  }, 30000)

  image.onload = () => {
    window.clearTimeout(timeoutId)
    resolve()
  }
  image.onerror = () => {
    window.clearTimeout(timeoutId)
    reject(new Error('生成图片加载失败'))
  }
  image.src = imageUrl
})

// 生成图片
const generateImage = async () => {
  if (!prompt.value.trim()) {
    showToast({ message: '请输入提示词', type: 'fail', position: 'bottom' })
    return
  }

  isGenerating.value = true
  const generationToast = showLoadingToast({
    message: '正在生成中，请稍候...',
    forbidClick: true,
    duration: 0
  })

  try {
    const imageUrl = await generateDesignImage(buildGenerationForm())
    generationToast.close()

    const preloadToast = showLoadingToast({
      message: '正在加载图片...',
      forbidClick: true,
      duration: 0
    })
    try {
      await preloadGeneratedImage(imageUrl)
    } finally {
      preloadToast.close()
    }

    generatedImage.value = imageUrl
    showToast({ message: '生成成功', type: 'success', position: 'bottom' })
  } catch (error) {
    showToast({
      message: error.message || '图片生成失败，请稍后重试',
      type: 'fail',
      position: 'bottom'
    })
  } finally {
    generationToast.close()
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
  if (!item?.name) {
    showToast({
      message: '商品数据无效',
      type: 'fail'
    })
    return
  }

  const loadingToast = showLoadingToast({
    message: '正在加载商品图片...',
    forbidClick: true,
    duration: 0
  })

  try {
    const productImage = await createCartProductImage(item)
    replaceImages.value = replaceImages.value.map((image, index) =>
      index === 1 ? productImage : image
    )
    closeCartSelect()
    showToast({ message: `已选择 ${item.name}`, position: 'bottom' })

    const message = replaceImages.value[0]
      ? '家具替换准备就绪，可以点击"立即生成"'
      : '请上传原始家居图片'
    window.setTimeout(() => showToast({ message, position: 'bottom' }), 1000)
  } catch (error) {
    console.error('选择购物车商品失败:', error)
    showToast({ message: '无法处理图片，请重试', type: 'fail' })
  } finally {
    loadingToast.close()
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
    const data = await polishDesignPrompt(prompt.value);
    if (data.polished_prompt) {
      originalPrompt.value = prompt.value;
      prompt.value = data.polished_prompt;
      showRevertButton.value = true;
      showToast('润色完成', 'success');
    } else {
      showToast('润色失败，返回数据格式错误', 'error');
    }
  } catch (error) {
    showToast(error.response?.data?.error || '润色失败，请稍后再试', 'error');
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

    const data = await reviewDesignImage(file)
    aiReview.value = data.review
    showToast({ message: 'AI评价获取成功', type: 'success' })
  } catch (error) {
    showToast({
      message: error.response?.data?.error || error.message || '获取AI评价失败',
      type: 'fail'
    })
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

<style scoped src="../features/design/styles/home.css"></style>
