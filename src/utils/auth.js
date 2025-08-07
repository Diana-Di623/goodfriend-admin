// 认证工具函数
export const authUtils = {
  // 检查是否已登录
  isLoggedIn() {
    const token = localStorage.getItem('adminToken')
    return !!token
  },

  // 获取管理员信息
  getAdminInfo() {
    const adminInfo = localStorage.getItem('adminInfo')
    return adminInfo ? JSON.parse(adminInfo) : null
  },

  // 获取token
  getToken() {
    return localStorage.getItem('adminToken')
  },

  // 清除登录信息
  logout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
  },

  // 设置登录信息
  setAuth(token, adminInfo) {
    localStorage.setItem('adminToken', token)
    if (adminInfo) {
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
    }
  }
}
