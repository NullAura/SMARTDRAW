<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <div :class="['sidebar', { active: sidebarOpen }]">
      <div class="sidebar-header">
        <h3>功能导航</h3>
        <i class="fas fa-times" @click="toggleSidebar"></i>
      </div>
      <nav class="sidebar-menu">
        <router-link to="/user" @click="toggleSidebar">
          <i class="fas fa-user"></i>用户中心
        </router-link>
        <router-link to="/store" @click="toggleSidebar">
          <i class="fas fa-shopping-bag"></i>家居商城
        </router-link>
        <router-link to="/community" @click="toggleSidebar">
          <i class="fas fa-users"></i>创意社区
        </router-link>
      </nav>
    </div>

    <div class="main-content">
      <!-- 顶部标签栏 -->
      <div class="top-header">
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
        >
          <div
              v-for="(func, index) in functions"
              :key="func.id"
              class="function-item"
              :class="{ active: activeFunction === index }"
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
                    @click="triggerUpload(idx)"
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
        </div>
      </transition>

      <!-- 提示词输入 -->
      <div class="prompt-section">
        <textarea
            v-model.trim="prompt"
            placeholder="请输入创作提示词..."
            rows="3"
            @input="debouncedSaveDraft"
        ></textarea>
        <button
            class="generate-btn"
            :disabled="isGenerating"
            @click="generateImage"
        >
          <i class="fas fa-magic"></i>
          {{ isGenerating ? '生成中...' : '立即生成' }}
        </button>
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
              <div class="placeholder-image">{{ item.name.charAt(0) }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import 'vant/es/toast/style'

// 响应式状态
const sidebarOpen = ref(false)
const activeFunction = ref(0)
const trackPosition = ref(0)
const touchStartX = ref(0)
const transitionName = ref('slide-left')
const isGenerating = ref(false)
const router = useRouter()

// 图片相关
const replaceImages = ref([null, null])
const simpleImage = ref(null)
const generatedImage = ref(null)
const fileInputs = ref([])
const simpleInput = ref(null)

// 购物车相关
const cartSelectVisible = ref(false)
const cartProducts = ref([])
const cartSearchQuery = ref('')
const filteredCartProducts = ref([])

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

// 触摸交互逻辑
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  if (!touchStartX.value) return
  const delta = e.touches[0].clientX - touchStartX.value
  trackPosition.value = (delta / window.innerWidth) * 100 * 0.5
}

const handleTouchEnd = (e) => {
  if (!touchStartX.value) return

  const delta = e.changedTouches[0].clientX - touchStartX.value
  const threshold = window.innerWidth * 0.2
  let newIndex = activeFunction.value

  if (Math.abs(delta) > threshold) {
    const direction = delta > 0 ? -1 : 1
    newIndex = Math.min(Math.max(activeFunction.value + direction, 0), functions.value.length - 1)
  }

  transitionName.value = newIndex > activeFunction.value ? 'slide-left' : 'slide-right'
  activeFunction.value = newIndex
  trackPosition.value = -newIndex * 50
  touchStartX.value = 0
}

// 初始化滑块位置
onMounted(() => {
  trackPosition.value = -activeFunction.value * 50
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
  }
}

const handleSimpleUpload = async (event) => {
  try {
    const file = event.target.files[0]
    if (!file) return

    simpleImage.value = await createImageThumbnail(file)
  } catch (error) {
    console.error('上传失败:', error.message)
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
      // 准备图片数据
      const imageData = isReplaceMode.value ? replaceImages.value[0] : simpleImage.value
      if (!imageData || !imageData.file) {
        throw new Error('图片数据无效')
      }
      
      console.log('准备上传图片:', imageData.file.name, imageData.file.type, imageData.file.size)
      
      // 创建FormData - 严格按照测试文件顺序和方式
      const formData = new FormData()
      formData.append('image', imageData.file)
      formData.append('username', 'testuser')
      formData.append('prompt', prompt.value.trim())
      formData.append('return_type', 'url')
      
      console.log('请求参数设置完成，开始发送请求...')
      
      // 发送请求到服务器 - 严格使用与测试文件相同的参数
      // 浏览器fetch API不支持直接的timeout参数，需要使用AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20分钟超时
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        // 清除超时器
        clearTimeout(timeoutId);
        
        console.log('服务器响应状态:', response.status)
        
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
        const imageUrl = `/api${lastImagePath}`
        console.log('设置生成图片URL:', imageUrl)
        
        // 尝试预加载图片
        const img = new Image();
        
        console.log('开始预加载图片...');
        
        // 设置加载超时
        const imgLoadTimeout = setTimeout(() => {
          console.error('图片加载超时!');
          img.src = ''; // 中止当前加载
          showToast({
            message: '图片加载超时，请重试',
            type: 'fail'
          });
        }, 30000); // 30秒超时
        
        // 显示预加载提示
        const preloadToast = showLoadingToast({
          message: '正在加载图片...',
          forbidClick: true,
          duration: 0
        });
        
        // 定义加载成功处理
        img.onload = function() {
          clearTimeout(imgLoadTimeout);
          // 关闭预加载提示
          preloadToast.close();
          
          console.log('图片预加载成功！尺寸:', img.width, 'x', img.height);
          generatedImage.value = imageUrl;
          
          console.log('成功更新UI显示生成图片');
          
          // 显示成功提示
          showToast({
            message: '生成成功！',
            type: 'success',
            position: 'bottom'
          });
          
          // 记录图片加载成功事件
          try {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] 图片加载成功 - URL: ${imageUrl}`);
            
            if (window.localStorage) {
              // 保存最近成功的图片URL
              localStorage.setItem('lastSuccessImageUrl', imageUrl);
              localStorage.setItem('lastSuccessTime', timestamp);
            }
          } catch (logError) {
            console.error('记录成功日志时出错:', logError);
          }
        };
        
        // 定义加载失败处理
        img.onerror = function(err) {
          clearTimeout(imgLoadTimeout);
          // 关闭预加载提示
          preloadToast.close();
          
          console.error('图片预加载失败:', err);
          console.error('失败URL:', imageUrl);
          
          // 尝试验证URL是否可访问
          fetch(imageUrl, { method: 'HEAD' })
            .then(response => {
              console.log('URL可访问性检查:', response.status, response.statusText);
              console.log('Content-Type:', response.headers.get('Content-Type'));
            })
            .catch(fetchErr => {
              console.error('URL不可访问:', fetchErr);
            });
          
          // 尝试显示错误图片
          showToast({
            message: '图片加载失败，请重试',
            type: 'fail'
          });
        };
        
        // 开始加载图片
        img.src = imageUrl;
        console.log('已设置图片源，等待加载完成...');
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('请求超时，请重试');
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
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
  // 从localStorage加载购物车数据
  try {
    const cartData = localStorage.getItem('cartItems')
    console.log('购物车原始数据:', cartData)
    
    if (cartData) {
      try {
        const parsedData = JSON.parse(cartData)
        console.log('解析后的购物车数据:', parsedData)
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          cartProducts.value = parsedData
          filteredCartProducts.value = [...parsedData]
          console.log('购物车商品数量:', parsedData.length)
        } else {
          console.log('购物车为空或格式不正确')
          cartProducts.value = []
          filteredCartProducts.value = []
          
          // 添加测试数据用于演示
          const testItems = [
            {
              id: '1',
              name: 'TRÅDFRI 特拉德菲',
              description: '智能LED灯泡',
              price: '49',
              priceDecimal: '00',
              quantity: 1,
              selected: true
            },
            {
              id: '2',
              name: 'SYMFONISK 希姆弗斯',
              description: '书架式WiFi音箱',
              price: '699',
              priceDecimal: '00',
              quantity: 1,
              selected: true
            }
          ]
          
          cartProducts.value = testItems
          filteredCartProducts.value = [...testItems]
          console.log('已添加测试数据')
          
          // 保存到本地存储，方便下次测试
          localStorage.setItem('cartItems', JSON.stringify(testItems))
        }
      } catch (e) {
        console.error('购物车数据解析失败:', e)
        
        // 添加测试数据
        const testItems = [
          {
            id: '1',
            name: 'TRÅDFRI 特拉德菲',
            description: '智能LED灯泡',
            price: '49',
            priceDecimal: '00',
            quantity: 1,
            selected: true
          }
        ]
        
        cartProducts.value = testItems
        filteredCartProducts.value = [...testItems]
        console.log('解析失败，已添加测试数据')
      }
    } else {
      console.log('购物车本地存储为空')
      cartProducts.value = []
      filteredCartProducts.value = []
      
      // 添加测试数据
      const testItems = [
        {
          id: '1',
          name: 'TRÅDFRI 特拉德菲',
          description: '智能LED灯泡', 
          price: '49',
          priceDecimal: '00',
          quantity: 1,
          selected: true
        }
      ]
      
      cartProducts.value = testItems
      filteredCartProducts.value = [...testItems]
      console.log('本地存储为空，已添加测试数据')
      
      // 保存到本地存储，方便下次测试
      localStorage.setItem('cartItems', JSON.stringify(testItems))
    }
  } catch (error) {
    console.error('加载购物车数据失败:', error)
    cartProducts.value = []
    filteredCartProducts.value = []
    
    // 出错时也添加测试数据
    const testItems = [
      {
        id: '1',
        name: 'TRÅDFRI 特拉德菲',
        description: '智能LED灯泡',
        price: '49',
        priceDecimal: '00',
        quantity: 1,
        selected: true
      }
    ]
    
    cartProducts.value = testItems
    filteredCartProducts.value = [...testItems]
    console.log('加载失败，已添加测试数据')
  }
  
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

// 初始化草稿
onMounted(() => {
  const draft = localStorage.getItem('draft_prompt')
  if (draft) prompt.value = draft
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
</script>

<style scoped>
/* 原有样式保持不变，添加以下优化样式 */
.home-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100vw;
  padding-top: 60px; /* 为固定导航栏留出空间 */
  position: relative;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding: 0;
  width: 100%;
  max-width: 100vw;
}

.main-content > *:not(.top-header) {
  padding: 0.5rem;
}

.function-bar {
  margin-bottom: 0.5rem;
  width: 100%;
  overflow: hidden;
  height: 50px;
  position: relative;
  touch-action: pan-y;
  display: flex;
  align-items: center;
}

.function-item {
  font-size: 0.9rem;
  padding: 0.5rem;
}

.combined-upload {
  height: 200px;
  gap: 0.5rem;
}

.simple-upload {
  height: 200px;
}

.download-box {
  width: 60%;
  height: 180px;
  margin: 0.3rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.download-box i {
  font-size: 24px;
  color: #666;
}

.prompt-section {
  padding: 0.5rem;
  margin-top: 0.5rem;
}

textarea {
  font-size: 0.9rem;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
}

.generate-btn {
  padding: 0.8rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .home-container {
    padding-bottom: 50px;
  }
  
  .main-content {
    padding: 0.5rem;
  }

  .function-item {
    font-size: 0.85rem;
  }

  .upload-box {
    height: 180px;
  }

  .download-box {
    width: 80%;
    height: 160px;
    margin: 0.3rem auto;
  }

  .download-box i {
    font-size: 20px;
  }

  .prompt-section {
    padding: 0.5rem;
  }

  textarea {
    font-size: 0.85rem;
    padding: 0.6rem;
  }

  .generate-btn {
    padding: 0.7rem;
    font-size: 0.85rem;
  }
}

.upload-box {
  position: relative;
  transition: transform 0.2s;
}

.upload-box:hover {
  transform: translateY(-2px);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-box:hover .image-overlay {
  opacity: 1;
}

.result-image {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .function-item {
    font-size: 0.9rem;
  }

  .upload-placeholder p {
    font-size: 0.8rem;
  }
}
</style>

<style scoped>
/* 性能优化样式 */
:root {
  --primary-color: #3c2913;
  --text-secondary: #666;
  --border-color: #faf4e6;
  --bg-secondary: #dccfbf;
}
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-box:hover .image-overlay {
  opacity: 1;
}

.result-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.result-meta {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(255,255,255,0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.home-container {
  position: relative;
  min-height: 100vh;
  background: #f5f5f5;
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

.sidebar-menu a:hover {
  background: #f0f2f5;
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
  height: 300px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  opacity: 0.75;
  position: relative;
  margin: 6px;
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
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
  gap: 0.8rem;
  min-height: 50vh;
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
  width: 60%;
  height: 180px;
  margin: 0.3rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
  object-fit: contain;     /* 保持比例完整显示 */
  max-width: 100%;        /* 不超过容器宽度 */
  max-height: 100%;       /* 不超过容器高度 */
  width: auto;            /* 宽度自动适应 */
  height: auto;           /* 高度自动适应 */
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
    height: 160px;
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
}

.menu-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.menu-icon:hover {
  background: rgba(0,0,0,0.05);
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

  .header-left h1 {
    font-size: 1.1rem;
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
</style>