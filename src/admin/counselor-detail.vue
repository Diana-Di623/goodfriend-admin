
<template>
  <div class="counselor-detail-page">
    <!-- 头部 -->
    <div class="header">
      <div class="header-content">
        <div class="nav-left" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">返回</span>
        </div>
        <h1 class="title">咨询师详情</h1>
        <div class="nav-right">
          <button 
            class="action-btn" 
            @click="toggleCounselorStatus"
            v-if="counselor.id"
          >
            {{ counselor.status === 'active' ? '停用' : '启用' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>正在加载咨询师详情...</p>
    </div>

    <!-- 咨询师详情内容 -->
    <div v-else-if="counselor.id" class="counselor-content">
      <!-- 基本信息 -->
      <div class="info-card">
        <div class="counselor-header">
          <div class="avatar-section">
            <img 
              :src="getAvatarUrl(counselor.avatar)"
              class="counselor-avatar"
              alt="咨询师头像"
            />
            <div class="status-indicator" :class="{ active: counselor.status === 'active' }">
              <span class="status-text">{{ counselor.status === 'active' ? '在职' : '离职' }}</span>
            </div>
          </div>
          
          <div class="basic-info">
            <h2 class="counselor-name">{{ counselor.name || '未知' }}</h2>
            <p class="counselor-title">{{ counselor.level || '心理咨询师' }}</p>
            <div class="rating-section">
              <div class="stars">
                <span 
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= (counselor.rating || 0) }"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">{{ counselor.rating || 0 }}/5.0</span>
            </div>
            <p class="experience-text">从业经验：{{ counselor.experienceYears || 0 }}年</p>
          </div>
        </div>
        
        <div class="contact-info">
          <div class="contact-item" v-if="counselor.phone">
            <label>手机号：</label>
            <span>{{ counselor.phone }}</span>
          </div>
          <div class="contact-item" v-if="counselor.email">
            <label>邮箱：</label>
            <span>{{ counselor.email }}</span>
          </div>
          <div class="contact-item">
            <label>性别：</label>
            <span>{{ getGenderText(counselor.gender) }}</span>
          </div>
          <div class="contact-item" v-if="counselor.location">
            <label>所在地：</label>
            <span>{{ counselor.location }}</span>
          </div>
        </div>
      </div>

      <!-- 专业信息 -->
      <div class="info-card" v-if="counselor.specialty && counselor.specialty.length > 0">
        <h3>专业领域</h3>
        <div class="specialty-tags">
          <span 
            v-for="spec in counselor.specialty" 
            :key="spec" 
            class="specialty-tag"
            v-if="spec !== '未填写'"
          >
            {{ spec }}
          </span>
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="info-card" v-if="counselor.bio">
        <h3>个人简介</h3>
        <p class="bio-text">{{ counselor.bio }}</p>
      </div>

      <!-- 教育背景 -->
      <div class="info-card" v-if="counselor.educationList && counselor.educationList.length > 0">
        <h3>教育背景</h3>
        <div class="education-list">
          <div 
            v-for="education in counselor.educationList" 
            :key="education.school + education.time"
            class="education-item"
          >
            <div class="education-degree">{{ education.degree }}</div>
            <div class="education-school">{{ education.school }}</div>
            <div class="education-major">{{ education.major }}</div>
            <div class="education-time">{{ education.time }}</div>
          </div>
        </div>
      </div>

      <!-- 工作经历 -->
      <div class="info-card" v-if="counselor.experienceList && counselor.experienceList.length > 0">
        <h3>工作经历</h3>
        <div class="experience-list">
          <div 
            v-for="experience in counselor.experienceList" 
            :key="experience.company + experience.duration"
            class="experience-item"
          >
            <div class="experience-company">{{ experience.company }}</div>
            <div class="experience-position">{{ experience.position }}</div>
            <div class="experience-duration">{{ experience.duration }}</div>
            <div class="experience-description">{{ experience.description }}</div>
          </div>
        </div>
      </div>

      <!-- 认证资质 -->
      <div class="info-card" v-if="counselor.certificationList && counselor.certificationList.length > 0">
        <h3>认证资质</h3>
        <div class="certification-list">
          <div 
            v-for="cert in counselor.certificationList" 
            :key="cert.number"
            class="certification-item"
          >
            <div class="certification-name">{{ cert.name }}</div>
            <div class="certification-number">证书编号：{{ cert.number }}</div>
            <div class="certification-issuer">发证机构：{{ cert.issuer }}</div>
            <div class="certification-date">发证时间：{{ cert.date }}</div>
          </div>
        </div>
      </div>

      <!-- 服务统计 -->
      <div class="info-card">
        <h3>服务统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ counselor.consultationHours || 0 }}</span>
            <span class="stat-label">咨询时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ counselor.experienceYears || 0 }}</span>
            <span class="stat-label">从业年限</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ counselor.trainingHours || 0 }}</span>
            <span class="stat-label">培训时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ counselor.supervisionHours || 0 }}</span>
            <span class="stat-label">督导时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ counselor.rating || 0 }}</span>
            <span class="stat-label">平均评分</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">¥{{ counselor.pricePerHour || 0 }}</span>
            <span class="stat-label">每小时费用</span>
          </div>
        </div>
      </div>

      <!-- 服务信息 -->
      <div class="info-card" v-if="counselor.consultationMethods || counselor.availability">
        <h3>服务信息</h3>
        <div class="service-info">
          <div class="service-item" v-if="counselor.consultationMethods">
            <label>咨询方式：</label>
            <span>{{ counselor.consultationMethods.join(', ') }}</span>
          </div>
          <div class="service-item" v-if="counselor.availability">
            <label>服务时间：</label>
            <span>{{ counselor.availability }}</span>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="info-card" v-if="recentActivities.length > 0">
        <h3>最近活动</h3>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <span class="activity-icon">{{ activity.icon }}</span>
            <div class="activity-content">
              <p class="activity-text">{{ activity.description }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data">
      <p>未找到咨询师信息</p>
      <button @click="goBack" class="back-btn">返回列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminAPI } from '../utils/adminAPI.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const counselor = ref({})
const recentActivities = ref([])

// 获取性别显示文本
function getGenderText(gender) {
  switch (gender) {
    case 'MALE': return '男'
    case 'FEMALE': return '女'
    default: return '未知'
  }
}

// 格式化时间
function formatTime(timeString) {
  if (!timeString) return ''
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN')
  } catch (error) {
    return timeString
  }
}

// 获取头像URL
function getAvatarUrl(avatar) {
  
    return `http://127.0.0.1:8080/static/${avatar}`
  }

// 返回上一页
function goBack() {
  router.back()
}

// 切换咨询师状态
async function toggleCounselorStatus() {
  if (!counselor.value.id) return
  
  const action = counselor.value.status === 'active' ? '停用' : '启用'
  const confirmMessage = `确定要${action}这位咨询师吗？`
  
  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      const newStatus = counselor.value.status === 'active' ? 'inactive' : 'active'
      
      const response = await adminAPI.updateCounselorStatus(counselor.value.id, newStatus)
      if (response.success) {
        counselor.value.status = newStatus
        alert(`咨询师已${action}`)
      } else {
        throw new Error(response.message || `${action}失败`)
      }
    } catch (error) {
      console.error('更新咨询师状态失败:', error)
      alert(`${action}失败，请稍后重试`)
    } finally {
      loading.value = false
    }
  }
}

// 加载咨询师详情
async function loadCounselorDetail(counselorId) {
  try {
    loading.value = true
    console.log('=== 加载咨询师详情 ===')
    console.log('咨询师ID:', counselorId)
    
    // 由于单个咨询师详情API不存在，从所有咨询师列表中查找
    console.log('从咨询师列表中查找详情信息...')
    const response = await adminAPI.getAllConsultants()
    console.log('咨询师列表响应:', response)
    
    // 处理响应数据，查找目标咨询师
    let consultantsList = []
    if (Array.isArray(response)) {
      consultantsList = response
    } else if (response && response.data && Array.isArray(response.data)) {
      consultantsList = response.data
    } else if (response && response.success && response.data && Array.isArray(response.data)) {
      consultantsList = response.data
    }
    
    console.log('咨询师列表:', consultantsList)
    const targetCounselor = consultantsList.find(c => c.id == counselorId)
    console.log('找到的咨询师:', targetCounselor)
    
    if (targetCounselor) {
      counselor.value = targetCounselor
      console.log('咨询师详情加载成功:', counselor.value)
      
      // 加载更多详细信息
      await loadAdditionalInfo(counselorId)
    } else {
      console.error('未找到指定的咨询师')
      console.error('咨询师ID:', counselorId)
      console.error('可用的咨询师列表:', consultantsList.map(c => ({ id: c.id, name: c.name })))
      throw new Error(`未找到ID为 ${counselorId} 的咨询师`)
    }
  } catch (error) {
    console.error('加载咨询师详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载额外信息（统计数据、活动记录等）
async function loadAdditionalInfo(counselorId) {
  try {
    // 并行加载多个API
    const [statsResponse, activitiesResponse] = await Promise.allSettled([
      adminAPI.getCounselorStats(counselorId),
      adminAPI.getCounselorActivities(counselorId, { page: 1, size: 10 })
    ])
    
    // 处理统计信息
    if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
      const stats = statsResponse.value.data
      // 将统计信息合并到咨询师数据中
      counselor.value = { ...counselor.value, ...stats }
      console.log('统计信息加载成功')
    }
    
    // 处理活动记录
    if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.success) {
      const activities = activitiesResponse.value.data
      recentActivities.value = Array.isArray(activities) ? activities : activities.list || []
      console.log('活动记录加载成功:', recentActivities.value.length, '条')
    }
    
  } catch (error) {
    console.error('加载额外信息失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  const counselorId = route.params.id
  if (counselorId) {
    loadCounselorDetail(counselorId)
  } else {
    console.error('未找到咨询师ID')
  }
})
</script>

<style scoped>
.counselor-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #007bff;
}

.back-icon {
  font-size: 18px;
  margin-right: 5px;
}

.title {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:hover {
  background: #0056b3;
}

.loading {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.counselor-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.avatar-section {
  text-align: center;
}

.counselor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  margin-top: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: #dc3545;
  color: white;
}

.status-indicator.active {
  background: #28a745;
}

.basic-info h2 {
  margin: 0 0 5px 0;
  color: #333;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.star {
  color: #ddd;
  font-size: 16px;
}

.star.filled {
  color: #ffc107;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.contact-item {
  display: flex;
  gap: 10px;
}

.contact-item label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.specialty-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.bio-text {
  line-height: 1.6;
  color: #555;
}

.education-list, .experience-list, .certification-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.education-item, .experience-item, .certification-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-item {
  display: flex;
  gap: 10px;
}

.service-item label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  color: #333;
}

.activity-time {
  color: #666;
  font-size: 12px;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.back-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .counselor-header {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
