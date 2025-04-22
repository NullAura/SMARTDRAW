<template>
  <div class="skeleton-wrapper" :style="wrapperStyle">
    <div 
      v-for="(item, index) in count" 
      :key="index"
      class="skeleton-item"
      :class="[`skeleton-${type}`, { 'animated': animated }]"
      :style="getItemStyle(index)"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Skeleton',
  props: {
    type: {
      type: String,
      default: 'rect',
      validator: (value) => ['rect', 'circle', 'text', 'title', 'avatar', 'button', 'image'].includes(value)
    },
    width: {
      type: [String, Number],
      default: '100%'
    },
    height: {
      type: [String, Number],
      default: null
    },
    count: {
      type: Number,
      default: 1
    },
    animated: {
      type: Boolean,
      default: true
    },
    gap: {
      type: [String, Number],
      default: '16px'
    },
    round: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    wrapperStyle() {
      return {
        display: 'flex',
        flexDirection: this.count > 1 ? 'column' : 'row',
        gap: typeof this.gap === 'number' ? `${this.gap}px` : this.gap
      }
    }
  },
  methods: {
    getItemStyle(index) {
      // 处理width和height
      const width = typeof this.width === 'number' ? `${this.width}px` : this.width
      let height = null;
      
      // 根据类型设置不同的默认高度
      switch (this.type) {
        case 'circle':
        case 'avatar':
          height = this.height || width;
          break;
        case 'text':
          height = this.height || '16px';
          break;
        case 'title':
          height = this.height || '24px';
          break;
        case 'button':
          height = this.height || '36px';
          break;
        case 'image':
          height = this.height || '200px';
          break;
        default:
          height = this.height || '16px';
      }
      
      height = typeof height === 'number' ? `${height}px` : height;
      
      // 文本类型特殊处理，最后一个元素宽度可以不同
      if (this.type === 'text' && index === this.count - 1 && this.count > 1) {
        return { 
          width: typeof this.width === 'number' ? `${this.width * 0.6}px` : '60%',
          height 
        }
      }
      
      return { width, height }
    }
  }
}
</script>

<style scoped>
.skeleton-item {
  background: linear-gradient(90deg, var(--neutral-300), var(--neutral-200), var(--neutral-300));
  background-size: 400% 100%;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.skeleton-rect {
  width: 100%;
}

.skeleton-circle, 
.skeleton-avatar {
  border-radius: 50%;
}

.skeleton-text {
  height: 16px;
  border-radius: var(--radius-sm);
}

.skeleton-title {
  height: 24px;
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
}

.skeleton-button {
  height: 36px;
  border-radius: var(--radius-md);
}

.skeleton-image {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-md);
}

.skeleton-item.animated {
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style> 