<template>
  <div class="dashboard-page">
    <!-- 统计卡片区域 -->
    <div class="stats-cards-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon applications">📝</div>
          <div class="stat-content">
            <span class="stat-number">{{ stats.pendingApplications || 0 }}</span>
            <span class="stat-label">待审核申请</span>
          </div>
          <div class="stat-trend" :class="{ positive: stats.applicationsTrend > 0 }">
            <span class="trend-text">{{ stats.applicationsTrend > 0 ? '+' : '' }}{{ stats.applicationsTrend || 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon counselors">👨‍⚕️</div>
          <div class="stat-content">
            <span class="stat-number">{{ stats.totalCounselors || 0 }}</span>
            <span class="stat-label">在职咨询师</span>
          </div>
          <div class="stat-trend" :class="{ positive: stats.counselorsTrend > 0 }">
            <span class="trend-text">{{ stats.counselorsTrend > 0 ? '+' : '' }}{{ stats.counselorsTrend || 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">👥</div>
          <div class="stat-content">
            <span class="stat-number">{{ stats.totalUsers || 0 }}</span>
            <span class="stat-label">注册用户</span>
          </div>
          <div class="stat-trend" :class="{ positive: stats.usersTrend > 0 }">
            <span class="trend-text">{{ stats.usersTrend > 0 ? '+' : '' }}{{ stats.usersTrend || 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon consultations">💬</div>
          <div class="stat-content">
            <span class="stat-number">{{ stats.totalConsultations || 0 }}</span>
            <span class="stat-label">总咨询次数</span>
          </div>
          <div class="stat-trend" :class="{ positive: stats.consultationsTrend > 0 }">
            <span class="trend-text">{{ stats.consultationsTrend > 0 ? '+' : '' }}{{ stats.consultationsTrend || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动区域 -->
    <div class="recent-activities-section">
      <div class="section-header">
        <span class="section-title">最近活动</span>
        <div class="refresh-btn" @click="loadDashboardData">
          <span class="refresh-icon">🔄</span>
          </div>
        </div>
        <div class="activities-list">
          <div 
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-avatar">
              <span class="activity-icon">{{ activity.icon }}</span>
            </div>
            <div class="activity-content">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-desc">{{ activity.description }}</span>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
            <div v-if="activity.status" class="activity-status" :class="activity.status">
              <span class="status-text">{{ getStatusText(activity.status) }}</span>
            </div>
          </div>
        </div>
      </div>

    <!-- 系统状态区域 -->
    <div class="system-status-section">
      <div class="section-header">
        <span class="section-title">系统状态</span>
      </div>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-indicator" :class="{ healthy: systemStatus.database }"></div>
          <span class="status-label">数据库</span>
          <span class="status-value">{{ systemStatus.database ? '正常' : '异常' }}</span>
        </div>

        <div class="status-item">
          <div class="status-indicator" :class="{ healthy: systemStatus.api }"></div>
          <span class="status-label">API服务</span>
          <span class="status-value">{{ systemStatus.api ? '正常' : '异常' }}</span>
        </div>

        <div class="status-item">
          <div class="status-indicator" :class="{ healthy: systemStatus.storage }"></div>
          <span class="status-label">存储服务</span>
          <span class="status-value">{{ systemStatus.storage ? '正常' : '异常' }}</span>
        </div>

        <div class="status-item">
          <div class="status-indicator" :class="{ healthy: systemStatus.email }"></div>
          <span class="status-label">邮件服务</span>
          <span class="status-value">{{ systemStatus.email ? '正常' : '异常' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI } from '../utils/adminAPI.js'

// 路由
const router = useRouter()

// 定义事件触发器
const emit = defineEmits(['switchModule'])

// 统计数据
const stats = ref({
  pendingApplications: 12,
  totalCounselors: 86,
  totalUsers: 2341,
  totalConsultations: 5678,
  applicationsTrend: 15,
  counselorsTrend: 8,
  usersTrend: 22,
  consultationsTrend: 18
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    icon: '📝',
    title: '新的咨询师申请',
    description: '王心理医生提交了咨询师申请',
    time: '2025-01-20T14:30:00Z',
    status: 'pending'
  },
  {
    id: 2,
    icon: '✅',
    title: '审核通过',
    description: '李心理医生的申请已通过审核',
    time: '2025-01-20T13:15:00Z',
    status: 'approved'
  },
  {
    id: 3,
    icon: '👤',
    title: '新用户注册',
    description: '有15名新用户完成注册',
    time: '2025-01-20T11:45:00Z',
    status: 'info'
  },
  {
    id: 4,
    icon: '💬',
    title: '咨询完成',
    description: '今日完成咨询42次',
    time: '2025-01-20T10:30:00Z',
    status: 'success'
  },
  {
    id: 5,
    icon: '⚠️',
    title: '系统警告',
    description: '存储空间使用率达到80%',
    time: '2025-01-20T09:20:00Z',
    status: 'warning'
  }
])

// 系统状态
const systemStatus = ref({
  database: true,
  api: true,
  storage: true,
  email: false
})

onMounted(() => {
  loadDashboardData()
})

// 加载仪表板数据
async function loadDashboardData() {
  try {
    console.log('开始加载仪表板数据...')
    
    // 并行调用多个API
    const promises = [
      adminAPI.getDashboardStats(),
      adminAPI.getRecentActivities(5),
      adminAPI.getSystemStatus()
    ]
    
    const [statsResponse, activitiesResponse, statusResponse] = await Promise.all(promises)
    
    // 更新统计数据
    if (statsResponse.success) {
      stats.value = {
        ...stats.value,
        ...statsResponse.data
      }
    }
    
    // 更新最近活动
    if (activitiesResponse.success) {
      recentActivities.value = activitiesResponse.data
    }
    
    // 更新系统状态
    if (statusResponse.success) {
      systemStatus.value = {
        ...systemStatus.value,
        ...statusResponse.data
      }
    }
    
    console.log('数据更新完成')
    
  } catch (error) {
    // 如果API调用失败，使用模拟数据
    console.log('API调用失败，使用模拟数据:', error)
    
    // 模拟数据更新
    stats.value = {
      ...stats.value,
      pendingApplications: Math.floor(Math.random() * 20) + 5,
      totalCounselors: Math.floor(Math.random() * 20) + 80,
      totalUsers: Math.floor(Math.random() * 200) + 2300,
      totalConsultations: Math.floor(Math.random() * 500) + 5600
    }
    
    console.log('使用模拟数据更新完成')
  }
}

// 导航到不同模块
function navigateToApplications() {
  // 跳转到咨询师申请管理页面
  router.push('/admin/counselors')
}

function navigateToCounselors() {
  router.push('/admin/counselors')
}

function navigateToUsers() {
  emit('switchModule', 'users')
}

function navigateToReports() {
  console.log('报告功能开发中')
}

// 格式化时间
function formatTime(timeString) {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待处理',
    approved: '已通过',
    rejected: '已拒绝',
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 统计卡片区域 */
.stats-cards-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
}

.stat-icon.applications {
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
}

.stat-icon.counselors {
  background: linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #d1fae5 0%, #10b981 100%);
}

.stat-icon.consultations {
  background: linear-gradient(135deg, #e0e7ff 0%, #8b5cf6 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-trend {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #fee2e2;
  color: #dc2626;
}

.stat-trend.positive {
  background: #dcfce7;
  color: #16a34a;
}

/* 区域标题样式 */
.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #e5e7eb;
}

.refresh-icon {
  font-size: 14px;
}

/* 最近活动区域 */
.recent-activities-section {
  margin-bottom: 24px;
}

.activities-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background: #f9fafb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.activity-desc {
  font-size: 13px;
  color: #6b7280;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.activity-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.activity-status.approved {
  background: #dcfce7;
  color: #16a34a;
}

.activity-status.info {
  background: #dbeafe;
  color: #2563eb;
}

.activity-status.success {
  background: #dcfce7;
  color: #16a34a;
}

.activity-status.warning {
  background: #fef3c7;
  color: #d97706;
}

/* 系统状态区域 */
.system-status-section {
  margin-bottom: 24px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.status-indicator.healthy {
  background: #10b981;
}

.status-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.status-value {
  font-size: 13px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>

