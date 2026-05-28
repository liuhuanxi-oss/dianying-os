<template>
  <div class="agent-layout">
    <!-- 顶部导航栏 — 代理商专属蓝色主题 -->
    <header class="agent-topbar">
      <div class="topbar-left">
        <el-icon :size="26" color="#fff"><Connection /></el-icon>
        <span class="topbar-brand">店赢OS · 代理商门户</span>
      </div>
      <nav class="topbar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
      <div class="topbar-right">
        <el-badge :value="5" class="nav-badge">
          <el-button link>
            <el-icon :size="20" color="#fff"><Bell /></el-icon>
          </el-button>
        </el-badge>
        <el-dropdown trigger="click">
          <div class="agent-user">
            <el-avatar :size="30" icon="UserFilled" />
            <span style="color:#fff;font-size:13px">{{ auth.userName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 页面内容 -->
    <div class="agent-body">
      <div class="agent-content">
        <router-view />
      </div>
    </div>

    <!-- 底部状态栏 -->
    <footer class="agent-footer">
      <span>店赢OS 2.0 · 代理商服务系统</span>
      <span>服务时间 7×24小时</span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox } from 'element-plus'
import {
  Connection, DataAnalysis, Shop, Star, Money, CreditCard,
  User, Bell, SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { name: '工作台', path: '/agent/dashboard', icon: 'DataAnalysis' },
  { name: '商户管理', path: '/agent/merchants', icon: 'Shop' },
  { name: '评价监控', path: '/agent/reviews', icon: 'Star' },
  { name: '佣金结算', path: '/agent/commission', icon: 'Money' },
  { name: '财务管理', path: '/agent/finance', icon: 'CreditCard' },
  { name: '会员中心', path: '/agent/members', icon: 'User' }
]

const pageTitles = {
  '/agent/dashboard': '工作台', '/agent/merchants': '商户管理',
  '/agent/reviews': '评价监控', '/agent/commission': '佣金结算',
  '/agent/finance': '财务管理', '/agent/members': '会员中心'
}

const pageTitle = computed(() => pageTitles[route.path] || '')

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    auth.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.agent-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

/* ===== 顶部导航 ===== */
.agent-topbar {
  height: 56px;
  background: linear-gradient(90deg, #1565C0 0%, #1976D2 50%, #2196F3 100%);
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 100;
  flex-shrink: 0;
  gap: 8px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 24px;
}

.topbar-brand {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.topbar-nav {
  display: flex;
  gap: 2px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.nav-link.active {
  background: rgba(255,255,255,0.22);
  color: #fff;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.agent-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* ===== 主体 ===== */
.agent-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.agent-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ===== 底部 ===== */
.agent-footer {
  height: 32px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
}
</style>
