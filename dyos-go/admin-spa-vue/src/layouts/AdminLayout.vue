<template>
  <div class="admin-layout">
    <!-- 深色侧边栏 -->
    <aside class="admin-sidebar">
      <div class="sb-header" @click="$router.push('/admin/dashboard')">
        <el-icon :size="28" color="#F59E0B"><Monitor /></el-icon>
        <div class="sb-title">
          <span class="sb-name">店赢OS</span>
          <span class="sb-ver">管理后台 v2.0</span>
        </div>
      </div>

      <div class="sb-menu">
        <template v-for="group in menuGroups" :key="group.label">
          <div class="sb-group-label">{{ group.label }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="sb-item"
            :class="{ active: isActive(item.path) }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
            <el-badge v-if="item.badge" :value="item.badge" class="sb-badge" />
          </router-link>
        </template>
      </div>

      <div class="sb-footer">
        <span>店赢OS 2.0 © 2026</span>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="pageTitle">{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="全屏">
            <el-button link @click="toggleFullscreen">
              <el-icon :size="18"><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-badge :value="3" class="header-badge">
            <el-button link>
              <el-icon :size="18"><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span>{{ auth.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon> 个人设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox } from 'element-plus'
import {
  Monitor, DataAnalysis, Shop, Star, Warning, User, Setting,
  ChatDotRound, DataLine, Document, Key, TrendCharts
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuGroups = [
  {
    label: '核心功能',
    items: [
      { name: '数据大屏', path: '/admin/dashboard', icon: 'DataAnalysis' },
      { name: '商户管理', path: '/admin/merchants', icon: 'Shop' },
      { name: '评价管理', path: '/admin/reviews', icon: 'Star' },
      { name: '支付投诉', path: '/admin/complaints', icon: 'Warning', badge: '3' }
    ]
  },
  {
    label: '智能分析',
    items: [
      { name: '五级信任体系', path: '/admin/trust', icon: 'Key' },
      { name: 'AI客服中心', path: '/admin/chat', icon: 'ChatDotRound' },
      { name: '数据报表', path: '/admin/reports', icon: 'DataLine' }
    ]
  },
  {
    label: '系统管理',
    items: [
      { name: '用户管理', path: '/admin/users', icon: 'User' },
      { name: '系统设置', path: '/admin/settings', icon: 'Setting' }
    ]
  }
]

const routeTitles = {
  '/admin/dashboard': '数据大屏', '/admin/merchants': '商户管理',
  '/admin/reviews': '评价管理', '/admin/complaints': '支付投诉处理',
  '/admin/trust': '五级信任体系', '/admin/chat': 'AI客服中心',
  '/admin/reports': '数据报表', '/admin/users': '用户管理',
  '/admin/settings': '系统设置'
}

const pageTitle = computed(() => routeTitles[route.path] || '')

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
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
.admin-layout {
  display: flex;
  height: 100vh;
}

/* ===== 侧边栏 ===== */
.admin-sidebar {
  width: var(--sidebar-w);
  background: linear-gradient(180deg, #0a1628 0%, #1E3A5F 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
}

.sb-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
}

.sb-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: block;
}

.sb-ver {
  font-size: 10px;
  color: #94a3b8;
}

.sb-group-label {
  padding: 16px 20px 6px;
  font-size: 10px;
  letter-spacing: 1px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.sb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  border-left: 3px solid transparent;
  text-decoration: none;
}

.sb-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.06);
}

.sb-item.active {
  color: var(--gold);
  background: rgba(245,158,11,0.12);
  border-left-color: var(--gold);
  font-weight: 600;
}

.sb-badge {
  margin-left: auto;
}

.sb-footer {
  margin-top: auto;
  padding: 14px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 11px;
  color: #64748b;
}

/* ===== 主区域 ===== */
.admin-main {
  margin-left: var(--sidebar-w);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  z-index: 10;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.admin-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
