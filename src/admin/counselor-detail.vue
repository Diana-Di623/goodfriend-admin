<template>
  <view class="counselor-detail-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
          <text class="back-text">返回</text>
        </view>
        <text class="title">咨询师详情</text>
        <view class="nav-right">
          <view class="action-btn" @click="toggleCounselorStatus">
            <text class="action-text">{{ counselor.isActive ? '停用' : '启用' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 咨询师基本信息 -->
    <view class="counselor-info-section">
      <view class="info-card">
        <view class="counselor-header">
          <view class="avatar-section">
            <image 
              :src="counselor.avatar || '/static/user/avatars/default.jpg'"
              class="counselor-avatar"
              mode="aspectFill"
            />
            <view class="status-indicator" :class="{ active: counselor.isActive }">
              <text class="status-text">{{ counselor.isActive ? '在线' : '离线' }}</text>
            </view>
          </view>
          
          <view class="basic-info">
            <text class="counselor-name">{{ counselor.name || '未知' }}</text>
            <text class="counselor-title">{{ counselor.title || '心理咨询师' }}</text>
            <view class="rating-section">
              <view class="stars">
                <text 
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= (counselor.rating || 0) }"
                >
                  ★
                </text>
              </view>
              <text class="rating-text">{{ counselor.rating || 0 }}/5.0</text>
            </view>
            <text class="experience-text">从业经验：{{ counselor.experience || 0 }}年</text>
          </view>
        </view>
        
        <view class="contact-info">
          <view class="contact-item">
            <text class="contact-label">手机号：</text>
            <text class="contact-value">{{ counselor.phone || '未填写' }}</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">邮箱：</text>
            <text class="contact-value">{{ counselor.email || '未填写' }}</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">执业证书：</text>
            <text class="contact-value">{{ counselor.licenseNumber || '无' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 教育背景 -->
    <view class="education-section">
      <view class="section-header">
        <text class="section-title">教育背景</text>
      </view>
      <view class="info-card">
        <view class="education-item">
          <text class="education-label">学历：</text>
          <text class="education-value">{{ counselor.education || '未填写' }}</text>
        </view>
        <view class="education-item">
          <text class="education-label">毕业院校：</text>
          <text class="education-value">{{ counselor.university || '未填写' }}</text>
        </view>
        <view class="education-item">
          <text class="education-label">所学专业：</text>
          <text class="education-value">{{ counselor.major || '未填写' }}</text>
        </view>
      </view>
    </view>

    <!-- 专业信息 -->
    <view class="specialty-section">
      <view class="section-header">
        <text class="section-title">专业信息</text>
      </view>
      <view class="info-card">
        <view class="specialty-item">
          <text class="specialty-label">擅长领域：</text>
          <view class="specialty-tags">
            <text 
              v-for="specialty in (counselor.specialty || [])"
              :key="specialty"
              class="specialty-tag"
            >
              {{ specialty }}
            </text>
          </view>
        </view>
        <view class="specialty-item" v-if="counselor.bio">
          <text class="specialty-label">个人简介：</text>
          <text class="bio-text">{{ counselor.bio }}</text>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="statistics-section">
      <view class="section-header">
        <text class="section-title">服务统计</text>
      </view>
      <view class="info-card">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">{{ counselor.totalConsultations || 0 }}</text>
            <text class="stat-label">总咨询次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselor.totalClients || 0 }}</text>
            <text class="stat-label">服务客户数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselor.averageRating || 0 }}</text>
            <text class="stat-label">平均评分</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ counselor.responseRate || 0 }}%</text>
            <text class="stat-label">回复率</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近活动 -->
    <view class="activity-section">
      <view class="section-header">
        <text class="section-title">最近活动</text>
      </view>
      <view class="info-card">
        <view class="activity-list">
          <view 
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <view class="activity-icon">{{ activity.icon }}</view>
            <view class="activity-content">
              <text class="activity-text">{{ activity.description }}</text>
              <text class="activity-time">{{ formatTime(activity.time) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button 
        class="action-button"
        :class="{ 'deactivate-btn': counselor.isActive, 'activate-btn': !counselor.isActive }"
        @click="toggleCounselorStatus"
      >
        {{ counselor.isActive ? '停用咨询师' : '启用咨询师' }}
      </button>
      <button class="action-button contact-btn" @click="contactCounselor">
        联系咨询师
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '../utils/adminAPI.js'

// 咨询师信息
const counselor = ref({
  id: 1,
  name: '张心理医生',
  title: '国家二级心理咨询师',
  avatar: '/static/user/avatars/avatar1.jpg',
  phone: '138****1234',
  email: 'zhang@example.com',
  licenseNumber: 'PSY202301001',
  education: '硕士',
  university: '北京师范大学',
  major: '心理学',
  experience: 8,
  specialty: ['焦虑抑郁', '情感关系', '认知行为治疗'],
  bio: '拥有8年临床心理咨询经验，专注于认知行为疗法的应用，曾在多个心理健康机构任职，具有丰富的个体咨询和团体治疗经验。擅长处理焦虑、抑郁、情感问题等心理困扰。',
  isActive: true,
  rating: 4.8,
  totalConsultations: 256,
  totalClients: 189,
  averageRating: 4.8,
  responseRate: 95,
  joinDate: '2022-03-15T10:00:00Z'
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    icon: '💬',
    description: '完成了一次心理咨询',
    time: '2025-01-20T14:30:00Z'
  },
  {
    id: 2,
    icon: '📊',
    description: '更新了个人资料',
    time: '2025-01-19T09:15:00Z'
  },
  {
    id: 3,
    icon: '⭐',
    description: '收到客户5星好评',
    time: '2025-01-18T16:45:00Z'
  },
  {
    id: 4,
    icon: '📚',
    description: '参加了专业培训',
    time: '2025-01-17T11:20:00Z'
  }
])

onMounted(() => {
  // 从URL参数获取咨询师ID并加载详情
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const counselorId = currentPage.options.id
  
  if (counselorId) {
    loadCounselorDetail(counselorId)
  }
})

// 加载咨询师详情
async function loadCounselorDetail(counselorId) {
  try {
    uni.showLoading({ title: '加载中...' })
    
    // 调用API获取咨询师详情
    const response = await adminAPI.getCounselorDetail(counselorId)
    if (response.success) {
      counselor.value = {
        ...counselor.value, // 保留默认值
        ...response.data,   // 使用API返回的数据覆盖
        // 确保某些字段的格式正确
        specialty: Array.isArray(response.data.specialty) ? response.data.specialty : [response.data.specialty || '未填写'],
        isActive: response.data.status === 'active'
      }
    }
    
    uni.hideLoading()
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    console.error('加载咨询师详情失败:', error)
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack({
    delta: 1
  })
}

// 切换咨询师状态
function toggleCounselorStatus() {
  const action = counselor.value.isActive ? '停用' : '启用'
  const actionColor = counselor.value.isActive ? '#e74c3c' : '#67c23a'
  
  uni.showModal({
    title: '确认操作',
    content: `确定要${action}这位咨询师吗？${action}后咨询师将${counselor.value.isActive ? '无法接受新的咨询请求' : '重新开始接受咨询请求'}。`,
    confirmText: action,
    cancelText: '取消',
    confirmColor: actionColor,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: `${action}中...` })
          
          // 调用API更新咨询师状态
          const newStatus = counselor.value.isActive ? 'inactive' : 'active'
          const response = await adminAPI.updateCounselorStatus(counselor.value.id, newStatus)
          
          if (response.success) {
            counselor.value.isActive = !counselor.value.isActive
            
            uni.hideLoading()
            uni.showToast({
              title: `已${action}`,
              icon: 'success'
            })
          } else {
            throw new Error(response.message || `${action}失败`)
          }
          
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: `${action}失败`,
            icon: 'none'
          })
          console.error(`${action}咨询师失败:`, error)
        }
      }
    }
  })
}

// 联系咨询师
function contactCounselor() {
  uni.showActionSheet({
    itemList: ['发送短信', '拨打电话', '发送邮件'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          // 发送短信
          uni.showToast({
            title: '短信功能暂未开放',
            icon: 'none'
          })
          break
        case 1:
          // 拨打电话
          if (counselor.value.phone) {
            uni.makePhoneCall({
              phoneNumber: counselor.value.phone.replace(/\*/g, '1') // 实际应用中应该使用真实号码
            })
          }
          break
        case 2:
          // 发送邮件
          uni.showToast({
            title: '邮件功能暂未开放',
            icon: 'none'
          })
          break
      }
    }
  })
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
</script>

<style scoped>
.counselor-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

/* 头部样式 */
.header {
  background: #fff;
  padding: 44rpx 32rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}

.nav-left:active {
  background: rgba(0, 0, 0, 0.05);
}

.back-icon {
  font-size: 32rpx;
  color: #409eff;
  font-weight: bold;
}

.back-text {
  font-size: 24rpx;
  color: #409eff;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  text-align: center;
}

.nav-right {
  width: 120rpx;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 20rpx;
  background: #409eff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 22rpx;
  cursor: pointer;
}

.action-text {
  color: #fff;
  font-size: 22rpx;
}

/* 咨询师信息区域 */
.counselor-info-section {
  padding: 20rpx 32rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.counselor-header {
  display: flex;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.avatar-section {
  position: relative;
}

.counselor-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

.status-indicator {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 18rpx;
  border: 2rpx solid #fff;
  background: #ddd;
}

.status-indicator.active {
  background: #67c23a;
}

.status-text {
  color: #fff;
  font-size: 18rpx;
  font-weight: 500;
}

.basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.counselor-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #2c3e50;
}

.counselor-title {
  font-size: 28rpx;
  color: #666;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 28rpx;
  color: #ddd;
}

.star.filled {
  color: #ffd700;
}

.rating-text {
  font-size: 24rpx;
  color: #666;
}

.experience-text {
  font-size: 24rpx;
  color: #666;
}

.contact-info {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.contact-label {
  min-width: 120rpx;
  font-size: 24rpx;
  color: #666;
}

.contact-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

/* 部分标题 */
.section-header {
  padding: 20rpx 32rpx 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
}

/* 教育背景 */
.education-section {
  padding: 20rpx 32rpx;
}

.education-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.education-label {
  min-width: 120rpx;
  font-size: 24rpx;
  color: #666;
}

.education-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

/* 专业信息 */
.specialty-section {
  padding: 20rpx 32rpx;
}

.specialty-item {
  margin-bottom: 24rpx;
}

.specialty-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.specialty-tag {
  padding: 8rpx 16rpx;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.bio-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.6;
}

/* 统计信息 */
.statistics-section {
  padding: 20rpx 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.stat-item {
  text-align: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

/* 最近活动 */
.activity-section {
  padding: 20rpx 32rpx;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.activity-icon {
  width: 60rpx;
  height: 60rpx;
  background: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.activity-text {
  font-size: 24rpx;
  color: #333;
}

.activity-time {
  font-size: 20rpx;
  color: #999;
}

/* 操作按钮 */
.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 24rpx;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.activate-btn {
  background: #67c23a;
  color: #fff;
}

.deactivate-btn {
  background: #e6a23c;
  color: #fff;
}

.contact-btn {
  background: #409eff;
  color: #fff;
}

.action-button:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .counselor-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
}
</style>
