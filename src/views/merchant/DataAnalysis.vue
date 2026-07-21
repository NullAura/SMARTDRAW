<template>
  <div class="data-analysis-container">
    <h1 class="page-title">大数据分析中心</h1>

    <el-card class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>抖音家具热点分析</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>刷新数据
          </el-button>
        </div>
      </template>

      <div class="dashboard-summary">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="data-card">
              <div class="data-icon hot">
                <el-icon><Star /></el-icon>
              </div>
              <div class="data-info">
                <h3>{{ hotTopicsCount }}</h3>
                <p>热点话题数</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="data-card">
              <div class="data-icon views">
                <el-icon><View /></el-icon>
              </div>
              <div class="data-info">
                <h3>{{ formatNumber(totalViews) }}</h3>
                <p>总播放量</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="data-card">
              <div class="data-icon likes">
                <el-icon><StarFilled /></el-icon>
              </div>
              <div class="data-info">
                <h3>{{ formatNumber(totalLikes) }}</h3>
                <p>总点赞数</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="data-card">
              <div class="data-icon comments">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="data-info">
                <h3>{{ formatNumber(totalComments) }}</h3>
                <p>总评论数</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 热点分析图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门家具品类分布</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热点话题趋势分析</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门话题列表 -->
    <el-card class="topic-list-card">
      <template #header>
        <div class="card-header">
          <span>抖音热门家具话题</span>
          <el-select v-model="topicFilter" placeholder="筛选类型" size="small" style="width: 100px;">
            <el-option label="全部" value="all" />
            <el-option label="家居设计" value="design" />
            <el-option label="家具产品" value="product" />
            <el-option label="装修灵感" value="decoration" />
          </el-select>
        </div>
      </template>

      <el-table :data="filteredTopics" style="width: 100%" v-loading="loading">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="title" label="话题标题">
          <template #default="scope">
            <div class="topic-title">
              <el-tag size="small" :type="getTagType(scope.row.category)">{{ scope.row.category }}</el-tag>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="views" label="播放量" width="120">
          <template #default="scope">
            {{ formatNumber(scope.row.views) }}
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="120">
          <template #default="scope">
            {{ formatNumber(scope.row.likes) }}
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评论数" width="120">
          <template #default="scope">
            {{ formatNumber(scope.row.comments) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewDetails(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalTopics"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 话题详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="话题详情"
      width="70%"
    >
      <div v-if="selectedTopic" class="topic-details">
        <div class="topic-header">
          <h2>{{ selectedTopic.title }}</h2>
          <div class="topic-meta">
            <el-tag size="small" :type="getTagType(selectedTopic.category)">{{ selectedTopic.category }}</el-tag>
            <span>作者: {{ selectedTopic.author }}</span>
            <span>发布时间: {{ selectedTopic.publishDate }}</span>
          </div>
        </div>

        <div class="topic-stats">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span>{{ formatNumber(selectedTopic.views) }} 播放</span>
          </div>
          <div class="stat-item">
            <el-icon><StarFilled /></el-icon>
            <span>{{ formatNumber(selectedTopic.likes) }} 点赞</span>
          </div>
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ formatNumber(selectedTopic.comments) }} 评论</span>
          </div>
          <div class="stat-item">
            <el-icon><Share /></el-icon>
            <span>{{ formatNumber(selectedTopic.shares) }} 分享</span>
          </div>
        </div>

        <div class="topic-content">
          <h3>内容摘要</h3>
          <p>{{ selectedTopic.description }}</p>
        </div>

        <div class="topic-keywords">
          <h3>关键词分析</h3>
          <div class="keyword-cloud">
            <el-tag
              v-for="(keyword, index) in selectedTopic.keywords"
              :key="index"
              :size="getKeywordSize(keyword.weight)"
              :type="getKeywordType(index)"
              class="keyword-tag"
            >
              {{ keyword.text }}
            </el-tag>
          </div>
        </div>

        <div class="topic-comments">
          <h3>热门评论</h3>
          <div class="comment-list">
            <div v-for="(comment, index) in selectedTopic.topComments" :key="index" class="comment-item">
              <div class="comment-user">
                <img :src="comment.avatar" alt="用户头像" class="user-avatar">
                <span class="username">{{ comment.username }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-meta">
                <span>{{ comment.time }}</span>
                <span>{{ formatNumber(comment.likes) }} 赞</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="generateReport">生成分析报告</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, Star, View, StarFilled, ChatDotRound, Share
} from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  BarChart, PieChart, LineChart, CanvasRenderer
])

// 数据相关
const loading = ref(false)
const hotTopicsCount = ref(0)
const totalViews = ref(0)
const totalLikes = ref(0)
const totalComments = ref(0)
const topicFilter = ref('all')
const hotTopics = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const selectedTopic = ref(null)

// 图表引用
const categoryChartRef = ref(null)
const trendChartRef = ref(null)
let categoryChart = null
let trendChart = null

// 计算属性
const totalTopics = computed(() => hotTopics.value.length)
const filteredTopics = computed(() => {
  let result = [...hotTopics.value]

  // 根据筛选条件过滤
  if (topicFilter.value !== 'all') {
    result = result.filter(topic => topic.category === topicFilter.value)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return result.slice(start, end)
})

// 方法
const formatNumber = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + '千万'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const getTagType = (category) => {
  const types = {
    'design': 'success',
    'product': 'primary',
    'decoration': 'warning'
  }
  return types[category] || 'info'
}

const getKeywordSize = (weight) => {
  if (weight > 0.8) return 'large'
  if (weight > 0.5) return 'default'
  return 'small'
}

const getKeywordType = (index) => {
  const types = ['', 'success', 'warning', 'danger', 'info']
  return types[index % types.length]
}

const refreshData = async () => {
  loading.value = true
  try {
    // 调用API获取数据，这里使用模拟数据
    await fetchAnalyticsData()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const viewDetails = (topic) => {
  selectedTopic.value = topic
  dialogVisible.value = true
}

const generateReport = () => {
  ElMessage.success('分析报告生成中，稍后将发送到您的邮箱')
  dialogVisible.value = false
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 初始化品类分布图表
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value)
      updateCategoryChart()
    }

    // 初始化趋势图表
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      updateTrendChart()
    }
  })
}

// 更新品类分布图表
const updateCategoryChart = () => {
  const option = {
    title: {
      text: '热门家具品类分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: ['沙发', '床', '桌椅', '柜子', '灯具', '其他']
    },
    series: [
      {
        name: '品类分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '沙发' },
          { value: 735, name: '床' },
          { value: 580, name: '桌椅' },
          { value: 484, name: '柜子' },
          { value: 300, name: '灯具' },
          { value: 200, name: '其他' }
        ]
      }
    ]
  }

  categoryChart.setOption(option)
}

// 更新趋势图表
const updateTrendChart = () => {
  const option = {
    title: {
      text: '近30天热度趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['播放量', '点赞数', '评论数'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '播放量',
        type: 'line',
        smooth: true,
        data: [14000, 16000, 20000, 24000, 18000, 22000, 26000, 28000, 32000, 34000, 36000, 32000, 30000, 34000, 38000, 42000, 48000, 52000, 46000, 50000, 54000, 60000, 65000, 58000, 62000, 66000, 70000, 74000, 78000, 82000]
      },
      {
        name: '点赞数',
        type: 'line',
        smooth: true,
        data: [5000, 5600, 6200, 7800, 8200, 8000, 9000, 10000, 11000, 12000, 13000, 12000, 11500, 13000, 14500, 16000, 18000, 20000, 18000, 19000, 21000, 23000, 25000, 22000, 24000, 25000, 26000, 28000, 30000, 32000]
      },
      {
        name: '评论数',
        type: 'line',
        smooth: true,
        data: [1200, 1400, 1800, 2000, 1900, 2200, 2400, 2600, 2800, 3000, 3200, 3000, 2800, 3100, 3400, 3800, 4200, 4600, 4200, 4400, 4800, 5200, 5600, 5200, 5400, 5600, 5800, 6100, 6400, 6800]
      }
    ]
  }

  trendChart.setOption(option)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (categoryChart) categoryChart.resize()
  if (trendChart) trendChart.resize()
}

// 模拟API调用
const fetchAnalyticsData = async () => {
  // 这里应该是实际的API调用，这里用setTimeout模拟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟数据
      hotTopicsCount.value = 128
      totalViews.value = 24568790
      totalLikes.value = 9876543
      totalComments.value = 2187654

      // 模拟热门话题数据
      hotTopics.value = [
        {
          rank: 1,
          title: "极简风小户型沙发设计，让你的客厅秒变大！",
          author: "设计师小王",
          category: "design",
          views: 3456789,
          likes: 987654,
          comments: 45678,
          shares: 12345,
          publishDate: "2023-05-15",
          description: "针对小户型设计的多功能沙发，采用极简风格，可收纳，使有限的空间得到最大化利用。",
          keywords: [
            { text: "小户型", weight: 0.9 },
            { text: "极简风", weight: 0.85 },
            { text: "多功能沙发", weight: 0.8 },
            { text: "空间利用", weight: 0.7 },
            { text: "收纳设计", weight: 0.6 },
            { text: "客厅布置", weight: 0.5 }
          ],
          topComments: [
            {
              username: "家居控",
              avatar: "https://placeholder.com/50",
              content: "买了这款沙发后，客厅立马宽敞了好多，收纳功能太实用了！",
              time: "3天前",
              likes: 3456
            },
            {
              username: "设计爱好者",
              avatar: "https://placeholder.com/50",
              content: "这个设计太聪明了，颜色也很百搭，强烈推荐给小户型的朋友们",
              time: "5天前",
              likes: 2345
            }
          ]
        },
        {
          rank: 2,
          title: "2023年最受欢迎的原木家具，环保又时尚",
          author: "家居达人",
          category: "product",
          views: 3245678,
          likes: 876543,
          comments: 43210,
          shares: 10987,
          publishDate: "2023-05-10",
          description: "介绍2023年最流行的原木家具系列，从材质到设计都体现环保理念，同时满足现代家居的时尚需求。",
          keywords: [
            { text: "原木家具", weight: 0.9 },
            { text: "环保材质", weight: 0.8 },
            { text: "2023流行", weight: 0.75 },
            { text: "北欧风", weight: 0.7 },
            { text: "可持续设计", weight: 0.6 }
          ],
          topComments: [
            {
              username: "自然爱好者",
              avatar: "https://placeholder.com/50",
              content: "终于找到符合我审美的环保家具了，质感非常好",
              time: "2天前",
              likes: 3210
            }
          ]
        },
        {
          rank: 3,
          title: "10种创意背景墙设计，让你的家与众不同",
          author: "创意家居",
          category: "decoration",
          views: 2987654,
          likes: 765432,
          comments: 32109,
          shares: 9876,
          publishDate: "2023-05-08",
          description: "分享10种独特的背景墙设计方案，包括壁纸、木板、墙砖等不同材质的创意应用，适合不同风格的家装。",
          keywords: [
            { text: "背景墙", weight: 0.9 },
            { text: "创意设计", weight: 0.85 },
            { text: "家装风格", weight: 0.75 },
            { text: "材质应用", weight: 0.7 }
          ],
          topComments: [
            {
              username: "装修小白",
              avatar: "https://placeholder.com/50",
              content: "第7种太惊艳了，已经在我家客厅实施，效果超赞",
              time: "4天前",
              likes: 2876
            }
          ]
        },
        {
          rank: 4,
          title: "智能家具新选择，这款智能床让你睡得更香",
          author: "科技家居",
          category: "product",
          views: 2876543,
          likes: 654321,
          comments: 21098,
          shares: 8765,
          publishDate: "2023-05-05",
          description: "介绍一款集成了睡眠监测、温度调节、语音控制等功能的智能床，让卧室科技感倍增。",
          keywords: [],
          topComments: []
        }
      ]

      // 补充样本数据至20条
      for(let i = 5; i <= 20; i++) {
        hotTopics.value.push({
          rank: i,
          title: `热门家具话题 ${i}`,
          author: `创作者${i}`,
          category: ['design', 'product', 'decoration'][Math.floor(Math.random() * 3)],
          views: Math.floor(Math.random() * 2000000) + 500000,
          likes: Math.floor(Math.random() * 500000) + 100000,
          comments: Math.floor(Math.random() * 50000) + 10000,
          shares: Math.floor(Math.random() * 10000) + 1000,
          publishDate: `2023-05-${Math.floor(Math.random() * 30) + 1}`,
          description: "样本数据描述内容",
          keywords: [],
          topComments: []
        })
      }

      resolve({ success: true })
    }, 1000)
  })
}

// 生命周期钩子
onMounted(async () => {
  // 加载数据
  await refreshData()

  // 初始化图表
  initCharts()

  // 添加窗口大小改变监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  if (categoryChart) categoryChart.dispose()
  if (trendChart) trendChart.dispose()

  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.data-analysis-container {
  padding: 20px;

  .page-title {
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
  }

  .dashboard-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-summary {
      margin-top: 10px;

      .data-card {
        display: flex;
        padding: 15px;
        border-radius: 8px;
        background-color: #f9f9f9;
        margin-bottom: 15px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

        .data-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;

          .el-icon {
            font-size: 24px;
            color: white;
          }

          &.hot {
            background-color: #f56c6c;
          }

          &.views {
            background-color: #409eff;
          }

          &.likes {
            background-color: #67c23a;
          }

          &.comments {
            background-color: #e6a23c;
          }
        }

        .data-info {
          flex: 1;

          h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            line-height: 1.2;
          }

          p {
            margin: 5px 0 0;
            color: #909399;
          }
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      margin-bottom: 20px;

      .chart-container {
        height: 400px;
      }
    }
  }

  .topic-list-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .topic-title {
      display: flex;
      align-items: center;

      .el-tag {
        margin-right: 10px;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .topic-details {
    .topic-header {
      margin-bottom: 20px;

      h2 {
        margin: 0 0 10px;
      }

      .topic-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
        color: #909399;
      }
    }

    .topic-stats {
      display: flex;
      margin-bottom: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;

      .stat-item {
        display: flex;
        align-items: center;
        margin-right: 30px;

        .el-icon {
          margin-right: 5px;
          color: #409eff;
        }
      }
    }

    .topic-content, .topic-keywords, .topic-comments {
      margin-bottom: 20px;

      h3 {
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
    }

    .keyword-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .keyword-tag {
        margin-bottom: 5px;
      }
    }

    .comment-list {
      .comment-item {
        border-bottom: 1px solid #eee;
        padding: 15px 0;

        &:last-child {
          border-bottom: none;
        }

        .comment-user {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            background-color: #eee; // 默认背景
          }

          .username {
            font-weight: 600;
          }
        }

        .comment-content {
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .comment-meta {
          display: flex;
          justify-content: space-between;
          color: #909399;
          font-size: 13px;
        }
      }
    }
  }
}

// 响应式调整
@media screen and (max-width: 768px) {
  .data-analysis-container {
    .topic-stats {
      flex-direction: column;

      .stat-item {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
