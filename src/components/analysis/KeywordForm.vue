<template>
  <div class="tool-form">
    <el-form :model="form" label-width="100px">
      <el-form-item label="关键词">
        <el-input 
          v-model="form.keyword" 
          placeholder="输入要分析的关键词" 
          clearable
        />
      </el-form-item>
      
      <el-form-item label="分析类型">
        <el-select v-model="form.analysisType" placeholder="选择分析类型" style="width: 180px;">
          <el-option label="热度趋势" value="trend" />
          <el-option label="相关话题" value="related" />
          <el-option label="人群分析" value="demographic" />
          <el-option label="地域分布" value="geographic" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          style="width: 300px;"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleAnalyze" :loading="loading">
          开始分析
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyze', 'reset'])

const form = reactive({
  keyword: '',
  analysisType: 'trend',
  dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

const handleAnalyze = () => {
  emit('analyze', { ...form })
}

const handleReset = () => {
  form.keyword = ''
  form.analysisType = 'trend'
  form.dateRange = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
  emit('reset')
}
</script>

<style lang="scss" scoped>
.tool-form {
  max-width: 600px;
  margin: 0 auto;
}

@media screen and (max-width: 768px) {
  .tool-form {
    width: 100%;
  }
}
</style> 