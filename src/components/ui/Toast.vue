<template>
  <transition name="toast-fade">
    <div 
      v-if="visible" 
      class="toast-container" 
      :class="[`toast-${type}`, `toast-position-${position}`]"
    >
      <div class="toast">
        <div class="toast-icon">
          <i v-if="type === 'success'" class="fas fa-check-circle"></i>
          <i v-else-if="type === 'error'" class="fas fa-times-circle"></i>
          <i v-else-if="type === 'warning'" class="fas fa-exclamation-circle"></i>
          <i v-else-if="type === 'info'" class="fas fa-info-circle"></i>
        </div>
        <div class="toast-content">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    position: {
      type: String,
      default: 'center',
      validator: (value) => ['top', 'center', 'bottom'].includes(value)
    }
  },
  data() {
    return {
      visible: false,
      timer: null
    }
  },
  mounted() {
    this.show()
  },
  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    show() {
      this.visible = true
      
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close()
        }, this.duration)
      }
    },
    close() {
      this.visible = false
      setTimeout(() => {
        this.$emit('close')
      }, 300) // 动画结束后发出关闭事件
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: var(--z-index-toast, 5000);
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.toast-position-top {
  top: var(--spacing-lg);
}

.toast-position-center {
  top: 50%;
  transform: translateY(-50%);
}

.toast-position-bottom {
  bottom: var(--spacing-lg);
}

.toast {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  background-color: rgba(var(--neutral-800-rgb, 60, 41, 19), 0.9);
  color: var(--neutral-100);
  max-width: 80%;
  min-width: 120px;
  backdrop-filter: blur(4px);
}

.toast-icon {
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.toast-content {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* 状态样式 */
.toast-success .toast-icon {
  color: var(--state-success);
}

.toast-error .toast-icon {
  color: var(--state-danger);
}

.toast-warning .toast-icon {
  color: var(--state-warning);
}

.toast-info .toast-icon {
  color: var(--state-info);
}

/* 动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.toast-position-top .toast-fade-enter-from,
.toast-position-top .toast-fade-leave-to {
  transform: translateY(-20px);
}

.toast-position-bottom .toast-fade-enter-from,
.toast-position-bottom .toast-fade-leave-to {
  transform: translateY(20px);
}

.toast-position-center .toast-fade-enter-from,
.toast-position-center .toast-fade-leave-to {
  transform: translate(-50%, -50%) scale(0.8);
}
</style> 