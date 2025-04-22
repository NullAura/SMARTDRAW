<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  ToolboxComponent, LineChart, CanvasRenderer
])

const props = defineProps({
  keyword: {
    type: String,
    required: true
  },
  dateRange: {
    type: Array,
    default: () => []
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
      text: `"${props.keyword}" 热度趋势分析`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['搜索指数', '讨论热度', '视频播放量'],
      bottom: 10
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: generateDateRange(30)
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '搜索指数',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: generateRandomData(30, 500, 1000)
      },
      {
        name: '讨论热度',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: generateRandomData(30, 300, 800)
      },
      {
        name: '视频播放量',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: generateRandomData(30, 100, 500)
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 生成随机数据
const generateRandomData = (length, min, max) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

// 生成日期范围
const generateDateRange = (days) => {
  const result = []
  const endDate = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(endDate.getDate() - i)
    result.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  
  return result
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