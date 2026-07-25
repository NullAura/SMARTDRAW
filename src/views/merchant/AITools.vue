<template>
  <div class="ai-tools-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="left">
        <button class="btn" @click="saveWork">
          <i class="fas fa-save"></i>
          保存
        </button>
        <button class="btn" @click="exportWork">
          <i class="fas fa-download"></i>
          导出
        </button>
      </div>
      <div class="right">
        <div class="template-selector">
          <label>行业模板：</label>
          <select v-model="currentTemplate">
            <option value="clothing">服装</option>
            <option value="digital">数码</option>
            <option value="food">食品</option>
            <option value="beauty">美妆</option>
          </select>
        </div>
        <button class="btn primary" @click="generateAI">
          <i class="fas fa-magic"></i>
          AI生成
        </button>
      </div>
    </div>

    <!-- 工作区 -->
    <div class="workspace">
      <!-- 左侧组件库 -->
      <div class="component-library">
        <div class="section">
          <h3>基础组件</h3>
          <div class="components">
            <div class="component" draggable="true" @dragstart="dragStart($event, 'text')">
              <i class="fas fa-font"></i>
              <span>文本</span>
            </div>
            <div class="component" draggable="true" @dragstart="dragStart($event, 'image')">
              <i class="fas fa-image"></i>
              <span>图片</span>
            </div>
            <div class="component" draggable="true" @dragstart="dragStart($event, 'price')">
              <i class="fas fa-tag"></i>
              <span>价格</span>
            </div>
          </div>
        </div>
        <div class="section">
          <h3>营销组件</h3>
          <div class="components">
            <div class="component" draggable="true" @dragstart="dragStart($event, 'coupon')">
              <i class="fas fa-ticket-alt"></i>
              <span>优惠券</span>
            </div>
            <div class="component" draggable="true" @dragstart="dragStart($event, 'countdown')">
              <i class="fas fa-clock"></i>
              <span>倒计时</span>
            </div>
            <div class="component" draggable="true" @dragstart="dragStart($event, 'review')">
              <i class="fas fa-star"></i>
              <span>评价</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas" @dragover.prevent @drop="drop">
        <div class="canvas-header">
          <h2>商品详情页</h2>
          <div class="canvas-actions">
            <button class="btn" @click="undo">
              <i class="fas fa-undo"></i>
            </button>
            <button class="btn" @click="redo">
              <i class="fas fa-redo"></i>
            </button>
            <button class="btn" @click="clearCanvas">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="canvas-content">
          <div v-for="(item, index) in canvasItems"
               :key="index"
               class="canvas-item"
               :class="{ 'selected': selectedItem === index }"
               @click="selectItem(index)"
               @dragstart="dragStart($event, 'move')"
               draggable="true">
            <div class="item-content">
              <component :is="componentFor(item.type)" :data="item.data"></component>
            </div>
            <div class="item-actions">
              <button class="btn" @click="editItem(index)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn" @click="deleteItem(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <div class="panel-header">
          <h3>属性设置</h3>
        </div>
        <div class="panel-content">
          <div v-if="selectedItem !== null" class="property-group">
            <h4>基本属性</h4>
            <div class="property-item">
              <label>宽度</label>
              <input type="number" v-model="canvasItems[selectedItem].width">
            </div>
            <div class="property-item">
              <label>高度</label>
              <input type="number" v-model="canvasItems[selectedItem].height">
            </div>
            <div class="property-item">
              <label>位置</label>
              <div class="position-inputs">
                <input type="number" v-model="canvasItems[selectedItem].x" placeholder="X">
                <input type="number" v-model="canvasItems[selectedItem].y" placeholder="Y">
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-mouse-pointer"></i>
            <p>请选择要编辑的组件</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI生成对话框 -->
    <div v-if="showAIDialog" class="ai-dialog">
      <div class="dialog-content">
        <h3>AI生成助手</h3>
        <div class="ai-options">
          <div class="option" @click="generateContent('description')">
            <i class="fas fa-align-left"></i>
            <span>生成商品描述</span>
          </div>
          <div class="option" @click="generateContent('image')">
            <i class="fas fa-image"></i>
            <span>生成商品图片</span>
          </div>
          <div class="option" @click="generateContent('tag')">
            <i class="fas fa-tags"></i>
            <span>生成营销标签</span>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn" @click="showAIDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextComponent from '@/features/merchant-ai/components/TextComponent.vue'
import ImageComponent from '@/features/merchant-ai/components/ImageComponent.vue'
import PriceComponent from '@/features/merchant-ai/components/PriceComponent.vue'
import { post } from '@/api/client'

export default {
  name: 'AITools',
  components: {
    TextComponent,
    ImageComponent,
    PriceComponent
  },
  data() {
    return {
      currentTemplate: 'clothing',
      canvasItems: [],
      selectedItem: null,
      showAIDialog: false,
      dragItem: null,
      history: [],
      historyIndex: -1
    }
  },
  methods: {
    componentFor(type) {
      return {
        text: TextComponent,
        image: ImageComponent,
        price: PriceComponent
      }[type]
    },
    dragStart(event, type) {
      this.dragItem = type
      event.dataTransfer.setData('text/plain', type)
    },
    drop(event) {
      const type = event.dataTransfer.getData('text/plain')
      const rect = event.target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newItem = {
        type,
        data: this.getDefaultData(type),
        x,
        y,
        width: 200,
        height: 100
      }

      this.canvasItems.push(newItem)
      this.saveHistory()
    },
    getDefaultData(type) {
      switch (type) {
        case 'text':
          return {
            content: '请输入文本',
            fontSize: 14,
            color: '#333',
            bold: false,
            italic: false,
            align: 'left'
          }
        case 'image':
          return {
            url: '',
            fit: 'contain'
          }
        case 'price':
          return {
            price: 0,
            originalPrice: 0,
            showOriginal: false,
            fontSize: 20,
            color: '#f56c6c',
            align: 'left'
          }
        default:
          return {}
      }
    },
    selectItem(index) {
      this.selectedItem = index
    },
    editItem(index) {
      const item = this.canvasItems[index]
      if (item.type === 'text') {
        item.data.content = prompt('请输入文本', item.data.content)
      } else if (item.type === 'image') {
        const url = prompt('请输入图片URL', item.data.url)
        if (url) {
          item.data.url = url
        }
      } else if (item.type === 'price') {
        const price = prompt('请输入价格', item.data.price)
        if (price) {
          item.data.price = Number(price)
        }
      }
      this.saveHistory()
    },
    deleteItem(index) {
      this.canvasItems.splice(index, 1)
      if (this.selectedItem === index) {
        this.selectedItem = null
      }
      this.saveHistory()
    },
    async saveWork() {
      const work = {
        template: this.currentTemplate,
        items: this.canvasItems
      }
      try {
        await post('/api/merchant/ai/save', work)
        localStorage.setItem('ai_work', JSON.stringify(work))
        this.$toast.success('保存成功')
      } catch (error) {
        this.$toast.error(error.response?.data?.message || '保存失败')
      }
    },
    exportWork() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 800
      canvas.height = 1200

      // 设置背景色
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 渲染所有组件
      this.canvasItems.forEach(item => {
        if (item.type === 'text') {
          ctx.font = `${item.data.fontSize}px Arial`
          ctx.fillStyle = item.data.color
          ctx.textAlign = item.data.align
          ctx.fillText(item.data.content, item.x, item.y)
        } else if (item.type === 'image') {
          const img = new Image()
          img.src = item.data.url
          img.onload = () => {
            ctx.drawImage(img, item.x, item.y, item.width, item.height)
          }
        }
      })

      // 导出图片
      const link = document.createElement('a')
      link.download = '商品详情页.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    },
    generateAI() {
      this.showAIDialog = true
    },
    async generateContent(type) {
      try {
        const result = await post('/api/merchant/ai/generate', {
          type,
          template: this.currentTemplate,
          currentItems: this.canvasItems
        })
        const generated = result.data

        if (type === 'description') {
          this.canvasItems.push({
            type: 'text',
            data: {
              content: generated.content,
              fontSize: 14,
              color: '#333'
            },
            x: 100,
            y: 100,
            width: 600,
            height: 200
          })
        } else if (type === 'image') {
          this.canvasItems.push({
            type: 'image',
            data: {
              url: generated.imageUrl,
              fit: 'contain'
            },
            x: 100,
            y: 300,
            width: 600,
            height: 400
          })
        } else if (type === 'tag') {
          this.canvasItems.push({
            type: 'text',
            data: { content: generated.content, fontSize: 14, color: '#333' },
            x: 100,
            y: 100,
            width: 600,
            height: 100
          })
        }

        this.saveHistory()
        this.showAIDialog = false
        this.$toast.success('生成成功')
      } catch (error) {
        this.$toast.error(error.response?.data?.message || error.message || '生成失败')
      }
    },
    saveHistory() {
      this.history = this.history.slice(0, this.historyIndex + 1)
      this.history.push(JSON.parse(JSON.stringify(this.canvasItems)))
      this.historyIndex = this.history.length - 1
    },
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.canvasItems = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.canvasItems = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },
    clearCanvas() {
      this.canvasItems = []
      this.selectedItem = null
      this.saveHistory()
    }
  },
  mounted() {
    const savedWork = localStorage.getItem('ai_work')
    if (savedWork) {
      const work = JSON.parse(savedWork)
      this.currentTemplate = work.template
      this.canvasItems = work.items
      this.saveHistory()
    }
  }
}
</script>

<style scoped>
.ai-tools-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar .left,
.toolbar .right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  background: var(--bg-color);
}

.btn.primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn.primary:hover {
  opacity: 0.9;
}

.template-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.template-selector select {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-library {
  width: 250px;
  background: white;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #dcdfe6;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  color: var(--info-color);
  font-size: 14px;
  margin-bottom: 10px;
}

.components {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s;
}

.component:hover {
  background: var(--primary-color);
  color: white;
}

.component i {
  font-size: 20px;
  margin-bottom: 5px;
}

.canvas {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dcdfe6;
}

.canvas-actions {
  display: flex;
  gap: 10px;
}

.canvas-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  position: relative;
}

.canvas-item {
  position: absolute;
  border: 1px dashed #dcdfe6;
  background: white;
  cursor: move;
}

.canvas-item.selected {
  border-color: var(--primary-color);
}

.item-content {
  width: 100%;
  height: 100%;
}

.item-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.canvas-item:hover .item-actions {
  opacity: 1;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #dcdfe6;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 20px;
}

.property-group h4 {
  color: var(--info-color);
  font-size: 14px;
  margin-bottom: 10px;
}

.property-item {
  margin-bottom: 15px;
}

.property-item label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-color);
}

.property-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.position-inputs {
  display: flex;
  gap: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--info-color);
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 10px;
}

.ai-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
}

.ai-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.option:hover {
  background: var(--primary-color);
  color: white;
}

.option i {
  font-size: 24px;
  margin-bottom: 10px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .component-library,
  .property-panel {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .workspace {
    flex-direction: column;
  }

  .component-library,
  .property-panel {
    width: 100%;
    height: 200px;
  }

  .canvas {
    height: calc(100vh - 400px);
  }
}
</style>
