<template>
  <div class="counselor-management">
    <div class="header">
      <h1>咨询师管理</h1>
      <div class="header-actions">
        <button @click="$router.push('/admin/counselors/applications')" class="nav-btn">
          管理申请
        </button>
        <button @click="$router.push('/admin/counselors/create')" class="create-btn">
          + 添加咨询师
        </button>
      </div>
    </div>

    <!-- 搜索和筛选器 -->
    <div class="filters">
      <input 
        v-model="searchKeyword" 
        @input="handleSearch"
        placeholder="搜索咨询师姓名、手机号或专业领域..."
        class="search-input"
      />
      <select v-model="statusFilter" @change="handleFilter" class="filter-select">
        <option value="">全部状态</option>
        <option value="active">在职</option>
        <option value="inactive">离职</option>
      </select>
      <button @click="refreshData" class="refresh-btn">刷新</button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总咨询师：</span>
        <span class="stat-value">{{ consultants.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">在职：</span>
        <span class="stat-value active">{{ activeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">离职：</span>
        <span class="stat-value inactive">{{ inactiveCount }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      正在加载咨询师列表...
    </div>

    <!-- 咨询师列表 -->
    <div v-else class="consultants-list">
      <div v-if="filteredConsultants.length === 0" class="no-data">
        <div class="no-data-icon">👥</div>
        <div class="no-data-text">暂无咨询师数据</div>
        <button @click="$router.push('/admin/counselors/create')" class="add-first-btn">
          添加第一位咨询师
        </button>
      </div>
      
      <div v-for="consultant in filteredConsultants" :key="consultant.id" class="consultant-card">
        <div class="consultant-header">
          <div class="consultant-basic">
            <h3>{{ consultant.name }}</h3>
            <span v-if="consultant.title" class="consultant-title">{{ consultant.title }}</span>
          </div>
          <span :class="['status', consultant.status || 'active']">
            {{ getStatusText(consultant.status) }}
          </span>
        </div>
        
        <div class="consultant-info">
          <div class="info-section">
            <div class="info-item" v-if="consultant.id">
              <label>ID：</label>
              <span>{{ consultant.id }}</span>
            </div>
            <div class="info-item" v-if="consultant.phone">
              <label>手机：</label>
              <span>{{ consultant.phone }}</span>
            </div>
            <div class="info-item" v-if="consultant.email">
              <label>邮箱：</label>
              <span>{{ consultant.email }}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-item" v-if="consultant.experience">
              <label>经验：</label>
              <span>{{ consultant.experience }}年</span>
            </div>
            <div class="info-item" v-if="consultant.createdAt">
              <label>加入时间：</label>
              <span>{{ formatDate(consultant.createdAt) }}</span>
            </div>
          </div>
          
          <div class="info-section full-width" v-if="consultant.specialty && consultant.specialty.length > 0">
            <div class="info-item">
              <label>专业领域：</label>
              <div class="specialty-tags">
                <span v-for="spec in consultant.specialty" :key="spec" class="specialty-tag">
                  {{ spec }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="info-section full-width" v-else-if="consultant.specialties">
            <div class="info-item">
              <label>专业领域：</label>
              <span>{{ consultant.specialties }}</span>
            </div>
          </div>
          
          <div class="info-section full-width" v-if="consultant.introduction">
            <div class="info-item">
              <label>个人简介：</label>
              <div class="introduction-text">{{ consultant.introduction }}</div>
            </div>
          </div>
        </div>
        
        <div class="consultant-actions">
          <button @click="viewDetail(consultant)" class="detail-btn">
            详情
          </button>
          <button @click="editConsultant(consultant)" class="edit-btn">
            编辑
          </button>
          <button 
            @click="toggleStatus(consultant)" 
            :class="getStatusButtonClass(consultant.status)"
          >
            {{ getStatusButtonText(consultant.status) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI } from '../utils/adminAPI.js'

export default {
  name: 'CounselorManagement',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const consultants = ref([])
    const searchKeyword = ref('')
    const statusFilter = ref('')

    // 计算属性
    const filteredConsultants = computed(() => {
      let filtered = consultants.value

      // 按状态筛选
      if (statusFilter.value) {
        filtered = filtered.filter(consultant => 
          (consultant.status || 'active') === statusFilter.value
        )
      }

      // 按关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(consultant => {
          return (
            consultant.name?.toLowerCase().includes(keyword) ||
            consultant.phone?.includes(keyword) ||
            consultant.email?.toLowerCase().includes(keyword) ||
            (consultant.specialty && consultant.specialty.some(spec => 
              spec.toLowerCase().includes(keyword)
            )) ||
            consultant.specialties?.toLowerCase().includes(keyword)
          )
        })
      }

      return filtered
    })

    const activeCount = computed(() => 
      consultants.value.filter(c => (c.status || 'active') === 'active').length
    )

    const inactiveCount = computed(() => 
      consultants.value.filter(c => c.status === 'inactive').length
    )

    // 加载咨询师数据
    const loadConsultants = async () => {
      try {
        loading.value = true
        console.log('正在加载咨询师列表...')
        
        const response = await adminAPI.getAllConsultants()
        console.log('咨询师数据响应:', response)
        
        if (response && Array.isArray(response)) {
          consultants.value = response
          console.log(`成功加载 ${response.length} 位咨询师`)
        } else {
          console.warn('咨询师数据格式不正确:', response)
          consultants.value = []
        }
      } catch (error) {
        console.error('加载咨询师列表失败:', error)
        consultants.value = []
        // 可以在这里添加错误提示
      } finally {
        loading.value = false
      }
    }

    // 刷新数据
    const refreshData = () => {
      loadConsultants()
    }

    // 搜索处理
    const handleSearch = () => {
      // 搜索是响应式的，不需要额外处理
    }

    // 筛选处理
    const handleFilter = () => {
      // 筛选是响应式的，不需要额外处理
    }

    // 状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'active': return '在职'
        case 'inactive': return '离职'
        default: return '在职'
      }
    }

    // 状态按钮样式
    const getStatusButtonClass = (status) => {
      return status === 'inactive' ? 'activate-btn' : 'deactivate-btn'
    }

    // 状态按钮文本
    const getStatusButtonText = (status) => {
      return status === 'inactive' ? '恢复在职' : '设为离职'
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return dateString
      }
    }

    // 查看详情
    const viewDetail = (consultant) => {
      router.push(`/admin/counselors/${consultant.id}`)
    }

    // 编辑咨询师
    const editConsultant = (consultant) => {
      router.push(`/admin/counselors/${consultant.id}/edit`)
    }

    // 切换状态
    const toggleStatus = async (consultant) => {
      try {
        const newStatus = consultant.status === 'inactive' ? 'active' : 'inactive'
        const action = newStatus === 'active' ? '恢复在职' : '设为离职'
        
        if (confirm(`确定要将 ${consultant.name} ${action}吗？`)) {
          // 这里需要调用更新状态的API
          // await adminAPI.updateConsultantStatus(consultant.id, newStatus)
          
          // 临时更新本地状态
          consultant.status = newStatus
          console.log(`${consultant.name} 状态已更新为: ${newStatus}`)
        }
      } catch (error) {
        console.error('更新咨询师状态失败:', error)
        alert('更新状态失败，请稍后重试')
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadConsultants()
    })

    return {
      loading,
      consultants,
      filteredConsultants,
      searchKeyword,
      statusFilter,
      activeCount,
      inactiveCount,
      refreshData,
      handleSearch,
      handleFilter,
      getStatusText,
      getStatusButtonClass,
      getStatusButtonText,
      formatDate,
      viewDetail,
      editConsultant,
      toggleStatus
    }
  }
}
</script>

<style scoped>
.counselor-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: #007bff;
  color: white;
}

.create-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #218838;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-width: 120px;
}

.refresh-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover {
  background: #5a6268;
}

.stats-bar {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  font-size: 16px;
}

.stat-value.active {
  color: #28a745;
}

.stat-value.inactive {
  color: #dc3545;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.consultants-list {
  display: grid;
  gap: 20px;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-data-text {
  font-size: 16px;
  margin-bottom: 20px;
}

.add-first-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.add-first-btn:hover {
  background: #0056b3;
}

.consultant-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.consultant-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.consultant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.consultant-basic h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.consultant-title {
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.consultant-info {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-section.full-width {
  grid-column: 1 / -1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: bold;
  color: #555;
  font-size: 13px;
}

.info-item span {
  color: #333;
  font-size: 14px;
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
  font-weight: 500;
}

.introduction-text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.consultant-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.consultant-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.detail-btn {
  background: #6c757d;
  color: white;
}

.detail-btn:hover {
  background: #5a6268;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.activate-btn {
  background: #28a745;
  color: white;
}

.activate-btn:hover {
  background: #218838;
}

.deactivate-btn {
  background: #dc3545;
  color: white;
}

.deactivate-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .stats-bar {
    flex-direction: column;
    gap: 10px;
  }

  .consultant-header {
    flex-direction: column;
    gap: 10px;
  }

  .info-section {
    grid-template-columns: 1fr;
  }

  .consultant-actions {
    flex-direction: column;
  }
}
</style>
