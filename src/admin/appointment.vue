<template>
  <div class="appointment-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>预约管理</h1>
      <div class="header-actions">
        <button @click="loadAppointments" class="refresh-btn" :disabled="loading">
          🔄 刷新
        </button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>状态筛选：</label>
        <select v-model="filterStatus" @change="onFilter">
          <option value="">全部状态</option>
          <option value="PENDING">待确认</option>
          <option value="CONFIRMED">已确认</option>
          <option value="CANCELLED">已取消</option>
          <option value="COMPLETED">已完成</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>咨询师：</label>
        <input 
          v-model="filterConsultant" 
          @input="onFilter"
          placeholder="搜索咨询师姓名"
          class="filter-input"
        />
      </div>
      
      <div class="filter-group">
        <label>用户：</label>
        <input 
          v-model="filterUser" 
          @input="onFilter"
          placeholder="搜索用户姓名"
          class="filter-input"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载预约列表中...</p>
    </div>

    <!-- 错误信息 -->
    <div v-else-if="error" class="error-message">
      <h3>❌ 加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadAppointments" class="retry-btn">重试</button>
    </div>

    <!-- 预约列表 -->
    <div v-else class="appointment-list">
      <div v-if="filteredAppointments.length === 0" class="no-data">
        <p>暂无预约记录</p>
      </div>
      
      <div v-else class="appointment-table">
        <div class="table-header">
          <div class="th">预约ID</div>
          <div class="th">用户</div>
          <div class="th">咨询师</div>
          <div class="th">预约时间</div>
          <div class="th">状态</div>
          <div class="th">备注</div>
          <div class="th">创建时间</div>
          <div class="th">操作</div>
        </div>
        
        <div 
          v-for="appointment in filteredAppointments" 
          :key="appointment.id"
          class="table-row"
        >
          <div class="td">{{ appointment.id }}</div>
          <div class="td">
            <div class="user-info">
              <span class="name">{{ appointment.userName }}</span>
              <span class="id">(ID: {{ appointment.userId }})</span>
            </div>
          </div>
          <div class="td">
            <div class="consultant-info">
              <span class="name">{{ appointment.consultantName }}</span>
              <span class="id">(ID: {{ appointment.consultantId }})</span>
            </div>
          </div>
          <div class="td">
            <div class="time-range">
              <div class="start-time">{{ formatDateTime(appointment.startTime) }}</div>
              <div class="end-time">至 {{ formatTime(appointment.endTime) }}</div>
            </div>
          </div>
          <div class="td">
            <span class="status-badge" :class="getStatusClass(appointment.status)">
              {{ getStatusText(appointment.status) }}
            </span>
          </div>
          <div class="td">
            <span class="note">{{ appointment.note || '无备注' }}</span>
          </div>
          <div class="td">
            <div class="created-time">{{ formatDateTime(appointment.createdAt) }}</div>
          </div>
          <div class="td">
            <div class="action-buttons">
              <button 
                v-if="appointment.status === 'PENDING'"
                @click="updateStatus(appointment.id, 'CONFIRMED')"
                class="btn btn-confirm"
              >
                确认
              </button>
              <button 
                v-if="appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'"
                @click="updateStatus(appointment.id, 'CANCELLED')"
                class="btn btn-cancel"
              >
                取消
              </button>
              <button 
                v-if="appointment.status === 'CONFIRMED'"
                @click="updateStatus(appointment.id, 'COMPLETED')"
                class="btn btn-complete"
              >
                完成
              </button>
              <button 
                @click="viewDetail(appointment)"
                class="btn btn-detail"
              >
                详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="filteredAppointments.length > 0" class="stats-section">
      <div class="stats-card">
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="label">总预约数</span>
            <span class="value">{{ filteredAppointments.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">待确认</span>
            <span class="value pending">{{ getStatusCount('PENDING') }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已确认</span>
            <span class="value confirmed">{{ getStatusCount('CONFIRMED') }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已取消</span>
            <span class="value cancelled">{{ getStatusCount('CANCELLED') }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已完成</span>
            <span class="value completed">{{ getStatusCount('COMPLETED') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '@/utils/adminAPI.js'

const appointments = ref([])
const loading = ref(false)
const error = ref('')
const filterStatus = ref('')
const filterConsultant = ref('')
const filterUser = ref('')

// 筛选后的预约列表
const filteredAppointments = computed(() => {
  let result = appointments.value

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(appointment => appointment.status === filterStatus.value)
  }

  // 咨询师筛选
  if (filterConsultant.value) {
    const keyword = filterConsultant.value.toLowerCase()
    result = result.filter(appointment => 
      appointment.consultantName.toLowerCase().includes(keyword)
    )
  }

  // 用户筛选
  if (filterUser.value) {
    const keyword = filterUser.value.toLowerCase()
    result = result.filter(appointment => 
      appointment.userName.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 加载预约列表
const loadAppointments = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await adminAPI.getAllAppointments()
    
    if (res && Array.isArray(res)) {
      appointments.value = res
    } else if (res && res.success && res.data) {
      appointments.value = res.data
    } else {
      error.value = res?.message || '获取预约列表失败'
      appointments.value = []
    }
    
  } catch (e) {
    error.value = '网络错误，请稍后重试'
    console.error('加载预约列表失败:', e)
    appointments.value = []
  } finally {
    loading.value = false
  }
}

// 更新预约状态
const updateStatus = async (appointmentId, newStatus) => {
  const statusNames = {
    'CONFIRMED': '确认',
    'CANCELLED': '取消',
    'COMPLETED': '完成'
  }
  
  if (!confirm(`确定要${statusNames[newStatus]}这个预约吗？`)) {
    return
  }
  
  try {
    // 这里调用更新状态的API
    // await adminAPI.updateAppointmentStatus(appointmentId, newStatus)
    
    // 临时更新本地状态
    const appointment = appointments.value.find(a => a.id === appointmentId)
    if (appointment) {
      appointment.status = newStatus
    }
    
    alert(`预约已${statusNames[newStatus]}`)
  } catch (e) {
    console.error('更新预约状态失败:', e)
    alert('操作失败，请稍后重试')
  }
}

// 查看详情
const viewDetail = (appointment) => {
  alert(`预约详情\n\nID: ${appointment.id}\n用户: ${appointment.userName}\n咨询师: ${appointment.consultantName}\n时间: ${formatDateTime(appointment.startTime)} - ${formatTime(appointment.endTime)}\n状态: ${getStatusText(appointment.status)}\n备注: ${appointment.note || '无'}\n创建时间: ${formatDateTime(appointment.createdAt)}`)
}

// 筛选处理
const onFilter = () => {
  // 筛选逻辑已在 computed 中处理
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时间
const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'PENDING': 'status-pending',
    'CONFIRMED': 'status-confirmed',
    'CANCELLED': 'status-cancelled',
    'COMPLETED': 'status-completed'
  }
  return classMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'CANCELLED': '已取消',
    'COMPLETED': '已完成'
  }
  return textMap[status] || status
}

// 获取状态统计
const getStatusCount = (status) => {
  return filteredAppointments.value.filter(appointment => appointment.status === status).length
}

// 页面加载时获取数据
onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.appointment-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.refresh-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.filter-group select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
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

.error-message {
  text-align: center;
  padding: 40px;
  color: #dc3545;
}

.retry-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 15px;
}

.appointment-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 150px 150px 180px 100px 120px 160px 180px;
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 150px 150px 180px 100px 120px 160px 180px;
  border-bottom: 1px solid #dee2e6;
}

.table-row:hover {
  background: #f8f9fa;
}

.th, .td {
  padding: 15px 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.th {
  justify-content: center;
  text-align: center;
}

.user-info, .consultant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .name, .consultant-info .name {
  font-weight: 500;
  color: #2c3e50;
}

.user-info .id, .consultant-info .id {
  font-size: 12px;
  color: #6c757d;
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.start-time {
  font-weight: 500;
  color: #2c3e50;
}

.end-time {
  font-size: 12px;
  color: #6c757d;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.note {
  font-size: 13px;
  color: #6c757d;
  word-break: break-word;
}

.created-time {
  font-size: 12px;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-confirm {
  background: #28a745;
  color: white;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-complete {
  background: #007bff;
  color: white;
}

.btn-detail {
  background: #6c757d;
  color: white;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background: white;
  border-radius: 8px;
}

.stats-section {
  margin-top: 30px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-item .label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.stat-item .value {
  font-size: 24px;
  font-weight: 600;
}

.stat-item .value.pending {
  color: #ffc107;
}

.stat-item .value.confirmed {
  color: #17a2b8;
}

.stat-item .value.cancelled {
  color: #dc3545;
}

.stat-item .value.completed {
  color: #28a745;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-header, .table-row {
    grid-template-columns: 60px 130px 130px 160px 90px 100px 140px 160px;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(8, auto);
  }
  
  .th, .td {
    justify-content: flex-start;
    border-bottom: 1px solid #dee2e6;
  }
  
  .th::before, .td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 10px;
    min-width: 80px;
  }
}
</style>