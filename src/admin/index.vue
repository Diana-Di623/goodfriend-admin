<template>
  <div class="admin-page">
    <!-- 管理员头部 -->
    <div class="admin-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="app-name">好朋友心理 - 管理后台</span>
        </div>
        <div class="admin-info">
          <span class="admin-name">管理员</span>
          <button class="logout-btn" @click="handleLogout">
            <svg class="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- 侧边导航栏 -->
    <div class="sidebar">
      <div class="nav-menu">
        <div 
          class="nav-item"
          :class="{ active: $route.path === '/admin/dashboard' }"
          @click="router.push('/admin/dashboard')"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-label">仪表板</span>
        </div>
        
        <div 
          class="nav-item"
          :class="{ active: $route.path === '/admin/counselors/applications' }"
          @click="router.push('/admin/counselors/applications')"
        >
          <span class="nav-icon">📋</span>
          <span class="nav-label">咨询师申请</span>
          <div v-if="pendingCount > 0" class="pending-badge">{{ pendingCount }}</div>
        </div>
        
        <div 
          class="nav-item"
          :class="{ active: $route.path === '/admin/counselors' }"
          @click="router.push('/admin/counselors')"
        >
          <span class="nav-icon">👨‍⚕️</span>
          <span class="nav-label">咨询师管理</span>
        </div>
        
        <div 
          class="nav-item"
          :class="{ active: $route.path.includes('/admin/users') }"
          @click="router.push('/admin/users')"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-label">用户管理</span> 
        </div>
        
        <div 
          class="nav-item"
          :class="{ active: $route.path.includes('/admin/statistics') }"
          @click="router.push('/admin/statistics')"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">数据统计</span>
        </div>
        
        <div 
          class="nav-item"
          :class="{ active: $route.path === '/admin/avatar-upload' }"
          @click="router.push('/admin/avatar-upload')"
        >
          <span class="nav-icon">🖼️</span>
          <span class="nav-label">头像上传</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 路由视图 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToUserDetail(id) {
  router.push(`/admin/users/${id}`)
}
// 模拟数据
const pendingCount = computed(() => {
  return 5 // 模拟有5个待处理申请
})

onMounted(() => {
  console.log('管理员主页已加载')
})

function handleLogout() {
  console.log('🚪 退出登录按钮被点击')
  
  try {
    console.log('🧹 开始清除登录信息...')
    
    // 清除登录信息
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    
    console.log('✅ 已清除本地存储数据')
    console.log('🔄 正在跳转到登录页面...')
    
    // 强制跳转到登录页面
    router.replace('/login').then(() => {
      console.log('✅ 路由跳转成功')
    }).catch((error) => {
      console.error('❌ 路由跳转失败:', error)
    })
    
    // 备用方案：使用 window.location
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        console.log('🔄 使用备用跳转方案...')
        window.location.href = '/login'
      }
    }, 1000)
    
  } catch (error) {
    console.error('💥 退出登录时发生错误:', error)
    alert('退出登录失败，请刷新页面重试')
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  z-index: 1000;
}

.header-content {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  font-size: 14px;
  color: #666;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(238, 90, 36, 0.2);
  position: relative;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.logout-btn:hover::before {
  left: 100%;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #d63031 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(238, 90, 36, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(238, 90, 36, 0.2);
}

.logout-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background: #fff;
  border-right: 1px solid #e8eaec;
  z-index: 999;
}

.nav-menu {
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: #ecf5ff;
  border-right: 4px solid #409eff;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
}

.nav-label {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.nav-item.active .nav-label {
  color: #409eff;
  font-weight: 600;
}

.pending-badge {
  min-width: 18px;
  height: 18px;
  background: #e74c3c;
  color: #fff;
  border-radius: 9px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* 主内容区域 */
.main-content {
  margin-left: 250px;
  margin-top: 60px;
  padding: 20px;
  min-height: calc(100vh - 80px);
}

.module-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 占位内容 */
.placeholder-content {
  text-align: center;
  padding: 60px 20px;
}

.placeholder-text {
  font-size: 16px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>
