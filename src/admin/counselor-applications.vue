<template>
  <div class="counselor-applications">
    <div class="header">
      <h1>咨询师申请管理</h1>
      <div class="header-actions">
        <button @click="$router.push('/admin/counselors')" class="nav-btn">
          查看咨询师列表
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <select v-model="filterStatus" @change="loadApplications" class="filter-select">
        <option value="">全部状态</option>
        <option value="PENDING">待审核</option>
        <option value="APPROVED">已通过</option>
        <option value="REJECTED">已拒绝</option>
      </select>
      <button @click="refreshData" class="refresh-btn">刷新</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      正在加载咨询师申请列表...
    </div>

    <!-- 申请列表 -->
    <div v-else class="applications-list">
      <div v-if="applications.length === 0" class="no-data">
        暂无咨询师申请数据
      </div>
      
      <div v-for="application in applications" :key="application.id" class="application-card">
        <div class="application-header">
          <h3>{{ application.name }}</h3>
          <span :class="['status', application.status]">
            {{ getStatusText(application.status) }}
          </span>
        </div>
        
        <div class="application-info">
          <div class="info-item">
            <label>用户ID：</label>
            <span>{{ application.userId }}</span>
          </div>
          <div class="info-item">
            <label>手机号：</label>
            <span>{{ application.phone }}</span>
          </div>
          <div class="info-item">
            <label>申请时间：</label>
            <span>{{ formatDate(application.createdAt) }}</span>
          </div>
          <div class="info-item" v-if="application.specialty && application.specialty.length > 0">
            <label>专业领域：</label>
            <span class="specialty-tags">
              <span v-for="spec in application.specialty" :key="spec" class="specialty-tag">
                {{ spec }}
              </span>
            </span>
          </div>
          <div class="info-item" v-if="application.reason">
            <label>申请理由：</label>
            <div class="reason-text">{{ application.reason }}</div>
          </div>
        </div>
        
        <div class="application-actions" v-if="application.status === 'PENDING'">
          <button @click="approveApplication(application.id)" class="approve-btn">
            通过
          </button>
          <button @click="rejectApplication(application.id)" class="reject-btn">
            拒绝
          </button>
          <button @click="viewDetail(application)" class="detail-btn">
            详情
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage <= 1"
        class="page-btn"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage >= totalPages"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/utils/adminAPI.js'

// 申请管理相关数据
const applications = ref([])
const loading = ref(false)
const filterStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// 加载申请列表
async function loadApplications() {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      size: pageSize,
      status: filterStatus.value || undefined
    }
    
    console.log('🔄 获取咨询师申请列表，参数：', params)
    
    const response = await adminAPI.getCounselorApplications(params)
    
    console.log('📥 咨询师申请列表响应：', response)
    
    // 处理直接返回数组的情况
    if (Array.isArray(response)) {
      applications.value = response
      totalPages.value = Math.ceil(response.length / pageSize)
      console.log('✅ 成功加载咨询师申请列表，共', response.length, '条记录')
    } else if (response && response.data) {
      applications.value = response.data
      totalPages.value = Math.ceil((response.total || 0) / pageSize)
    } else {
      console.log('❌ 响应格式不正确')
      applications.value = []
    }
    
  } catch (error) {
    console.error('❌ 获取申请列表失败：', error)
    alert('获取申请列表失败，请检查网络连接或重试')
    applications.value = []
  } finally {
    loading.value = false
  }
}

// 审核操作
async function approveApplication(applicationId) {
  if (!confirm('确定要通过这个申请吗？')) return
  
  try {
    await adminAPI.reviewApplication(applicationId, true, '申请材料完整，专业背景符合要求')
    alert('审核通过成功')
    loadApplications()
  } catch (error) {
    console.error('审核失败：', error)
    alert('审核操作失败，请重试')
  }
}

async function rejectApplication(applicationId) {
  const reason = prompt('请输入拒绝理由：')
  if (!reason) return
  
  try {
    await adminAPI.reviewApplication(applicationId, false, reason)
    alert('已拒绝申请')
    loadApplications()
  } catch (error) {
    console.error('审核失败：', error)
    alert('审核操作失败，请重试')
  }
}

// 查看详情
function viewDetail(application) {
  const specialtyText = application.specialty ? application.specialty.join('、') : '无'
  alert(`申请详情：
姓名：${application.name}
用户ID：${application.userId}
手机：${application.phone}
状态：${getStatusText(application.status)}
专业领域：${specialtyText}
申请理由：${application.reason || '无'}
申请时间：${formatDate(application.createdAt)}`)
}

// 刷新数据
function refreshData() {
  currentPage.value = 1
  loadApplications()
}

// 分页
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadApplications()
}

// 工具函数
function getStatusText(status) {
  const statusMap = {
    'PENDING': '待审核',
    'APPROVED': '已通过', 
    'REJECTED': '已拒绝',
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.counselor-applications {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
}

.nav-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.nav-btn:hover {
  background: #2980b9;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #2980b9;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.applications-list {
  display: grid;
  gap: 20px;
}

.application-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.application-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.PENDING {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status.APPROVED {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.REJECTED {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.application-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.info-item label {
  font-weight: 500;
  color: #34495e;
  margin-bottom: 4px;
  font-size: 14px;
}

.info-item span {
  color: #2c3e50;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.specialty-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #bbdefb;
}

.reason-text {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #6c757d;
  margin-top: 5px;
  font-size: 14px;
  line-height: 1.4;
  color: #495057;
  max-width: 500px;
  word-wrap: break-word;
}

.application-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.approve-btn, .reject-btn, .detail-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.approve-btn {
  background: #27ae60;
  color: white;
}

.approve-btn:hover {
  background: #229954;
}

.reject-btn {
  background: #e74c3c;
  color: white;
}

.reject-btn:hover {
  background: #c0392b;
}

.detail-btn {
  background: #95a5a6;
  color: white;
}

.detail-btn:hover {
  background: #7f8c8d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
}

.page-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #2980b9;
}

.page-info {
  color: #7f8c8d;
  font-size: 14px;
}
</style>
