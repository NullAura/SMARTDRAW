<template>
  <div class="merchant-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="logo">
        <h2>{{ isCollapsed ? 'SD' : 'SMARTDRAW' }}</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="menu"
        :collapse="isCollapsed"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>

        <el-sub-menu index="data-analysis">
          <template #title>
            <el-icon><PieChart /></el-icon>
            <span>数据分析</span>
          </template>
          <el-menu-item index="/merchant/data-analysis">抖音热点分析</el-menu-item>
          <el-menu-item index="/merchant/keyword-analysis">关键词分析</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/merchant/ai-tools">
          <el-icon><Connection /></el-icon>
          <span>AI创作中心</span>
        </el-menu-item>

        <el-menu-item index="/merchant/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>

        <el-menu-item index="/merchant/community">
          <el-icon><ChatLineRound /></el-icon>
          <span>社区运营</span>
        </el-menu-item>
      </el-menu>

      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <component :is="isCollapsed ? Expand : Fold" />
        </el-icon>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-bar">
        <div class="left">
          <div class="hamburger" @click="toggleCollapse">
            <el-icon><Menu /></el-icon>
          </div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="right">
          <el-dropdown trigger="click">
            <div class="user-info">
              <span class="username">{{ userInfo?.username || '未登录' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !isCollapsed"
      class="mobile-mask"
      @click="toggleCollapse"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  DataLine,
  Connection,
  Goods,
  ChatLineRound,
  Expand,
  Fold,
  ArrowDown,
  Menu,
  PieChart
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapsed = ref(false)
const userInfo = ref(null)
const isMobile = ref(false)

// 添加窗口大小监听
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

// 处理菜单点击事件
const handleMenuSelect = (index) => {
  console.log('菜单选择:', index)
  router.push(index)
  // 在移动设备上点击菜单后自动折叠侧边栏
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

onMounted(() => {
  // 初始化时检查屏幕大小
  checkScreenSize()
  // 添加窗口大小变化监听
  window.addEventListener('resize', checkScreenSize)

  // 检查登录状态并获取用户信息
  console.log('商家布局初始化，检查登录状态')
  if (userStore.checkLoginStatus()) {
    console.log('已登录，设置用户信息')
    userInfo.value = userStore.userInfo
  } else {
    console.log('未登录，跳转到登录页')
    router.push('/login')
  }
})

// 添加用户信息监听
watch(() => userStore.userInfo, (newVal) => {
  console.log('用户信息变化:', newVal)
  userInfo.value = newVal
}, { immediate: true })

// 添加登录状态监听
watch(() => userStore.isLoggedIn, (newVal) => {
  console.log('登录状态变化:', newVal)
  if (!newVal) {
    console.log('登录状态为false，跳转到登录页')
    router.push('/login')
  }
}, { immediate: true })

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', checkScreenSize)
})

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => {
  const titles = {
    '/merchant/dashboard': '数据概览',
    '/merchant/ai-tools': 'AI创作中心',
    '/merchant/products': '商品管理',
    '/merchant/community': '社区运营',
    '/merchant/data-analysis': '抖音热点分析',
    '/merchant/keyword-analysis': '关键词分析'
  }
  return titles[route.path] || '未知页面'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    console.log('执行登出操作')
    // 调用store中的登出方法
    await userStore.logout()

    console.log('登出成功，跳转到登录页')
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消登出')
      return
    }

    console.error('登出失败:', error)
    ElMessage.error('登出失败，将强制清除登录状态')
    // 即使API调用失败，也要清除本地状态并跳转
    userStore.clearState()
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
// 添加 z-index 管理变量
$sidebar-z-index: 1001;
$mobile-mask-z-index: 1000;
$topbar-z-index: 10;  // 降低顶部导航栏的z-index
$content-z-index: 20; // 提高内容区域的z-index

.merchant-layout {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
  overflow-x: hidden; // 防止水平滚动

  .sidebar {
    width: 256px;
    background-color: #001529;
    position: relative;
    transition: all 0.3s;

    // 电脑端样式
    @media screen and (min-width: 769px) {
      &.sidebar-collapsed {
        width: 80px;

        .logo h2 {
          font-size: 16px;
        }
      }
    }

    // 移动端样式
    @media screen and (max-width: 768px) {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: $sidebar-z-index;
      transform: translateX(0);
      transition: transform 0.3s;
      width: 80%;

      &.sidebar-collapsed {
        transform: translateX(-100%);
      }
    }

    .logo {
      height: 64px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      transition: all 0.3s;
    }

    .menu {
      border-right: none;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .collapse-btn {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
      color: #fff;
      cursor: pointer;
      padding: 10px;
      transition: all 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.3s;
    position: relative;
    z-index: $content-z-index;
    width: 100%; // 确保内容宽度100%

    // 电脑端样式
    @media screen and (min-width: 769px) {
      margin-left: 0;
    }

    // 移动端样式
    @media screen and (max-width: 768px) {
      width: 100%;
      margin-left: 0;
      padding-top: 0; // 移除顶部内边距
    }

    .top-bar {
      height: 64px;
      padding: 0 24px;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

      // 普通样式（位于内容顶部）
      position: relative;
      z-index: $topbar-z-index;

      // 移动端样式
      @media screen and (max-width: 768px) {
        position: relative; // 改为相对定位，不再固定
        z-index: $topbar-z-index;
      }

      .left {
        display: flex;
        align-items: center;
        gap: 16px;

        .hamburger {
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.3s;

          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }

      .right {
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.3s;

          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      position: relative;
      z-index: $content-z-index;
      width: 100%; // 确保内容宽度100%

      @media screen and (max-width: 768px) {
        padding: 16px;
        overflow-x: hidden; // 防止水平滚动
        min-height: calc(100vh - 64px); // 确保内容区域高度充足
      }
    }
  }

  .mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: $mobile-mask-z-index;
  }
}

// 清除全局干扰样式
:deep(.el-menu) {
  border-right: none !important;
}

:deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

// 修复可能影响内容显示的元素样式
:deep(.function-menu) {
  z-index: 998 !important; // 确保功能菜单在顶部导航栏之下
}
</style>
