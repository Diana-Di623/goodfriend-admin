import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/admin/login.vue'
import Dashboard from '@/admin/dashboard.vue'
import AdminIndex from '@/admin/index.vue'
import CounselorManagement from '@/admin/counselor-management.vue'
import CounselorApplications from '@/admin/counselor-applications.vue'
import CreateCounselor from '@/admin/create-counselor.vue'
import CounselorDetail from '@/admin/counselor-detail.vue'
import ImageUpload from '@/admin/imageupload.vue'

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
      },
      {
        path: 'counselors',
        name: 'CounselorManagement',
        component: CounselorManagement
      },
      {
        path: 'counselors/applications',
        name: 'CounselorApplications',
        component: CounselorApplications
      },
      {
        path: 'counselors/create',
        name: 'CreateCounselor',
        component: CreateCounselor
      },
      {
        path: 'counselors/:id',
        name: 'CounselorDetail',
        component: CounselorDetail
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/admin/user-management.vue')
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/admin/user-management.vue')
      },
      {
        path: 'appointments',
        name: 'AppointmentManagement',
        component: () => import('@/admin/appointment.vue')
      },
      {
        path: 'avatar-upload',
        name: 'AvatarUpload',
        component: ImageUpload
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
