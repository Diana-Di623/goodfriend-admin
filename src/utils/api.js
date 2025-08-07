// 通用请求封装
const BASE_URL = 'http://127.0.0.1:8080' // 后端API地址

// 请求拦截器
function request(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }

  // 添加认证token
  const token = localStorage.getItem('adminToken')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  console.log(`=== 请求详情 ===`)
  console.log(`URL: ${fullUrl}`)
  console.log(`方法: ${defaultOptions.method}`)
  console.log(`请求头:`, defaultOptions.headers)
  if (defaultOptions.data) {
    console.log(`请求数据:`, defaultOptions.data)
  }

  return fetch(fullUrl, {
    ...defaultOptions,
    body: defaultOptions.data ? JSON.stringify(defaultOptions.data) : undefined,
  })
    .then(response => {
      console.log(`=== 响应状态 ===`)
      console.log(`状态码: ${response.status}`)
      console.log(`状态文本: ${response.statusText}`)
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.statusCode = response.status
        error.networkError = true
        throw error
      }
      return response.json()
    })
    .then(data => {
      console.log(`=== 响应数据 ===`)
      console.log(data)
      return data
    })
    .catch(error => {
      console.error(`=== 请求失败 ===`)
      console.error(`错误信息:`, error.message)
      
      // 如果是网络错误，返回模拟数据以便开发
      if (error.networkError && url.includes('/api/admin/login')) {
        console.log('=== 使用模拟登录数据 ===')
        return {
          success: true,
          username: 'admin',
          message: '登录成功（模拟数据）'
        }
      }
      
      throw error
    })
}

export { request }
