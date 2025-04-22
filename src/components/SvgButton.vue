<template>
  <button 
    class="svg-button" 
    :class="[
      type, 
      size, 
      { 
        'is-round': round, 
        'is-disabled': disabled, 
        'is-block': block, 
        'has-icon-only': iconOnly,
        [animation]: !!animation
      }
    ]"
    :disabled="disabled"
    :type="nativeType"
    @click="handleClick"
  >
    <div v-if="loading" class="svg-button-loading">
      <svg viewBox="0 0 24 24" class="loading-svg">
        <circle class="loading-circle" cx="12" cy="12" r="10" fill="none" stroke-width="2" />
      </svg>
    </div>
    <div v-else-if="icon" class="svg-button-icon" :class="{ 'icon-left': !iconOnly && !iconRight }">
      <svg-icon :name="icon" :size="iconSize" />
    </div>
    <span v-if="!iconOnly" class="svg-button-text">
      <slot></slot>
    </span>
    <div v-if="iconRight && !iconOnly" class="svg-button-icon icon-right">
      <svg-icon :name="iconRight" :size="iconSize" />
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text'].includes(val)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val) => ['mini', 'small', 'medium', 'large'].includes(val)
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  nativeType: {
    type: String,
    default: 'button',
    validator: (val) => ['button', 'submit', 'reset'].includes(val)
  },
  animation: {
    type: String,
    default: '',
    validator: (val) => ['', 'pulse', 'float', 'swing', 'shimmer', 'border-glow'].includes(val)
  }
})

const emit = defineEmits(['click'])

const iconSize = computed(() => {
  const sizes = {
    mini: 14,
    small: 16,
    medium: 18,
    large: 20
  }
  return sizes[props.size] || 18
})

const handleClick = (e) => {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<style scoped>
.svg-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.svg-button:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.svg-button:active:not(.is-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
}

.svg-button-text {
  pointer-events: none;
}

.svg-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.icon-left {
  margin-right: 6px;
}

.icon-right {
  margin-left: 6px;
}

/* Types */
.default {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.default:hover:not(.is-disabled) {
  color: #3c2913;
  border-color: #d9c8ae;
  background-color: #f9f6f0;
}

.primary {
  background-color: #3c2913;
  color: #fff;
}

.primary:hover:not(.is-disabled) {
  background-color: #55381d;
}

.success {
  background-color: #67c23a;
  color: #fff;
}

.success:hover:not(.is-disabled) {
  background-color: #85cf5f;
}

.warning {
  background-color: #e6a23c;
  color: #fff;
}

.warning:hover:not(.is-disabled) {
  background-color: #ecb865;
}

.danger {
  background-color: #f56c6c;
  color: #fff;
}

.danger:hover:not(.is-disabled) {
  background-color: #f78989;
}

.info {
  background-color: #909399;
  color: #fff;
}

.info:hover:not(.is-disabled) {
  background-color: #a6a9ad;
}

.text {
  background-color: transparent;
  color: #3c2913;
  padding: 8px;
  box-shadow: none;
}

.text:hover:not(.is-disabled) {
  color: #55381d;
  background-color: rgba(60, 41, 19, 0.05);
  transform: none;
  box-shadow: none;
}

/* Sizes */
.mini {
  padding: 4px 8px;
  font-size: 12px;
}

.small {
  padding: 6px 12px;
  font-size: 13px;
}

.medium {
  padding: 8px 16px;
  font-size: 14px;
}

.large {
  padding: 10px 20px;
  font-size: 16px;
}

/* Variants */
.is-round {
  border-radius: 20px;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.is-block {
  display: flex;
  width: 100%;
}

.has-icon-only {
  padding: 8px;
  border-radius: 50%;
}

.mini.has-icon-only {
  padding: 4px;
}

.small.has-icon-only {
  padding: 6px;
}

.large.has-icon-only {
  padding: 10px;
}

/* Loading styles */
.svg-button-loading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.loading-svg {
  width: 100%;
  height: 100%;
  animation: loading-rotate 2s linear infinite;
}

.loading-circle {
  stroke: currentColor;
  stroke-dasharray: 80;
  stroke-dashoffset: 60;
  transform-origin: center;
  animation: loading-dash 1.5s ease-in-out infinite;
}

@keyframes loading-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -120px;
  }
}

/* Animation styles */
.pulse {
  animation: pulse 1.5s infinite ease-in-out;
}

.float {
  animation: float 3s infinite ease-in-out;
}

.swing {
  transform-origin: center;
  animation: swing 1s infinite ease-in-out;
}

.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
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
  animation: shimmer 2s infinite linear;
}

.border-glow {
  animation: borderGlow 2s infinite;
}
</style> 