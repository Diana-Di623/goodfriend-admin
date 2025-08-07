import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/admin/login.vue'
import Dashboard from '@/admin/dashboard.vue'
import AdminIndex from '@/admin/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    component: AdminIndex,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 临时简化用于调试
router.beforeEach((to, from, next) => {
  // 暂时跳过认证检查，直接允许访问
  console.log('路由跳转:', to.path)
  next()
})

export default router
