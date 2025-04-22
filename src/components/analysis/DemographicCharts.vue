<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <h3>年龄分布</h3>
        <div class="chart-container-half" ref="ageChartRef"></div>
      </el-col>
      <el-col :span="12">
        <h3>性别分布</h3>
        <div class="chart-container-half" ref="genderChartRef"></div>
      </el-col>
    </el-row>
    <h3>兴趣分布</h3>
    <div class="chart-container" ref="interestChartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  PieChart, BarChart, CanvasRenderer
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

const ageChartRef = ref(null)
const genderChartRef = ref(null)
const interestChartRef = ref(null)

let ageChart = null
let genderChart = null
let interestChart = null

// 初始化图表
const initCharts = () => {
  initAgeChart()
  initGenderChart()
  initInterestChart()
}

// 初始化年龄分布图表
const initAgeChart = () => {
  if (ageChartRef.value) {
    ageChart = echarts.init(ageChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: ['18岁以下', '18-24岁', '25-34岁', '35-44岁', '45-54岁', '55岁以上']
      },
      series: [
        {
          name: '年龄分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 5, name: '18岁以下' },
            { value: 25, name: '18-24岁' },
            { value: 35, name: '25-34岁' },
            { value: 20, name: '35-44岁' },
            { value: 10, name: '45-54岁' },
            { value: 5, name: '55岁以上' }
          ]
        }
      ]
    }
    
    ageChart.setOption(option)
  }
}

// 初始化性别分布图表
const initGenderChart = () => {
  if (genderChartRef.value) {
    genderChart = echarts.init(genderChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: ['男性', '女性']
      },
      series: [
        {
          name: '性别分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 40, name: '男性' },
            { value: 60, name: '女性' }
          ]
        }
      ]
    }
    
    genderChart.setOption(option)
  }
}

// 初始化兴趣分布图表
const initInterestChart = () => {
  if (interestChartRef.value) {
    interestChart = echarts.init(interestChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
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
        data: ['家居装饰', '设计', '旅游', '美食', '时尚', '育儿', '科技', '健康', '教育', '娱乐']
      },
      series: [
        {
          name: '兴趣指数',
          type: 'bar',
          data: [85, 75, 65, 60, 55, 50, 45, 40, 35, 30]
        }
      ]
    }
    
    interestChart.setOption(option)
  }
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  const charts = [ageChart, genderChart, interestChart]
  charts.forEach(chart => {
    if (chart) chart.resize()
  })
}

// 监听属性变化
watch(() => props.keyword, () => {
  if (props.keyword) {
    // 如果需要更新图表数据，可以在这里处理
  }
})

// 生命周期钩子
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  const charts = [ageChart, genderChart, interestChart]
  charts.forEach(chart => {
    if (chart) {
      chart.dispose()
    }
  })
  
  ageChart = null
  genderChart = null
  interestChart = null
})
</script>

<style scoped>
.chart-container-half {
  height: 300px;
  width: 100%;
}

.chart-container {
  height: 400px;
  width: 100%;
  margin-top: 20px;
}

h3 {
  margin-bottom: 15px;
  margin-top: 20px;
}
</style> 