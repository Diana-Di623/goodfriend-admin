<template>
  <div class="user-management-container">
    <!-- 用户详情模式 -->
    <div v-if="isDetailMode" class="user-detail-container">
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="back-btn">
             返回用户列表
          </button>
          <h1>用户详情</h1>
        </div>
        <div class="header-right">
          <button @click="refreshUserDetail" class="refresh-btn" :disabled="loading">
             刷新
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载用户信息中...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <h3>❌ 加载失败</h3>
        <p>{{ error }}</p>
        <button @click="refreshUserDetail" class="retry-btn">重试</button>
      </div>

      <div v-else-if="currentUser.id" class="user-content">
        <!-- 用户基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <h2>基本信息</h2>
            <span class="user-id">ID: {{ currentUser.id }}</span>
          </div>
          <div class="card-body">
            <div class="avatar-section">
              <div class="avatar-container">
                <img 
                  :src="getAvatarUrl(currentUser.avatar)" 
                  :alt="currentUser.name + '的头像'"
                  class="user-avatar"
                  @error="onAvatarError"
                />
              </div>
              <div class="avatar-info">
                <h3>{{ currentUser.name || '未设置姓名' }}</h3>
                <p class="phone">📱 {{ currentUser.phone }}</p>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <label>手机号</label>
                <span>{{ currentUser.phone || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>年龄</label>
                <span>{{ currentUser.age || '未设置' }}岁</span>
              </div>
              <div class="info-item">
                <label>性别</label>
                <span>{{ formatGender(currentUser.gender) }}</span>
              </div>
              <div class="info-item">
                <label>生日</label>
                <span>{{ formatBirthday(currentUser.birthday) }}</span>
              </div>
              <div class="info-item">
                <label>地区</label>
                <span>{{ currentUser.region || '未设置' }}</span>
              </div>
              <div class="info-item full-width">
                <label>兴趣爱好</label>
                <span>{{ currentUser.hobby || '该用户还没有填写兴趣爱好' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区域 -->
        <div class="action-section">
          <h3>操作</h3>
          <div class="action-buttons">
            <button class="btn btn-primary">
              📝 编辑用户
            </button>
            <button class="btn btn-secondary">
              📧 发送消息
            </button>
            <button class="btn btn-warning">
              🔒 账户管理
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-data">
        <p>未找到用户信息</p>
      </div>
    </div>

    <!-- 用户列表模式 -->
    <div v-else class="user-list-container">
      <div class="page-header">
        <h1>用户管理</h1>
        <div class="header-actions">
          <button @click="loadUsers" class="refresh-btn" :disabled="loading">
             刷新
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载用户列表中...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <h3>❌ 加载失败</h3>
        <p>{{ error }}</p>
        <button @click="loadUsers" class="retry-btn">重试</button>
      </div>

      <div v-else class="user-list-section">
      <div class="list-controls">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索用户（姓名、手机号）"
            @input="onSearch"
          />
        </div>
        <div class="filter-controls">
          <select v-model="filterGender" @change="onFilter">
            <option value="">全部性别</option>
            <option value="MALE">男</option>
            <option value="FEMALE">女</option>
            <option value="UNKNOWN">未知</option>
          </select>
        </div>
      </div>

      <div v-if="filteredUsers.length === 0" class="no-data">
        <p>暂无用户数据</p>
      </div>

      <div v-else class="user-grid">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id" 
          class="user-card"
          @click="goToUserDetail(user.id)"
        >
          <div class="user-avatar">
            <img 
              :src="getAvatarUrl(user.avatar)" 
              :alt="user.name + '的头像'"
              @error="onAvatarError"
            />
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ user.name || '未设置姓名' }}</h3>
            <p class="user-phone">📱 {{ user.phone }}</p>
            <p class="user-details">
              <span class="age">{{ user.age || '--' }}岁</span>
              <span class="gender">{{ formatGender(user.gender) }}</span>
              <span class="region">{{ user.region || '未知地区' }}</span>
            </p>
          </div>
          <div class="user-actions">
            <button class="view-btn" @click.stop="goToUserDetail(user.id)">
              查看详情
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredUsers.length > 0" class="pagination">
        <span class="total-count">共 {{ filteredUsers.length }} 位用户</span>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminAPI } from '@/utils/adminAPI.js'

const route = useRoute()
const router = useRouter()
const BASE_URL = 'http://127.0.0.1:8080'
const users = ref([])
const currentUser = ref({})
const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')
const filterGender = ref('')

// 判断是否为详情模式
const isDetailMode = computed(() => {
  return route.params.id !== undefined
})

const filteredUsers = computed(() => {
  let result = users.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(user => 
      (user.name && user.name.toLowerCase().includes(keyword)) ||
      (user.phone && user.phone.includes(keyword))
    )
  }

  // 性别过滤
  if (filterGender.value) {
    result = result.filter(user => user.gender === filterGender.value)
  }

  return result
})

const getAvatarUrl = (avatar) => {
  return BASE_URL+`/static/${avatar}`
}

const onAvatarError = (event) => {
  event.target.src = BASE_URL+`/static/consultant/avatars/default.jpg`
}

const formatGender = (gender) => {
  const genderMap = {
    'MALE': '男',
    'FEMALE': '女', 
    'UNKNOWN': '未知',
    'OTHER': '其他'
  }
  return genderMap[gender] || '未设置'
}

const formatBirthday = (birthday) => {
  if (!birthday) return '未设置'
  return new Date(birthday).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push('/admin/users')
}

const goToUserDetail = (id) => {
  router.push(`/admin/users/${id}`)
}

const onSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const onFilter = () => {
  // 过滤逻辑已在 computed 中处理
}

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 使用 getAllUsers 方法获取所有用户，支持筛选参数
    const res = await adminAPI.getAllUsers({
      status: 'all',
      keyword: searchKeyword.value,
      page: 1,
      size: 1000 // 获取大量数据
    })
    
    if (res) {
      let userData = res
      
      // 如果返回的是分页数据，提取 items 或 list
      if (userData.items) {
        userData = userData.items
      } else if (userData.list) {
        userData = userData.list
      }
      
      // 应用性别过滤
      if (filterGender.value) {
        userData = userData.filter(user => user.gender === filterGender.value)
      }
      
      users.value = userData || []
    } else {
      error.value = res?.message || '获取用户列表失败'
      users.value = []
    }
    
  } catch (e) {
    error.value = '网络错误，请稍后重试'
    console.error('加载用户列表失败:', e)
    users.value = []
  } finally {
    loading.value = false
  }
}

const loadUserDetail = async () => {
  const id = route.params.id
  if (!id) {
    error.value = '无效的用户ID'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const res = await adminAPI.getUserDetail(id)
    if (res) {
      currentUser.value = res
    } else {
      error.value = res?.message || '获取用户信息失败'
      currentUser.value = {}
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
    currentUser.value = {}
  } finally {
    loading.value = false
  }
}

const refreshUserDetail = () => {
  loadUserDetail()
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadUserDetail()
  } else {
    loadUsers()
  }
}, { immediate: true })

onMounted(() => {
  if (isDetailMode.value) {
    loadUserDetail()
  } else {
    loadUsers()
  }
})
</script>

<style scoped>
.user-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 用户详情模式样式 */
.user-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  padding: 12px 36px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #545b62;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.user-id {
  background: #e9ecef;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #6c757d;
  font-weight: bold;
}

.card-body {
  padding: 30px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
}

.phone {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: bold;
  color: #555;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #333;
  font-size: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.action-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 30px;
}

.action-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

/* 列表模式样式 */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.refresh-btn {
  padding: 12px 36px;
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
  background: #6c757d;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 15px;
  padding: 8px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #c82333;
}

.list-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  align-items: center;
}

.search-box input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
}

.search-box input:focus {
  outline: none;
  border-color: #007bff;
}

.filter-controls select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.user-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.user-avatar img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.user-phone {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.user-details {
  margin: 0;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
}

.user-details span {
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.user-actions {
  flex-shrink: 0;
}

.view-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background: #0056b3;
}

.pagination {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  border-top: 1px solid #eee;
}

.total-count {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management-container {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .user-grid {
    grid-template-columns: 1fr;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
