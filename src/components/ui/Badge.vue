<template>
  <span class="badge" :class="[type, size, { round }]">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'BadgeComponent',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'secondary', 'warning', 'danger', 'success', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    round: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  white-space: nowrap;
}

/* 尺寸变体 */
.badge.sm {
  padding: 1px 6px;
  font-size: 10px;
}

.badge.lg {
  padding: 3px 10px;
  font-size: var(--font-size-sm);
}

/* 圆角变体 */
.badge.round {
  border-radius: 100px;
}

/* 颜色变体 */
.badge.default {
  background-color: var(--neutral-300);
  color: var(--neutral-800);
}

.badge.primary {
  background-color: var(--brand-primary);
  color: white;
}

.badge.secondary {
  background-color: var(--brand-secondary);
  color: white;
}

.badge.warning {
  background-color: var(--state-warning);
  color: white;
}

.badge.danger {
  background-color: var(--state-danger);
  color: white;
}

.badge.success {
  background-color: var(--state-success);
  color: white;
}

.badge.info {
  background-color: var(--state-info);
  color: white;
}
</style> 