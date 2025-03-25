<!-- src/views/User.vue -->
<template>
  <div class="user-container">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <div class="user-info">
        <div class="avatar">
          <img :src="defaultAvatar" alt="用户头像">
        </div>
        <div class="user-name">{{ username }}</div>
        <div class="bio" @click="showEditBio">
          <span v-if="bio">{{ bio }}</span>
          <span v-else class="edit-profile">
            <i class="fas fa-edit"></i>
            介绍一下自己
          </span>
        </div>
      </div>
      
      <!-- 数据统计 -->
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">人气</div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="feature-entries">
      <div class="feature-item" @click="goToDigitalAssets">
        <i class="fas fa-chart-pie"></i>
        <span>数字资产</span>
      </div>
      <div class="feature-item" @click="goToRights">
        <i class="fas fa-crown"></i>
        <span>我的权益</span>
      </div>
    </div>

    <!-- 作品展示区 -->
    <div class="works-section">
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'works' }"
          @click="activeTab = 'works'"
        >
          作品<span class="count">0</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'likes' }"
          @click="activeTab = 'likes'"
        >
          喜欢<span class="count">0</span>
        </div>
      </div>

      <div class="works-content">
        <div v-if="activeTab === 'works'" class="empty-state">
          <i class="fas fa-images"></i>
          <p>还没有作品哦</p>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-heart"></i>
          <p>还没有喜欢的作品</p>
        </div>
      </div>
    </div>

    <!-- 编辑个性签名弹窗 -->
    <el-dialog
      v-model="bioDialogVisible"
      title="编辑个性签名"
      width="90%"
      :show-close="true"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="editingBio"
        type="textarea"
        :rows="4"
        placeholder="介绍一下自己吧..."
        maxlength="100"
        show-word-limit
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bioDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBio">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/head.jpg'

const activeTab = ref('works')
const username = ref('')
const bio = ref('')
const bioDialogVisible = ref(false)
const editingBio = ref('')

onMounted(() => {
  // 从本地存储获取用户信息
  const userInfo = localStorage.getItem('user')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    username.value = user.username || '未知用户'
    bio.value = user.bio || ''
  }
})

const showEditBio = () => {
  editingBio.value = bio.value
  bioDialogVisible.value = true
}

const saveBio = async () => {
  try {
    // 获取当前用户信息
    const userInfo = localStorage.getItem('user')
    if (!userInfo) {
      ElMessage.error('用户信息不存在')
      return
    }

    const user = JSON.parse(userInfo)
    user.bio = editingBio.value

    // 更新本地存储
    localStorage.setItem('user', JSON.stringify(user))
    
    // 更新显示
    bio.value = editingBio.value
    bioDialogVisible.value = false
    
    ElMessage.success('个性签名已更新')
  } catch (error) {
    console.error('保存个性签名失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

const goToDigitalAssets = () => {
  // 跳转到数字资产页面
}

const goToRights = () => {
  // 跳转到权益页面
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background: #f5f7fb;
  padding-bottom: 60px;
}

.user-header {
  background: #fff;
  padding: 20px;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.bio {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  text-align: center;
  max-width: 80%;
  margin: 0 auto;
}

.bio:hover {
  background: rgba(0, 0, 0, 0.05);
}

.edit-profile {
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.feature-entries {
  display: flex;
  background: #fff;
  padding: 15px 0;
  margin-bottom: 10px;
}

.feature-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #333;
  cursor: pointer;
}

.feature-item i {
  font-size: 24px;
  color: #666;
}

.feature-item span {
  font-size: 14px;
}

.works-section {
  background: #fff;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #333;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

.count {
  margin-left: 4px;
  font-size: 14px;
  color: #999;
}

.works-content {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  padding: 40px 0;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .bio {
    font-size: 13px;
    padding: 4px 8px;
  }
}
</style>