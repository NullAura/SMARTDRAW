<template>
  <section>
    <h3>热门话题词云</h3>
    <div class="word-cloud" :class="{ loading }" aria-label="热门话题词云">
      <span
        v-for="(word, index) in words"
        :key="word.name"
        class="word"
        :style="wordStyle(word, index)"
        :title="`${word.name}：热度 ${word.value}`"
      >
        {{ word.name }}
      </span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  keyword: { type: String, required: true },
  loading: { type: Boolean, default: false }
})

const BASE_WORDS = [
  ['极简风格', 10000], ['原木家具', 8000], ['小户型', 7800], ['收纳空间', 7500],
  ['环保材质', 7300], ['多功能', 7000], ['北欧风', 6500], ['日式风格', 6000],
  ['智能家居', 5800], ['简约现代', 5500], ['实木家具', 5300], ['轻奢风', 5000],
  ['客厅布置', 4800], ['温馨', 4700], ['经济实用', 4500], ['卧室设计', 4300],
  ['书房', 4100], ['儿童房', 4000], ['厨房', 3800], ['阳台', 3600],
  ['餐厅', 3500], ['装饰画', 3300], ['照明', 3100], ['地毯', 3000],
  ['床品', 2800], ['植物', 2600], ['储物柜', 2500], ['办公家具', 2100]
].map(([name, value]) => ({ name, value }))

const words = computed(() => {
  const keyword = props.keyword.trim()
  if (!keyword || BASE_WORDS.some(word => word.name === keyword)) return BASE_WORDS
  return [{ name: keyword, value: 11000 }, ...BASE_WORDS]
})

const colors = ['#315f57', '#c96f49', '#4d6f8c', '#8a6747', '#7a5f86', '#4b7b59']

function wordStyle(word, index) {
  const fontSize = 13 + Math.round((word.value / 11000) * 28)
  const rotation = index % 7 === 0 ? -6 : index % 5 === 0 ? 6 : 0
  return {
    color: colors[index % colors.length],
    fontSize: `${fontSize}px`,
    fontWeight: word.value >= 7000 ? 700 : 500,
    transform: `rotate(${rotation}deg)`
  }
}
</script>

<style scoped>
.word-cloud {
  align-content: center;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  justify-content: center;
  min-height: 300px;
  padding: 24px;
  transition: opacity 0.2s ease;
}

.word-cloud.loading {
  opacity: 0.45;
}

.word {
  cursor: default;
  line-height: 1.1;
  transition: transform 0.2s ease, color 0.2s ease;
}

.word:hover {
  color: #1f403b !important;
  transform: scale(1.08) !important;
}

h3 {
  margin: 20px 0 15px;
}
</style>
