<template>
  <div class="dashboard">
    <div class="content">
      <!-- 数据概览卡片 -->
      <div class="overview-cards">
        <div class="card">
          <div class="card-header">
            <el-icon><DataLine /></el-icon>
            <h3>今日数据</h3>
          </div>
          <div class="card-content">
            <div class="stat-item">
              <span class="label">访问量</span>
              <span class="value">1,234</span>
              <span class="trend up">↑ 12%</span>
            </div>
            <div class="stat-item">
              <span class="label">订单数</span>
              <span class="value">56</span>
              <span class="trend up">↑ 8%</span>
            </div>
            <div class="stat-item">
              <span class="label">销售额</span>
              <span class="value">¥12,345</span>
              <span class="trend up">↑ 15%</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <el-icon><Goods /></el-icon>
            <h3>商品统计</h3>
          </div>
          <div class="card-content">
            <div class="stat-item">
              <span class="label">在售商品</span>
              <span class="value">128</span>
            </div>
            <div class="stat-item">
              <span class="label">库存预警</span>
              <span class="value warning">12</span>
            </div>
            <div class="stat-item">
              <span class="label">新品上架</span>
              <span class="value">5</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <el-icon><ChatLineRound /></el-icon>
            <h3>社区互动</h3>
          </div>
          <div class="card-content">
            <div class="stat-item">
              <span class="label">评论数</span>
              <span class="value">89</span>
            </div>
            <div class="stat-item">
              <span class="label">点赞数</span>
              <span class="value">256</span>
            </div>
            <div class="stat-item">
              <span class="label">分享数</span>
              <span class="value">45</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI工具卡片 -->
      <div class="section">
        <h2 class="section-title">AI创作工具</h2>
        <div class="ai-tools-grid">
          <div class="tool-card" @click="openAITool('product-generation')">
            <el-icon><Cpu /></el-icon>
            <h3>商品AI生成</h3>
            <p>智能生成商品描述和图片</p>
          </div>
          <div class="tool-card" @click="openAITool('content-sync')">
            <el-icon><Connection /></el-icon>
            <h3>内容同步</h3>
            <p>一键同步到多个平台</p>
          </div>
          <div class="tool-card" @click="openAITool('reply-suggestions')">
            <el-icon><ChatLineRound /></el-icon>
            <h3>智能回复</h3>
            <p>自动生成回复建议</p>
          </div>
          <div class="tool-card" @click="openAITool('tag-generator')">
            <el-icon><PriceTag /></el-icon>
            <h3>标签生成</h3>
            <p>智能生成热门标签</p>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="section">
        <h2 class="section-title">快捷操作</h2>
        <div class="quick-actions">
          <el-button type="primary" @click="handleNewProduct">
            <el-icon><Plus /></el-icon>
            发布新商品
          </el-button>
          <el-button type="success" @click="handleContentSync">
            <el-icon><Connection /></el-icon>
            同步内容
          </el-button>
          <el-button type="warning" @click="handleDataAnalysis">
            <el-icon><DataAnalysis /></el-icon>
            数据分析
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  DataLine,
  Goods,
  ChatLineRound,
  Cpu,
  Connection,
  PriceTag,
  Plus,
  DataAnalysis
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const openAITool = (tool) => {
  router.push(`/merchant/ai-tools?tool=${tool}`)
}

const handleNewProduct = () => {
  router.push('/merchant/products')
}

const handleContentSync = () => {
  ElMessage.info('内容同步功能开发中...')
}

const handleDataAnalysis = () => {
  ElMessage.info('数据分析功能开发中...')
}
</script>

<style lang="scss" scoped>
.dashboard {
  height: 100%;
  overflow-y: auto;
  padding: 20px;

  .content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .el-icon {
        font-size: 24px;
        margin-right: 10px;
        color: #409EFF;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }

    .card-content {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .label {
          color: #606266;
        }

        .value {
          font-weight: bold;
          color: #303133;

          &.warning {
            color: #E6A23C;
          }
        }

        .trend {
          font-size: 12px;

          &.up {
            color: #67C23A;
          }

          &.down {
            color: #F56C6C;
          }
        }
      }
    }
  }

  .section {
    margin-bottom: 30px;

    .section-title {
      font-size: 20px;
      color: #303133;
      margin-bottom: 20px;
    }
  }

  .ai-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .tool-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .el-icon {
      font-size: 32px;
      color: #409EFF;
      margin-bottom: 15px;
    }

    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .quick-actions {
    display: flex;
    gap: 15px;

    .el-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 10px;

    .overview-cards {
      grid-template-columns: 1fr;
    }

    .ai-tools-grid {
      grid-template-columns: 1fr;
    }

    .quick-actions {
      flex-direction: column;
    }
  }
}
</style> 