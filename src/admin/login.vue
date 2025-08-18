<template>
  <div class="admin-login-page">
    <!-- 动态背景粒子 -->
    <div class="particles-container">
      <div class="particle" v-for="i in 15" :key="i" :style="{ 
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 2 + 's',
        animationDuration: (Math.random() * 3 + 2) + 's'
      }"></div>
    </div>
    
    <div class="login-container">
      <div class="login-header">
        <div class="logo-wrapper">
          <div class="logo-bg"></div>
          <img class="logo" src="/logo.png" alt="好朋友心理Logo" />
        </div>
        <h1 class="app-title">好朋友心理</h1>
        <p class="admin-subtitle">管理员控制台</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <div class="input-wrapper">
            <div class="input-icon">👤</div>
            <input 
              v-model="loginForm.username"
              class="form-input"
              placeholder="请输入管理员账号"
              maxlength="50"
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="input-wrapper">
            <div class="input-icon">🔒</div>
            <input 
              v-model="loginForm.password"
              class="form-input"
              placeholder="请输入密码"
              type="password"
              maxlength="50"
            />
          </div>
        </div>
        

        
        <button 
          class="login-btn"
          :class="{ disabled: !canSubmit }"
          @click="handleLogin"
        >
          <span v-if="!isLoading">登录</span>
          <div v-else class="loading-spinner">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
        </button>
      </div>
      
      <div class="login-footer">
        <p class="footer-text">管理员后台仅供授权用户使用</p>
        <div class="help-links">
          <span class="help-link" @click="showHelp">使用帮助</span>
          <span class="divider">|</span>
          <span class="help-link" @click="contactSupport">联系技术支持</span>
        </div>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <!-- 气泡效果 -->
      <div class="bubbles">
        <div class="bubble" v-for="i in 20" :key="'bubble-' + i" :style="{
          left: Math.random() * 100 + '%',
          animationDelay: Math.random() * 10 + 's',
          animationDuration: (Math.random() * 15 + 10) + 's'
        }"></div>
      </div>
      
      <!-- 装饰圆圈 -->
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
      <div class="decoration-circle circle-4"></div>
      <div class="decoration-circle circle-5"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI } from '../utils/adminAPI.js'

const router = useRouter()

// 登录表单数据
const loginForm = ref({
  username: 'admin',
  password: 'super'
})

const isLoading = ref(false)

// 检查是否可以提交
const canSubmit = computed(() => {
  return loginForm.value.username.trim() && 
         loginForm.value.password.trim() && 
         !isLoading.value
})

// 处理登录
async function handleLogin() {
  if (!canSubmit.value) {
    return
  }
  
  isLoading.value = true
  
  try {
    const loginData = {
      username: loginForm.value.username.trim(),
      password: loginForm.value.password.trim()
    }
    
    console.log('=== 管理员登录开始 ===')
    console.log('📤 登录请求数据:', {
      username: loginData.username,
      password: '***' + loginData.password.slice(-2), // 密码部分隐藏
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
    
    console.log('🌐 调用真实API登录接口...')
    console.log('📡 请求URL: /api/admin/login')
    console.log('📋 请求方法: POST')
    console.log('📦 请求体:', JSON.stringify(loginData, null, 2))
    
    // 调用真实API
    const response = await adminAPI.adminLogin(loginData)
    
    console.log('📥 API响应原始数据:', response)
    console.log('📊 响应状态检查:', {
      responseType: typeof response,
      responseKeys: Object.keys(response || {}),
      responseConstructor: response ? response.constructor.name : 'N/A',
      isObject: typeof response === 'object',
      isArray: Array.isArray(response),
      isNull: response === null,
      isUndefined: response === undefined,
      responseString: JSON.stringify(response),
      responseLength: response ? Object.keys(response).length : 0
    })
    
    console.log('管理员登录响应:', response)
    
    // 详细检查响应中的token
    console.log('🔍 Token检查:', {
      hasTokenProperty: 'token' in (response || {}),
      tokenValue: response?.token,
      tokenType: typeof response?.token,
      tokenLength: response?.token ? response.token.length : 'N/A',
      allResponseKeys: response ? Object.keys(response) : [],
      responseValues: response ? Object.values(response) : []
    })
    
    // 检查响应是否包含token（适配真实API响应格式）
    if (response && response.token) {
      console.log('✅ 登录验证成功')
      
      // 使用后端返回的真实token
      const adminToken = response.token
      console.log('🔑 [TOKEN] 后端返回的token:', adminToken)
      console.log('🔑 [TOKEN] token类型:', typeof adminToken)
      console.log('🔑 [TOKEN] token长度:', adminToken ? adminToken.length : 'N/A')
      
      // 检查 localStorage 是否可用
      console.log('💾 [TOKEN] localStorage是否可用:', typeof(Storage) !== "undefined")
      
      // 清除旧的 token（如果存在）
      console.log('🧹 [TOKEN] 清除旧token...')
      localStorage.removeItem('adminToken')
      console.log('🔍 [TOKEN] 清除后验证:', localStorage.getItem('adminToken'))
      
      // 存储新的 token
      localStorage.setItem('adminToken', adminToken)
      console.log('💾 [TOKEN] token已保存到localStorage')
      
      // 立即验证存储结果
      const storedToken = localStorage.getItem('adminToken')
      console.log('🔍 [TOKEN] localStorage验证:', storedToken)
      console.log('🔍 [TOKEN] 存储是否成功:', storedToken === adminToken)
      
      // 测试多次读取
      setTimeout(() => {
        console.log('⏰ [TOKEN] 延迟检查localStorage:', localStorage.getItem('adminToken'))
      }, 100)
      
      // 保存管理员用户信息
      const adminInfo = {
        username: loginData.username, // 使用登录时的用户名
        loginTime: new Date().toISOString(),
        tokenType: 'admin'
      }
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
      
      console.log('💾 保存管理员信息:', {
        token: adminToken,
        adminInfo: adminInfo,
        localStorage: {
          adminToken: localStorage.getItem('adminToken'),
          adminInfo: localStorage.getItem('adminInfo')
        }
      })
      
      
      // 直接跳转到管理后台，无需提示和延迟
      console.log('🚀 执行路由跳转: /admin/dashboard')
      router.push('/admin/dashboard')
    } else {
      console.log('❌ 登录验证失败 - 响应格式不正确')
      console.log('🔍 响应分析:', {
        response: response,
        hasToken: !!response?.token,
        responseType: typeof response,
        isNull: response === null,
        isUndefined: response === undefined
      })
      throw new Error('登录失败：服务器返回无效响应')
    }
    
    isLoading.value = false
    
  } catch (error) {
    isLoading.value = false
    
    console.log('💥 登录异常捕获')
    console.error('❌ 管理员登录失败详情:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode,
      data: error.data,
      timestamp: new Date().toISOString()
    })
    
    // 详细分析错误对象的所有属性
    console.log('🔍 错误对象完整分析:', {
      errorType: typeof error,
      errorConstructor: error.constructor.name,
      errorKeys: Object.keys(error),
      errorValues: Object.getOwnPropertyNames(error),
      isErrorInstance: error instanceof Error,
      hasMessage: 'message' in error,
      hasStatusCode: 'statusCode' in error,
      hasData: 'data' in error,
      toString: error.toString(),
      valueOf: error.valueOf()
    })
    
    console.log('🔍 错误分析:', {
      isNetworkError: error.message && error.message.includes('fetch'),
      isUnauthorized: error.statusCode === 401,
      isForbidden: error.statusCode === 403,
      hasErrorData: !!error.data,
      hasErrorMessage: !!error.data?.message,
      errorMessage: error.message,
      errorName: error.name,
      errorString: String(error)
    })
    
    let errorMessage = '登录失败'
    let showTestHint = false
    
    if (error.message && error.message.includes('fetch')) {
      errorMessage = '网络连接失败'
      showTestHint = true
    } else if (error.statusCode === 401) {
      errorMessage = '用户名或密码错误'
      showTestHint = true
    } else if (error.statusCode === 403) {
      errorMessage = '账户已被禁用'
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message
    }
    
    alert(`登录失败\n\n${errorMessage}`)
  }
}

// 显示帮助
function showHelp() {
  alert('使用帮助\n\n请使用管理员账号和密码登录。\n\n如果忘记密码，请联系系统管理员。')
}

// 联系技术支持
function contactSupport() {
  alert('技术支持\n\n如需技术支持，请联系：\n电话：400-123-4567\n邮箱：support@goodfriend.com\n\n工作时间：周一至周五 9:00-18:00')
}

// 页面加载时初始化
onMounted(() => {
  // 详细检查localStorage中的token
  console.log('🔍 [TOKEN] 页面加载 - 检查localStorage状态')
  console.log('🔍 [TOKEN] localStorage是否可用:', typeof(Storage) !== "undefined")
  
  const adminToken = localStorage.getItem('adminToken')
  console.log('🔍 [TOKEN] 页面加载时获取的token:', adminToken)
  console.log('🔍 [TOKEN] token类型:', typeof adminToken)
  console.log('🔍 [TOKEN] token是否存在:', !!adminToken)
  
  // 检查localStorage中的所有键
  console.log('🔍 [TOKEN] localStorage所有键:', Object.keys(localStorage))
  console.log('🔍 [TOKEN] localStorage长度:', localStorage.length)
  
  if (adminToken) {
    console.log('✅ [TOKEN] 发现存储的token，准备跳转')
    const result = confirm('检测到已登录\n\n检测到您已登录管理后台，是否直接进入？')
    if (result) {
      router.push('/admin/dashboard')
    } else {
      console.log('🧹 [TOKEN] 用户选择清除token')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
      console.log('🔍 [TOKEN] 清除后验证:', localStorage.getItem('adminToken'))
    }
  } else {
    console.log('❌ [TOKEN] 未发现存储的token')
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && canSubmit.value) {
      handleLogin()
    }
  })
})
</script>

<style scoped>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.admin-login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #2196F3 0%, #E91E63 50%, #2196F3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}

/* 动态粒子背景 */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-float infinite linear;
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 气泡效果 */
.bubbles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  bottom: -100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: bubble-rise infinite linear;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bubble:nth-child(1) {
  width: 40px;
  height: 40px;
}

.bubble:nth-child(2) {
  width: 20px;
  height: 20px;
}

.bubble:nth-child(3) {
  width: 60px;
  height: 60px;
}

.bubble:nth-child(4) {
  width: 80px;
  height: 80px;
}

.bubble:nth-child(5) {
  width: 20px;
  height: 20px;
}

.bubble:nth-child(6) {
  width: 35px;
  height: 35px;
}

.bubble:nth-child(7) {
  width: 15px;
  height: 15px;
}

.bubble:nth-child(8) {
  width: 50px;
  height: 50px;
}

.bubble:nth-child(9) {
  width: 25px;
  height: 25px;
}

.bubble:nth-child(10) {
  width: 30px;
  height: 30px;
}

.bubble:nth-child(11) {
  width: 45px;
  height: 45px;
}

.bubble:nth-child(12) {
  width: 70px;
  height: 70px;
}

.bubble:nth-child(13) {
  width: 18px;
  height: 18px;
}

.bubble:nth-child(14) {
  width: 55px;
  height: 55px;
}

.bubble:nth-child(15) {
  width: 22px;
  height: 22px;
}

.bubble:nth-child(16) {
  width: 38px;
  height: 38px;
}

.bubble:nth-child(17) {
  width: 65px;
  height: 65px;
}

.bubble:nth-child(18) {
  width: 28px;
  height: 28px;
}

.bubble:nth-child(19) {
  width: 42px;
  height: 42px;
}

.bubble:nth-child(20) {
  width: 33px;
  height: 33px;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: -5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: -5%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 15%;
  animation-delay: 4s;
}

.circle-4 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 10%;
  animation-delay: 1s;
}

.circle-5 {
  width: 120px;
  height: 120px;
  bottom: 10%;
  right: 30%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(15px) rotate(240deg);
  }
}

.login-container {
  width: 100%;
  max-width: 550px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 50px 50px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  z-index: 10;
  position: relative;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.logo-bg {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  background: linear-gradient(135deg, #2196F3, #E91E63);
  border-radius: 50%;
  filter: blur(25px);
  opacity: 0.2;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.4;
  }
}

.logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  border: none;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(33, 150, 243, 0.2);
  background: white;
  padding: 8px;
  border-radius: 15px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #2196F3, #E91E63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  font-weight: 500;
  margin: 0;
  opacity: 0.8;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 30px;
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(248, 249, 250, 0.8);
  border: 2px solid rgba(233, 236, 239, 0.5);
  border-radius: 15px;
  padding: 0 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-height: 60px;
}

.input-wrapper:focus-within {
  border-color: #2196F3;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 0 0 4px rgba(33, 150, 243, 0.1),
    0 10px 25px rgba(33, 150, 243, 0.15);
  transform: translateY(-2px);
}

.input-icon {
  font-size: 20px;
  color: #6c757d;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #2196F3;
  transform: scale(1.1);
}

.form-input {
  flex: 1;
  height: 60px;
  font-size: 17px;
  color: #2c3e50;
  background: transparent;
  border: none;
  outline: none;
  font-weight: 500;
}

.form-input::placeholder {
  color: #95a5a6;
  font-weight: 400;
}

.login-btn {
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 19px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 10px 25px rgba(102, 126, 234, 0.3),
    0 5px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:not(.disabled):hover {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 35px rgba(102, 126, 234, 0.4),
    0 8px 15px rgba(0, 0, 0, 0.15);
}

.login-btn:not(.disabled):active {
  transform: translateY(-1px);
  box-shadow: 
    0 8px 20px rgba(102, 126, 234, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.1);
}

.login-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-spinner {
  display: flex;
  gap: 8px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dot:nth-child(3) { animation-delay: 0s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.login-footer {
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #95a5a6;
  margin: 0 0 15px 0;
  font-weight: 400;
}

.help-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.help-link {
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

.help-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: width 0.3s ease;
}

.help-link:hover::after {
  width: 100%;
}

.help-link:hover {
  color: #764ba2;
  transform: translateY(-1px);
}

.divider {
  font-size: 14px;
  color: #bdc3c7;
  font-weight: 300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    margin: 20px;
    padding: 40px 35px;
    max-width: 95%;
  }
  
  .logo {
    width: 75px;
    height: 75px;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .admin-subtitle {
    font-size: 15px;
  }
  
  .form-input {
    height: 55px;
    font-size: 16px;
  }
  
  .login-btn {
    height: 55px;
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .particles-container {
    display: none; /* 在小屏幕上隐藏粒子效果以提高性能 */
  }
  
  .bubbles {
    display: none; /* 在小屏幕上隐藏气泡效果以提高性能 */
  }
  
  .decoration-circle {
    display: none; /* 在小屏幕上隐藏装饰圆圈 */
  }
}
</style>
