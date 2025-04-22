<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  BarChart, CanvasRenderer
])

const props = defineProps({
  keyword: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref(null)
let chartInstance = null

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  
  const option = {
    title: {
      text: `与"${props.keyword}"相关的热门话题`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['热度指数'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: ['简约设计', '收纳家具', '环保材质', '北欧风格', '小户型设计', '多功能家具', '原木家具', '极简风格', '儿童家具', '智能家居']
    },
    series: [
      {
        name: '热度指数',
        type: 'bar',
        data: [320, 302, 294, 280, 265, 240, 217, 189, 160, 142]
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听属性变化
watch(() => props.keyword, () => {
  if (props.keyword) {
    updateChart()
  }
})

// 生命周期钩子
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  height: 400px;
  width: 100%;
}
</style> 