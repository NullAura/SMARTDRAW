<template>
  <div class="keyword-analysis-container">
    <h1 class="page-title">热点关键词分析</h1>
    
    <el-card class="tool-card">
      <template #header>
        <div class="card-header">
          <span>关键词分析工具</span>
        </div>
      </template>
      
      <keyword-form 
        :loading="loading" 
        @analyze="handleAnalyzeKeyword" 
        @reset="handleResetForm"
      />
    </el-card>
    
    <div v-if="showResults" class="results-section">
      <!-- 热度趋势图 -->
      <el-card class="result-card" v-if="analysisType === 'trend'">
        <template #header>
          <div class="card-header">
            <span>{{ keyword }} - 热度趋势分析</span>
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </template>
        <trend-chart :keyword="keyword" :loading="loading" />
      </el-card>
      
      <!-- 相关话题分析 -->
      <el-card class="result-card" v-if="analysisType === 'related'">
        <template #header>
          <div class="card-header">
            <span>{{ keyword }} - 相关话题分析</span>
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </template>
        <related-topics-chart :keyword="keyword" :loading="loading" />
        <word-cloud-chart :keyword="keyword" :loading="loading" />
      </el-card>
      
      <!-- 人群分析 -->
      <el-card class="result-card" v-if="analysisType === 'demographic'">
        <template #header>
          <div class="card-header">
            <span>{{ keyword }} - 人群分析</span>
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </template>
        <demographic-charts :keyword="keyword" :loading="loading" />
      </el-card>
      
      <!-- 地域分布 -->
      <el-card class="result-card" v-if="analysisType === 'geographic'">
        <template #header>
          <div class="card-header">
            <span>{{ keyword }} - 地域分布</span>
            <el-button type="primary" size="small" @click="exportData">
              导出数据
            </el-button>
          </div>
        </template>
        <geographic-map :keyword="keyword" :loading="loading" />
      </el-card>
      
      <!-- 建议和洞察 -->
      <el-card class="insight-card">
        <template #header>
          <div class="card-header">
            <span>分析洞察</span>
          </div>
        </template>
        <insights-panel 
          :keyword="keyword"
          :findings="insights.findings"
          :marketing-tips="insights.marketingTips"
          :trend-analysis="insights.trendAnalysis"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 导入组件
import KeywordForm from '@/components/analysis/KeywordForm.vue'
import TrendChart from '@/components/analysis/TrendChart.vue'
import RelatedTopicsChart from '@/components/analysis/RelatedTopicsChart.vue'
import WordCloudChart from '@/components/analysis/WordCloudChart.vue'
import DemographicCharts from '@/components/analysis/DemographicCharts.vue'
import GeographicMap from '@/components/analysis/GeographicMap.vue'
import InsightsPanel from '@/components/analysis/InsightsPanel.vue'

// 状态
const loading = ref(false)
const showResults = ref(false)
const keyword = ref('')
const analysisType = ref('trend')

// 分析结果数据
const insights = reactive({
  findings: [],
  marketingTips: [],
  trendAnalysis: ''
})

// 内联实现fetchAnalysisData函数
const fetchAnalysisData = async (keyword, analysisType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        success: true,
        data: {
          topCities: [
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
          ],
          findings: [
            `"${keyword}"近30天热度上升了24.5%，搜索量持续增长`,
            `用户主要集中在一线城市，25-34岁女性是主要关注人群`,
            `相关话题中"极简风格"和"原木家具"与该关键词高度相关`,
            `与该关键词相关的视频内容平均播放量比行业平均高32%`,
            `用户对该类产品的价格敏感度较低，更注重设计和品质`
          ],
          marketingTips: [
            {
              title: '内容营销策略',
              content: '建议围绕"极简生活"、"环保家居"等主题创作短视频，与当前热点话题结合，增加曝光度'
            },
            {
              title: '产品推广重点',
              content: '突出产品的设计感和实用性，针对小户型用户群体，强调空间利用和多功能特性'
            },
            {
              title: '营销渠道选择',
              content: '优先投放抖音、小红书等平台，针对25-34岁女性用户群体定向推广'
            }
          ],
          trendAnalysis: `根据数据分析，"${keyword}"相关的家居产品市场正处于快速增长期，与去年同期相比增长了35%。消费者对高品质、设计感强的产品需求明显，价格因素影响较小。建议在产品设计和营销中强调环保材质、收纳功能和极简风格等要素，以满足目标人群需求。`
        }
      }
      
      resolve(result)
    }, 1500)
  })
}

// 方法
const handleAnalyzeKeyword = async (formData) => {
  if (!formData.keyword) {
    ElMessage.warning('请输入要分析的关键词')
    return
  }
  
  keyword.value = formData.keyword
  analysisType.value = formData.analysisType
  
  loading.value = true
  try {
    // 调用API获取数据
    const result = await fetchAnalysisData(keyword.value, analysisType.value)
    if (result.success) {
      // 更新数据
      insights.findings = result.data.findings
      insights.marketingTips = result.data.marketingTips
      insights.trendAnalysis = result.data.trendAnalysis
      
      showResults.value = true
      ElMessage.success('分析完成')
    }
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleResetForm = () => {
  showResults.value = false
  keyword.value = ''
  analysisType.value = 'trend'
}

const exportData = () => {
  ElMessage.success('数据导出中，稍后将发送到您的邮箱')
}
</script>

<style lang="scss" scoped>
.keyword-analysis-container {
  padding: 20px;
  
  .page-title {
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
  }
  
  .tool-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .results-section {
    .result-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style> 