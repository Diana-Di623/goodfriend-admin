// 管理员相关API
import { request } from './api.js'

export const adminAPI = {
  // 获取咨询师申请列表
  getCounselorApplications(params = {}) {
    console.log('=== 获取咨询师申请列表 ===')
    const queryParams = new URLSearchParams()
    
    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    
    const url = `/api/admin/consultant/applications${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
  },

  // 获取申请详情
  getApplicationDetail(applicationId) {
    console.log('=== 获取申请详情 ===')
    console.log('申请ID:', applicationId)
    
    return request(`/api/admin/consultant/applications/${applicationId}`, {
      method: 'GET'
    })
  },

  // 审核咨询师申请
  reviewApplication(applicationId, decision, reason = '') {
    console.log('=== 审核咨询师申请 ===')
    console.log('申请ID:', applicationId)
    console.log('审核结果:', decision) // 'approve' 或 'reject'
    console.log('审核理由:', reason)
    
    const reviewData = {
      decision,
      reason
    }
    
    return request(`/api/admin/consultant/applications/${applicationId}/review`, {
      method: 'POST',
      data: reviewData
    })
  },

  // 批量审核申请
  batchReviewApplications(applicationIds, decision, reason = '') {
    console.log('=== 批量审核申请 ===')
    console.log('申请IDs:', applicationIds)
    console.log('审核结果:', decision)
    console.log('审核理由:', reason)
    
    const batchData = {
      applicationIds,
      decision,
      reason
    }
    
    return request('/api/admin/consultant/applications/batch-review', {
      method: 'POST',
      data: batchData
    })
  },

  // 获取咨询师列表
  getCounselors(params = {}) {
    console.log('=== 获取咨询师列表 ===')
    const queryParams = new URLSearchParams()
    
    if (params.status) {
      queryParams.append('status', params.status) // active, inactive, all
    }
    if (params.keyword) {
      queryParams.append('keyword', params.keyword)
    }
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy)
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder)
    }
    
    const url = `/api/admin/consultants${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
  },

  // 创建咨询师 - 只需要 phone 和 name 两个参数
  createCounselor(counselorData) {
    console.log('=== 创建咨询师 ===')
    console.log('原始咨询师数据:', counselorData)
    
    // 只提取 phone 和 name 两个必需参数
    const submitData = {
      phone: counselorData.phone,
      name: counselorData.name
    }
    
    console.log('提交的咨询师数据:', submitData)
    
    return request('/api/admin/consultant/create', {
      method: 'POST',
      data: submitData
    }).then(response => {
      console.log('=== 创建咨询师响应 ===')
      console.log('响应数据:', response)
      return response
    }).catch(error => {
      console.error('=== 创建咨询师失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  },


  // 获取咨询师详情
  getCounselorDetail(counselorId) {
    console.log('=== 获取咨询师详情 ===')
    console.log('咨询师ID:', counselorId)
    
    return request(`/api/admin/consultants/${counselorId}`, {
      method: 'GET'
    })
  },

  // 更新咨询师状态
  updateCounselorStatus(counselorId, status) {
    console.log('=== 更新咨询师状态 ===')
    console.log('咨询师ID:', counselorId)
    console.log('新状态:', status) // 'active' 或 'inactive'
    
    const statusData = {
      status
    }
    
    return request(`/api/admin/consultants/${counselorId}/status`, {
      method: 'PUT',
      data: statusData
    })
  },

  // 批量更新咨询师状态
  batchUpdateCounselorStatus(counselorIds, status) {
    console.log('=== 批量更新咨询师状态 ===')
    console.log('咨询师IDs:', counselorIds)
    console.log('新状态:', status)
    
    const batchData = {
      counselorIds,
      status
    }
    
    return request('/api/admin/consultants/batch-status', {
      method: 'PUT',
      data: batchData
    })
  },

  // 获取用户列表
  getUsers(params = {}) {
    console.log('=== 获取用户列表 ===')
    const queryParams = new URLSearchParams()
    
    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.keyword) {
      queryParams.append('keyword', params.keyword)
    }
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    if (params.registerStartDate) {
      queryParams.append('registerStartDate', params.registerStartDate)
    }
    if (params.registerEndDate) {
      queryParams.append('registerEndDate', params.registerEndDate)
    }
    
    const url = `/api/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
  },

  // 获取用户详情
  getUserDetail(userId) {
    console.log('=== 获取用户详情 ===')
    console.log('用户ID:', userId)
    
    return request(`/api/admin/users/${userId}`, {
      method: 'GET'
    })
  },

  // 更新用户状态
  updateUserStatus(userId, status) {
    console.log('=== 更新用户状态 ===')
    console.log('用户ID:', userId)
    console.log('新状态:', status) // 'active', 'disabled', 'banned'
    
    const statusData = {
      status
    }
    
    return request(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      data: statusData
    })
  },

  // 获取数据统计
  getStatistics(params = {}) {
    console.log('=== 获取数据统计 ===')
    const queryParams = new URLSearchParams()
    
    if (params.startDate) {
      queryParams.append('startDate', params.startDate)
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate)
    }
    if (params.type) {
      queryParams.append('type', params.type) // 'overview', 'users', 'consultants', 'applications'
    }
    
    const url = `/api/admin/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
  },

  // 管理员登录
  adminLogin(credentials) {
    console.log('=== 管理员登录 ===')
    console.log('登录凭据:', {
      username: credentials.username,
      password: '***hidden***'
    })
    
    return request('/api/admin/login', {
      method: 'POST',
      data: credentials
    }).then(response => {
      console.log('=== 管理员登录响应处理 ===')
      console.log('原始响应:', response)
      console.log('响应类型:', typeof response)
      console.log('响应是否为对象:', typeof response === 'object')
      
      // 适配后端返回格式：{ "token": "eyJhbGciOiJIUzUxMiJ9..." }
      if (response && response.token) {
        console.log('检测到有效的token响应')
        console.log('Token:', response.token)
        return response
      }
      
      console.error('无效的管理员登录响应 - 缺少token')
      throw new Error('登录响应格式错误：缺少token')
    }).catch(error => {
      console.error('=== 管理员登录请求失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  },

  // 管理员登出
  adminLogout() {
    console.log('=== 管理员登出 ===')
    
    return request('/api/admin/logout', {
      method: 'POST'
    })
  },

  // 验证管理员token
  verifyAdminToken() {
    console.log('=== 验证管理员token ===')
    
    return request('/api/admin/verify', {
      method: 'GET'
    })
  },

  // 获取系统配置
  getSystemConfig() {
    console.log('=== 获取系统配置 ===')
    
    return request('/api/admin/config', {
      method: 'GET'
    })
  },

  // 更新系统配置
  updateSystemConfig(config) {
    console.log('=== 更新系统配置 ===')
    console.log('配置数据:', config)
    
    return request('/api/admin/config', {
      method: 'PUT',
      data: config
    })
  },

  // 获取操作日志
  getOperationLogs(params = {}) {
    console.log('=== 获取操作日志 ===')
    const queryParams = new URLSearchParams()
    
    if (params.action) {
      queryParams.append('action', params.action)
    }
    if (params.operator) {
      queryParams.append('operator', params.operator)
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate)
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate)
    }
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    
    const url = `/api/admin/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
  },

  // 导出数据
  exportData(type, params = {}) {
    console.log('=== 导出数据 ===')
    console.log('导出类型:', type) // 'users', 'consultants', 'applications', 'statistics'
    console.log('导出参数:', params)
    
    const exportData = {
      type,
      ...params
    }
    
    return request('/api/admin/export', {
      method: 'POST',
      data: exportData
    })
  },

  // 获取仪表板统计数据
  getDashboardStats() {
    console.log('=== 获取仪表板统计数据 ===')
    
    return request('/api/admin/dashboard/stats', {
      method: 'GET'
    })
  },

  // 获取系统状态
  getSystemStatus() {
    console.log('=== 获取系统状态 ===')
    
    return request('/api/admin/system/status', {
      method: 'GET'
    })
  },

  // 获取最近活动
  getRecentActivities(limit = 10) {
    console.log('=== 获取最近活动 ===')
    console.log('限制数量:', limit)
    
    return request(`/api/admin/activities/recent?limit=${limit}`, {
      method: 'GET'
    })
  },

  // 上传静态文件
  uploadStaticFile(formData) {
    console.log('=== 上传静态文件 ===')
    console.log('上传数据:', formData)
    
    // 获取认证token
    const token = localStorage.getItem('adminToken')
    
    // 使用原生 fetch 处理文件上传，不设置 Content-Type (让浏览器自动设置)
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return fetch('/api/static', {
      method: 'POST',
      headers: headers,
      body: formData
    })
    .then(response => {
      console.log(`=== 文件上传响应状态 ===`)
      console.log(`状态码: ${response.status}`)
      console.log(`状态文本: ${response.statusText}`)
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.statusCode = response.status
        error.networkError = true
        throw error
      }
      
      // 根据响应内容类型决定如何解析
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      } else {
        return response.text()
      }
    })
    .then(data => {
      console.log(`=== 文件上传响应数据 ===`)
      console.log(data)
      return data
    })
    .catch(error => {
      console.error(`=== 文件上传失败 ===`)
      console.error(`错误信息:`, error.message)
      throw error
    })
  }
}
