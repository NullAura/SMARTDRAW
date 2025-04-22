<template>
  <div>
    <h3>热门话题词云</h3>
    <div class="word-cloud" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent, TooltipComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import 'echarts-wordcloud'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, CanvasRenderer
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
    tooltip: {
      show: true
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '70%',
      height: '80%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: [
        { name: '极简风格', value: 10000 },
        { name: '原木家具', value: 8000 },
        { name: '小户型', value: 7800 },
        { name: '收纳空间', value: 7500 },
        { name: '环保材质', value: 7300 },
        { name: '多功能', value: 7000 },
        { name: '北欧风', value: 6500 },
        { name: '日式风格', value: 6000 },
        { name: '智能家居', value: 5800 },
        { name: '简约现代', value: 5500 },
        { name: '实木家具', value: 5300 },
        { name: '轻奢风', value: 5000 },
        { name: '客厅布置', value: 4800 },
        { name: '温馨', value: 4700 },
        { name: '经济实用', value: 4500 },
        { name: '卧室设计', value: 4300 },
        { name: '书房', value: 4100 },
        { name: '儿童房', value: 4000 },
        { name: '厨房', value: 3800 },
        { name: '阳台', value: 3600 },
        { name: '餐厅', value: 3500 },
        { name: '装饰画', value: 3300 },
        { name: '照明', value: 3100 },
        { name: '地毯', value: 3000 },
        { name: '床品', value: 2800 },
        { name: '植物', value: 2600 },
        { name: '储物柜', value: 2500 },
        { name: '户外家具', value: 2300 },
        { name: '办公家具', value: 2100 },
        { name: '定制家具', value: 2000 }
      ]
    }]
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
.word-cloud {
  height: 300px;
  width: 100%;
  margin-top: 10px;
}

h3 {
  margin-bottom: 15px;
  margin-top: 20px;
}
</style> 