<template>
  <div class="empty-state" :class="size">
    <div class="icon-wrapper">
      <i :class="['fas', `fa-${icon}`]"></i>
    </div>
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: 'box-open'
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  width: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-round);
  background-color: var(--neutral-200);
  margin-bottom: var(--spacing-md);
}

.icon-wrapper i {
  font-size: 36px;
  color: var(--neutral-500);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-xs);
  color: var(--neutral-800);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
}

.empty-state p {
  margin: 0 0 var(--spacing-lg);
  color: var(--neutral-600);
  font-size: var(--font-size-md);
  max-width: 300px;
}

/* 尺寸变体 */
.empty-state.sm .icon-wrapper {
  width: 60px;
  height: 60px;
}

.empty-state.sm .icon-wrapper i {
  font-size: 24px;
}

.empty-state.sm h3 {
  font-size: var(--font-size-md);
}

.empty-state.sm p {
  font-size: var(--font-size-sm);
  max-width: 240px;
}

.empty-state.lg .icon-wrapper {
  width: 100px;
  height: 100px;
}

.empty-state.lg .icon-wrapper i {
  font-size: 48px;
}

.empty-state.lg h3 {
  font-size: var(--font-size-xl);
}

.empty-state.lg p {
  font-size: var(--font-size-lg);
  max-width: 400px;
}

@media (max-width: 768px) {
  .empty-state {
    padding: var(--spacing-lg);
  }
  
  .icon-wrapper {
    width: 70px;
    height: 70px;
  }
  
  .icon-wrapper i {
    font-size: 30px;
  }
  
  .empty-state h3 {
    font-size: var(--font-size-md);
  }
  
  .empty-state p {
    font-size: var(--font-size-sm);
  }
}
</style> 