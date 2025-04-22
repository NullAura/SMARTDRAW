<template>
  <div class="loading-spinner" :class="[`size-${size}`, { 'has-text': !!text }]">
    <div class="spinner-container">
      <svg class="spinner" viewBox="0 0 50 50" :style="{ color }">
        <circle
          class="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
        />
      </svg>
    </div>
    <div v-if="text" class="loading-text" :style="{ color }">{{ text }}</div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    color: {
      type: String,
      default: 'var(--brand-primary)'
    },
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.spinner-container {
  position: relative;
}

.spinner {
  animation: rotate 2s linear infinite;
  z-index: 2;
}

.path {
  stroke-dasharray: 150, 200;
  stroke-dashoffset: -10;
  animation: dash 1.5s ease-in-out infinite;
  stroke-linecap: round;
}

.loading-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  margin-top: var(--spacing-xs);
}

/* 尺寸 */
.loading-spinner.size-sm .spinner {
  width: 24px;
  height: 24px;
}

.loading-spinner.size-md .spinner {
  width: 40px;
  height: 40px;
}

.loading-spinner.size-lg .spinner {
  width: 60px;
  height: 60px;
}

.loading-spinner.size-sm .loading-text {
  font-size: var(--font-size-xs);
}

.loading-spinner.size-lg .loading-text {
  font-size: var(--font-size-md);
}

/* 动画 */
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -125px;
  }
}
</style> 