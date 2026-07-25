<template>
  <div>
    <div class="chart-container-large" ref="mapChartRef"></div>
    <div class="city-ranking">
      <h3>热度城市TOP10</h3>
      <el-table :data="cities" style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="city" label="城市" />
        <el-table-column prop="score" label="热度得分">
          <template #default="scope">
            <div class="heat-score">
              <div class="score-bar" :style="{ width: scope.row.score + '%' }"></div>
              <span>{{ scope.row.score }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比">
          <template #default="scope">
            {{ scope.row.percentage }}%
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
// 由于没有实际的地图JSON文件，我们暂时移除这个导入
// import china from 'echarts/map/json/china.json'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, VisualMapComponent,
  MapChart, CanvasRenderer
])

// 判断是否有中国地图数据
const registerChina = () => {
  // 检查是否已注册中国地图
  if (!echarts.getMap('china')) {
    try {
      // 如果服务器上有地图数据，可以动态加载
      // 在实际部署时，需要将中国地图JSON文件放到assets/maps目录下
      // 这里我们使用条件渲染替代
      console.log('中国地图数据未加载，显示备用内容')
    } catch (error) {
      console.error('加载中国地图失败:', error)
    }
  }
}

// 注册中国地图
// echarts.registerMap('china', china)

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

const mapChartRef = ref(null)
let mapChart = null

// 城市数据
const cities = ref([
  { rank: 1, city: '北京', score: 98, percentage: 16.3 },
  { rank: 2, city: '上海', score: 94, percentage: 15.7 },
  { rank: 3, city: '广州', score: 89, percentage: 14.8 },
  { rank: 4, city: '深圳', score: 85, percentage: 14.2 },
  { rank: 5, city: '杭州', score: 80, percentage: 13.3 },
  { rank: 6, city: '成都', score: 75, percentage: 12.5 },
  { rank: 7, city: '南京', score: 70, percentage: 11.7 },
  { rank: 8, city: '武汉', score: 65, percentage: 10.8 },
  { rank: 9, city: '西安', score: 60, percentage: 10.0 },
  { rank: 10, city: '重庆', score: 55, percentage: 9.2 }
])

// 初始化地图
const initChart = () => {
  if (mapChartRef.value) {
    mapChart = echarts.init(mapChartRef.value)
    // 检查是否有中国地图数据
    registerChina()
    
    // 如果中国地图数据不可用，显示城市排行榜的柱状图
    if (!echarts.getMap('china')) {
      updateBarChart()
    } else {
      updateChart()
    }
  }
}

// 更新图表数据
const updateChart = () => {
  if (!mapChart) return
  
  // 如果中国地图数据不可用，显示城市排行榜的柱状图
  if (!echarts.getMap('china')) {
    updateBarChart()
    return
  }
  
  const option = {
    title: {
      text: `"${props.keyword}"热度地域分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>热度指数: {c}'
    },
    visualMap: {
      min: 0,
      max: 2500,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#f2f2f2', '#d1e6fb', '#94c4f5', '#4190d9', '#2064b5']
      }
    },
    series: [
      {
        name: '热度指数',
        type: 'map',
        map: 'china',
        roam: true,
        label: {
          show: false
        },
        data: [
          { name: '北京', value: 2500 },
          { name: '上海', value: 2300 },
          { name: '广东', value: 2100 },
          { name: '浙江', value: 1800 },
          { name: '江苏', value: 1600 },
          { name: '四川', value: 1400 },
          { name: '湖北', value: 1200 },
          { name: '福建', value: 1000 },
          { name: '湖南', value: 900 },
          { name: '山东', value: 800 },
          { name: '安徽', value: 700 },
          { name: '河南', value: 600 },
          { name: '河北', value: 500 },
          { name: '陕西', value: 450 },
          { name: '辽宁', value: 400 },
          { name: '重庆', value: 350 },
          { name: '天津', value: 300 },
          { name: '吉林', value: 250 },
          { name: '贵州', value: 200 },
          { name: '广西', value: 180 },
          { name: '云南', value: 160 },
          { name: '黑龙江', value: 140 },
          { name: '新疆', value: 120 },
          { name: '江西', value: 100 },
          { name: '内蒙古', value: 80 },
          { name: '山西', value: 70 },
          { name: '海南', value: 60 },
          { name: '甘肃', value: 50 },
          { name: '宁夏', value: 40 },
          { name: '青海', value: 30 },
          { name: '西藏', value: 20 }
        ]
      }
    ]
  }
  
  mapChart.setOption(option)
}

// 更新为城市排行榜柱状图
const updateBarChart = () => {
  if (!mapChart) return
  
  const data = cities.value.map(city => ({
    name: city.city,
    value: city.score
  })).sort((a, b) => b.value - a.value)
  
  const option = {
    title: {
      text: `"${props.keyword}"热度城市排行`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '热度得分',
        type: 'bar',
        data: data.map(item => item.value)
      }
    ]
  }
  
  mapChart.setOption(option)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (mapChart) {
    mapChart.resize()
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
  if (mapChart) {
    mapChart.dispose()
    mapChart = null
  }
})
</script>

<style scoped>
.chart-container-large {
  height: 500px;
  width: 100%;
}

.city-ranking {
  margin-top: 20px;
}

h3 {
  margin-bottom: 15px;
  margin-top: 20px;
}

.heat-score {
  position: relative;
  display: flex;
  align-items: center;
}

.score-bar {
  height: 20px;
  background-color: #409eff;
  border-radius: 2px;
  margin-right: 10px;
}

.score-bar + span {
  position: absolute;
  right: 0;
}
</style> 