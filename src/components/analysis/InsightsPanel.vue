<template>
  <div class="insights">
    <h3>关键发现</h3>
    <ul class="findings">
      <li v-for="(finding, index) in findings" :key="index">
        {{ finding }}
      </li>
    </ul>
    
    <h3>营销建议</h3>
    <div class="marketing-tips">
      <div v-for="(tip, index) in marketingTips" :key="index" class="tip-item">
        <div class="tip-icon">
          <el-icon><Lightning /></el-icon>
        </div>
        <div class="tip-content">
          <h4>{{ tip.title }}</h4>
          <p>{{ tip.content }}</p>
        </div>
      </div>
    </div>
    
    <h3>行业趋势</h3>
    <p>{{ trendAnalysis }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Lightning } from '@element-plus/icons-vue'

const props = defineProps({
  keyword: {
    type: String,
    required: true
  },
  findings: {
    type: Array,
    default: () => []
  },
  marketingTips: {
    type: Array,
    default: () => []
  },
  trendAnalysis: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.insights {
  h3 {
    margin-top: 20px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .findings {
    padding-left: 20px;
    
    li {
      margin-bottom: 10px;
    }
  }
  
  .marketing-tips {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .tip-item {
      display: flex;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      
      .tip-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #409eff;
        margin-right: 15px;
        
        .el-icon {
          color: white;
          font-size: 20px;
        }
      }
      
      .tip-content {
        flex: 1;
        
        h4 {
          margin: 0 0 5px;
          color: #333;
        }
        
        p {
          margin: 0;
          color: #666;
        }
      }
    }
  }
}
</style> 