<template>
  <div class="svg-icon" v-html="iconHtml" :style="styles"></div>
</template>

<script setup>
import { computed } from 'vue'
import { createIcon } from '../assets/svg/icons.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  animation: {
    type: String,
    default: ''
  },
  delay: {
    type: [Number, String],
    default: 0
  }
})

const iconHtml = computed(() => {
  return createIcon(props.name, props.size, props.color)
})

const styles = computed(() => {
  const style = {
    display: 'inline-flex',
    verticalAlign: 'middle'
  }

  if (props.animation) {
    style.animation = `${props.animation} ${props.delay ? props.delay + 's' : '0s'}`
  }

  return style
})
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
