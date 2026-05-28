import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },

  // ===== 管理后台 (Admin) =====
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'merchants', name: 'AdminMerchants', component: () => import('../views/admin/Merchants.vue') },
      { path: 'reviews', name: 'AdminReviews', component: () => import('../views/admin/Reviews.vue') },
      { path: 'complaints', name: 'AdminComplaints', component: () => import('../views/admin/Complaints.vue') },
      { path: 'trust', name: 'AdminTrust', component: () => import('../views/admin/TrustSystem.vue') },
      { path: 'chat', name: 'AdminChat', component: () => import('../views/admin/AiChat.vue') },
      { path: 'reports', name: 'AdminReports', component: () => import('../views/admin/Reports.vue') },
      { path: 'settings', name: 'AdminSettings', component: () => import('../views/admin/Settings.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/Users.vue') }
    ]
  },

  // ===== 代理商门户 (Agent) =====
  {
    path: '/agent',
    component: () => import('../layouts/AgentLayout.vue'),
    meta: { role: 'agent' },
    children: [
      { path: '', redirect: '/agent/dashboard' },
      { path: 'dashboard', name: 'AgentDashboard', component: () => import('../views/agent/Dashboard.vue') },
      { path: 'merchants', name: 'AgentMerchants', component: () => import('../views/agent/Merchants.vue') },
      { path: 'reviews', name: 'AgentReviews', component: () => import('../views/agent/Reviews.vue') },
      { path: 'commission', name: 'AgentCommission', component: () => import('../views/agent/Commission.vue') },
      { path: 'finance', name: 'AgentFinance', component: () => import('../views/agent/Finance.vue') },
      { path: 'members', name: 'AgentMembers', component: () => import('../views/agent/Members.vue') }
    ]
  },

  // ===== 商户后台 (Merchant) =====
  {
    path: '/merchant',
    component: () => import('../layouts/MerchantLayout.vue'),
    meta: { role: 'merchant' },
    children: [
      { path: '', redirect: '/merchant/dashboard' },
      { path: 'dashboard', name: 'MerchantDashboard', component: () => import('../views/merchant/Dashboard.vue') },
      { path: 'reviews', name: 'MerchantReviews', component: () => import('../views/merchant/Reviews.vue') },
      { path: 'complaints', name: 'MerchantComplaints', component: () => import('../views/merchant/Complaints.vue') },
      { path: 'members', name: 'MerchantMembers', component: () => import('../views/merchant/Members.vue') },
      { path: 'pricing', name: 'MerchantPricing', component: () => import('../views/merchant/Pricing.vue') },
      { path: 'reports', name: 'MerchantReports', component: () => import('../views/merchant/Reports.vue') },
      { path: 'content', name: 'MerchantContent', component: () => import('../views/merchant/Content.vue') }
    ]
  },

  // ===== 小程序移动端 =====
  {
    path: '/m',
    component: () => import('../layouts/MiniappLayout.vue'),
    meta: { role: 'merchant' },
    children: [
      { path: '', redirect: '/m/overview' },
      { path: 'overview', name: 'MiniappOverview', component: () => import('../views/miniapp/Overview.vue') },
      { path: 'reviews', name: 'MiniappReviews', component: () => import('../views/miniapp/Reviews.vue') },
      { path: 'reports', name: 'MiniappReports', component: () => import('../views/miniapp/Reports.vue') },
      { path: 'profile', name: 'MiniappProfile', component: () => import('../views/miniapp/Profile.vue') }
    ]
  },

  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isLoggedIn && to.path === '/login') {
      return next(roleHome(auth.role))
    }
    return next()
  }

  if (!auth.isLoggedIn) {
    return next('/login')
  }

  const requiredRole = to.meta.role
  if (requiredRole && auth.role !== requiredRole) {
    return next(roleHome(auth.role))
  }

  next()
})

function roleHome(role) {
  const homes = { admin: '/admin/dashboard', agent: '/agent/dashboard', merchant: '/merchant/dashboard' }
  return homes[role] || '/login'
}

export default router
