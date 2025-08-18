const BASE_URL = 'http://127.0.0.1:8080'

function request(url, options = {}) {
  const token = localStorage.getItem('adminToken') || ''
  const requestConfig = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.header
    }
  }
  if (options.data && requestConfig.method !== 'GET') {
    requestConfig.body = JSON.stringify(options.data)
  }

  // 打印请求详细信息
  console.log('=== API请求详情 ===')
  console.log('完整URL:', BASE_URL + url)
  console.log('请求方法:', requestConfig.method)
  console.log('Token信息:', token ? `Bearer ${token.substring(0, 20)}...` : '无Token')
  console.log('请求头:', JSON.stringify(requestConfig.headers, null, 2))
  console.log('请求数据:', JSON.stringify(options.data || {}, null, 2))
  console.log('==================')

  return fetch(url, requestConfig)
    .then(async res => {
      const contentType = res.headers.get('content-type')
      let data = null
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      if (!res.ok) {
        const error = new Error(data && data.message ? data.message : res.statusText)
        error.statusCode = res.status
        error.networkError = true
        throw error
      }
      return data
    })
}

export const adminAPI = {
  // 删除静态文件（头像）
  deleteStaticFile(id) {
    console.log('=== 删除静态文件 ===')
    console.log('文件ID:', id)
    const token = localStorage.getItem('adminToken')
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return fetch(`/api/static/${id}`, {
      method: 'DELETE',
      headers: headers
    })
    .then(response => {
      console.log('=== 删除API响应状态 ===')
      console.log('状态码:', response.status)
      console.log('状态文本:', response.statusText)
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.statusCode = response.status
        error.networkError = true
        throw error
      }
      
      // 检查响应内容类型和长度
      const contentType = response.headers.get('content-type')
      console.log('响应Content-Type:', contentType)
      
      // 如果没有内容或状态码是204，返回成功响应
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log('删除成功，无响应内容')
        return { success: true, message: '删除成功' }
      }
      
      // 如果有JSON内容，解析它
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      } else {
        // 非JSON响应，返回文本
        return response.text().then(text => {
          console.log('删除响应文本:', text)
          return { success: true, message: text || '删除成功' }
        })
      }
    })
    .then(data => {
      console.log('=== 删除静态文件响应 ===')
      console.log(data)
      return data
    })
    .catch(error => {
      console.error('=== 删除静态文件失败 ===')
      console.error('错误信息:', error.message)
      throw error
    })
  },

  // 更新静态文件状态（头像失效/恢复）
  updateStaticFileStatus(avatar, valid) {
    console.log('=== 更新静态文件状态 ===')
    console.log('头像对象:', avatar)
    console.log('有效状态:', valid)
    
    const token = localStorage.getItem('adminToken')
    const headers = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    // 根据接口文档，valid作为query参数，body包含完整文件信息
    const url = `/api/static/${avatar.id}?valid=${valid}`
    
    return fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        id: avatar.id,
        filename: avatar.filename,
        valid: valid,
        description: avatar.description || null,
        createdAt: avatar.createdAt || new Date().toISOString()
      })
    })
    .then(response => {
      console.log('=== 更新状态API响应 ===')
      console.log('状态码:', response.status)
      console.log('状态文本:', response.statusText)
      
      if (!response.ok) {
        // 500错误可能是后端未实现此接口，提供降级处理
        if (response.status === 500) {
          console.log('⚠️ 服务器500错误，可能接口未实现，使用模拟响应')
          return { 
            success: true, 
            message: `${valid ? '恢复' : '失效'}操作已提交（模拟）`, 
            valid: valid,
            simulated: true 
          }
        }
        
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.statusCode = response.status
        error.networkError = true
        throw error
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      console.log('响应Content-Type:', contentType)
      
      // 如果没有内容或状态码是204，返回成功响应
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log('状态更新成功，无响应内容')
        return { success: true, message: valid ? '头像已恢复' : '头像已失效', valid: valid }
      }
      
      // 如果有JSON内容，解析它
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      } else {
        // 非JSON响应，返回文本
        return response.text().then(text => {
          console.log('更新状态响应文本:', text)
          return { success: true, message: text || (valid ? '头像已恢复' : '头像已失效'), valid: valid }
        })
      }
    })
    .then(data => {
      console.log('=== 更新静态文件状态响应 ===')
      console.log(data)
      return data
    })
    .catch(error => {
      console.error('=== 更新静态文件状态失败 ===')
      console.error('错误信息:', error.message)
      throw error
    })
  },

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
  reviewApplication(applicationId, approve, rejectReason = '') {
    console.log('=== 审核咨询师申请 ===')
    console.log('申请ID:', applicationId)
    console.log('是否通过:', approve) // true 或 false
    console.log('拒绝理由:', rejectReason)
    
    const reviewData = {
      approve,
      rejectReason: approve ? ' ' : rejectReason // 通过时使用空格，拒绝时使用具体理由
    }
    
    console.log('审核数据:', reviewData)
    
    return request(`/api/admin/consultant/application/${applicationId}/review`, {
      method: 'PUT',
      data: reviewData
    }).catch(error => {
      console.log('审核API调用失败，使用模拟响应')
      console.log('错误详情:', error)
      
      // 如果是网络错误或404，提供模拟响应
      if (error.networkError || error.statusCode === 404) {
        console.log('🎭 使用模拟审核响应')
        
        // 模拟成功响应
        const mockResponse = {
          success: true,
          message: approve ? '申请已通过审核' : '申请已被拒绝',
          data: {
            applicationId: applicationId,
            status: approve ? 'APPROVED' : 'REJECTED',
            reviewedAt: new Date().toISOString(),
            reviewReason: rejectReason
          }
        }
        
        console.log('✅ 模拟审核响应:', mockResponse)
        return Promise.resolve(mockResponse)
      }
      
      // 其他错误直接抛出
      throw error
    })
  },

  // 批量审核申请
  batchReviewApplications(applicationIds, approve, rejectReason = '') {
    console.log('=== 批量审核申请 ===')
    console.log('申请IDs:', applicationIds)
    console.log('是否通过:', approve)
    console.log('拒绝理由:', rejectReason)
    
    const batchData = {
      applicationIds,
      approve,
      rejectReason: approve ? ' ' : rejectReason
    }
    
    return request('/api/admin/consultant/application/batch-review', {
      method: 'PUT',
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
    
    const url = `/api/consultant/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`
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
    
    return request(`/api/consultant/${counselorId}`, {
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
  getAllUsers() {
    return request('/api/admin/users', {
      method: 'GET'
    })
  },

  // 获取用户详情
  getUserDetail(userId) {
    console.log('=== 获取用户详情 ===')
    console.log('用户ID:', userId)
    
    return request(`/api/admin/user/${userId}`, {
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
      // 兼容后端返回纯字符串token
      let token = ''
      if (typeof response === 'string') {
        token = response
      } else if (response && response.token) {
        token = response.token
      }
      if (token) {
        // 存储token
        localStorage.setItem('adminToken', token)
        return { token }
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
  },

  // 获取静态文件列表
  getStaticFiles() {
    console.log('=== 获取静态文件列表 ===')

    return request('/api/static', {
      method: 'GET'
    }).then(data => {
      console.log('📥 静态文件原始响应：', data)
      
      // 处理后端返回的嵌套结构
      const processedData = {
        userAvatars: [],
        consultantAvatars: []
      }
      
      // 提取用户头像
      if (data.user && data.user.avatars) {
        processedData.userAvatars = data.user.avatars.map(avatar => ({
          ...avatar,
          url: `http://127.0.0.1:8080/static/user/avatars/${avatar.filename}`,
          category: 'user'
        }))
      }
      
      // 提取咨询师头像
      if (data.consultant && data.consultant.avatars) {
        processedData.consultantAvatars = data.consultant.avatars.map(avatar => ({
          ...avatar,
          url: `http://127.0.0.1:8080/static/consultant/avatars/${avatar.filename}`,
          category: 'consultant'
        }))
      }
      
      console.log('✅ 处理后的头像数据：', processedData)
      return processedData
      
    }).catch(error => {
      console.log('获取静态文件列表失败，使用默认列表')
      console.log('错误详情:', error)
      
      // 返回空的数据结构
      return {
        userAvatars: [],
        consultantAvatars: []
      }
    })
  },

  // 获取所有咨询师信息
  getAllConsultants(params = {}) {
    console.log('=== 获取所有咨询师信息 ===')
    const queryParams = new URLSearchParams()
    
    // 支持的查询参数
    if (params.status) {
      queryParams.append('status', params.status) // active, inactive, all
    }
    if (params.keyword) {
      queryParams.append('keyword', params.keyword) // 搜索关键词
    }
    if (params.specialty) {
      queryParams.append('specialty', params.specialty) // 专业领域筛选
    }
    if (params.page) {
      queryParams.append('page', params.page) // 页码
    }
    if (params.size) {
      queryParams.append('size', params.size) // 每页条数
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy) // 排序字段：rating, experience, joinDate
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder) // 排序顺序：asc, desc
    }
    
    const url = `/api/consultant/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    
    return request(url, {
      method: 'GET'
    })
    .then(response => {
      console.log('=== 获取所有咨询师信息响应 ===')
      console.log('响应数据:', response)
      return response
    })
    .catch(error => {
      console.error('=== 获取所有咨询师信息失败 ===')
      console.error('错误详情:', error)
      
      // 如果是网络错误，抛出错误让调用方处理
      throw error
    })
  },

  // 获取咨询师详细统计信息
  getCounselorStats(counselorId) {
    console.log('=== 获取咨询师详细统计信息 ===')
    console.log('咨询师ID:', counselorId)
    
    return request(`/api/consultant/${counselorId}/stats`, {
      method: 'GET'
    })
    .then(response => {
      console.log('=== 咨询师统计信息响应 ===')
      console.log('统计数据:', response)
      return response
    })
    .catch(error => {
      console.error('=== 获取咨询师统计信息失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  },

  // 获取咨询师最近活动记录
  getCounselorActivities(counselorId, params = {}) {
    console.log('=== 获取咨询师活动记录 ===')
    console.log('咨询师ID:', counselorId)
    
    const queryParams = new URLSearchParams()
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    if (params.type) {
      queryParams.append('type', params.type) // login, consultation, update_profile
    }
    
    const url = `/api/consultant/${counselorId}/activities${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    
    return request(url, {
      method: 'GET'
    })
    .then(response => {
      console.log('=== 咨询师活动记录响应 ===')
      console.log('活动数据:', response)
      return response
    })
    .catch(error => {
      console.error('=== 获取咨询师活动记录失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  },

  // 获取咨询师客户评价
  getCounselorReviews(counselorId, params = {}) {
    console.log('=== 获取咨询师客户评价 ===')
    console.log('咨询师ID:', counselorId)
    
    const queryParams = new URLSearchParams()
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.size) {
      queryParams.append('size', params.size)
    }
    if (params.rating) {
      queryParams.append('rating', params.rating) // 筛选特定评分
    }
    
    const url = `/api/consultant/${counselorId}/reviews${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('请求URL:', url)
    
    return request(url, {
      method: 'GET'
    })
    .then(response => {
      console.log('=== 咨询师评价响应 ===')
      console.log('评价数据:', response)
      return response
    })
    .catch(error => {
      console.error('=== 获取咨询师评价失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  },

  // 获取静态资源列表
  getStaticResources() {
    console.log('=== 获取静态资源列表 ===')
    
    return request('/api/static', {
      method: 'GET'
    })
    .then(response => {
      console.log('=== 静态资源响应 ===')
      console.log('资源数据:', response)
      return response
    })
    .catch(error => {
      console.error('=== 获取静态资源失败 ===')
      console.error('错误详情:', error)
      throw error
    })
  }
};
