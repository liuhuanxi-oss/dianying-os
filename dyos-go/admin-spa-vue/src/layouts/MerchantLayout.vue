<template>
  <div class="merchant-layout">
    <!-- 简洁白色导航 -->
    <header class="mch-header">
      <div class="mch-header-inner">
        <div class="mch-brand" @click="$router.push('/merchant/dashboard')">
          <div class="brand-icon">
            <el-icon :size="22" color="#F59E0B"><Shop /></el-icon>
          </div>
          <div>
            <div class="brand-name">{{ auth.userName }}</div>
            <div class="brand-sub">商户管理中心</div>
          </div>
        </div>

        <nav class="mch-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="mch-nav-item"
            :class="{ active: isActive(item.path) }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>

        <div class="mch-actions">
          <el-badge :value="2" class="mch-badge">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown trigger="click">
            <el-avatar :size="34" icon="UserFilled" style="cursor:pointer" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon> 账号设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <div class="mch-body">
      <div class="mch-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox } from 'element-plus'
import {
  Shop, DataAnalysis, Star, Warning, User, Money,
  DataLine, Edit, Bell, SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { name: '经营概览', path: '/merchant/dashboard', icon: 'DataAnalysis' },
  { name: '评价管理', path: '/merchant/reviews', icon: 'Star' },
  { name: '投诉处理', path: '/merchant/complaints', icon: 'Warning' },
  { name: '会员管理', path: '/merchant/members', icon: 'User' },
  { name: '智能定价', path: '/merchant/pricing', icon: 'Money' },
  { name: '数据报表', path: '/merchant/reports', icon: 'DataLine' },
  { name: '内容创作', path: '/merchant/content', icon: 'Edit' }
]

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
.merchant-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

/* ===== 白色顶栏 ===== */
.mch-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  flex-shrink: 0;
}

.mch-header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  gap: 32px;
}

.mch-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.brand-sub {
  font-size: 10px;
  color: #999;
}

.mch-nav {
  display: flex;
  gap: 2px;
  flex: 1;
  justify-content: center;
}

.mch-nav-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.mch-nav-item:hover {
  background: #f5f7fa;
  color: var(--primary);
}

.mch-nav-item.active {
  background: rgba(30,58,95,0.08);
  color: var(--primary);
  font-weight: 600;
}

.mch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* ===== 主体 ===== */
.mch-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.mch-content {
  flex: 1;
  max-width: 1280px;
  padding: 24px;
  overflow-y: auto;
}
</style>
