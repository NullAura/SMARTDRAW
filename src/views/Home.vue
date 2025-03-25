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
      <!-- 左上角菜单按钮 -->
      <div class="menu-button">
        <i class="fas fa-bars" @click="toggleSidebar"></i>
      </div>

      <!-- 功能切换栏 -->
      <div class="function-bar">
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
                    <p>上传图片 {{ idx + 1 }}</p>
                  </div>
                  <input
                      type="file"
                      :ref="el => fileInputs[idx] = el"
                      @change="e => handleUpload(e, idx)"
                      accept="image/*"
                  >
                </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'

// 响应式状态
const sidebarOpen = ref(false)
const activeFunction = ref(0)
const trackPosition = ref(0)
const touchStartX = ref(0)
const transitionName = ref('slide-left')
const isGenerating = ref(false)

// 图片相关
const replaceImages = ref([null, null])
const simpleImage = ref(null)
const generatedImage = ref(null)
const fileInputs = ref([])
const simpleInput = ref(null)

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
        resolve({
          file,
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
    isGenerating.value = true
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    // 这里替换为真实生成逻辑
    generatedImage.value = '/images/success3.png'
  } finally {
    isGenerating.value = false
  }
}

// 初始化草稿
onMounted(() => {
  const draft = localStorage.getItem('draft_prompt')
  if (draft) prompt.value = draft
})
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
}

.main-content {
  padding: 0.5rem;
  width: 100%;
  max-width: 100vw;
}

.function-bar {
  margin-bottom: 0.5rem;
  width: 100%;
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
  background: #f3eadd;
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

.function-bar {
  overflow: hidden;
  height: 50px;
  position: relative;
  touch-action: pan-y;
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
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.menu-button i {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.menu-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .menu-button {
    top: 8px;
    left: 8px;
    width: 36px;
    height: 36px;
  }
  
  .menu-button i {
    font-size: 1.1rem;
  }
}
</style>