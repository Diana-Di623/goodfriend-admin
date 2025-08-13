// 通用请求封装
// 使用 Vite 代理，不需要完整的后端地址
const BASE_URL = '' // 使用相对路径，通过 Vite 代理转发

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
  console.log('[TOKEN] 当前获取到的token:', token)
  console.log('[TOKEN] token类型:', typeof token)
  console.log('[TOKEN] token长度:', token ? token.length : 'N/A')
  console.log('[TOKEN] localStorage可用性:', typeof(Storage) !== "undefined")
  console.log('[TOKEN] localStorage所有键:', Object.keys(localStorage))
  
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
    console.log('[TOKEN] 已添加Authorization头')
  } else {
    console.log('[TOKEN] 未找到token，跳过Authorization头')
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
      console.log(`Content-Type:`, response.headers.get('content-type'))
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.statusCode = response.status
        error.networkError = true
        throw error
      }
      
      // 检查响应的 Content-Type 来决定如何解析
      const contentType = response.headers.get('content-type')
      
      // 如果是登录接口且返回纯文本，处理为 token
      if (url.includes('/api/admin/login') && (!contentType || !contentType.includes('application/json'))) {
        console.log('检测到登录接口返回纯文本，作为token处理')
        return response.text().then(token => {
          console.log('纯文本token:', token)
          return { token: token.trim() } // 包装成对象格式
        })
      }
      
      // 检查响应是否有内容
      return response.text().then(text => {
        console.log('响应文本:', text)
        
        // 如果响应为空，返回成功状态
        if (!text || text.trim() === '') {
          console.log('检测到空响应，返回成功状态')
          return { success: true, message: '操作成功' }
        }
        
        // 尝试解析为JSON
        try {
          const data = JSON.parse(text)
          console.log('成功解析JSON:', data)
          return data
        } catch (parseError) {
          console.log('JSON解析失败，返回文本:', text)
          // 如果不是JSON，返回文本内容
          return { 
            success: true, 
            message: text,
            data: text 
          }
        }
      })
    })
    .then(data => {
      console.log(`=== 响应数据 ===`)
      console.log(data)
      return data
    })
    .catch(error => {
      console.error(`=== 请求失败 ===`)
      console.error(`错误信息:`, error.message)
      
      // 不再使用模拟数据，直接抛出错误
      throw error
    })
}

export { request }
