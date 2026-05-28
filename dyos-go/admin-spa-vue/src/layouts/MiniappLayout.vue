<template>
  <div class="miniapp-layout">
    <div class="mp-header">
      <span class="mp-title">店赢OS</span>
      <span class="mp-sub">商户智能助手</span>
    </div>
    <div class="mp-body"><router-view /></div>
    <nav class="mp-tabs">
      <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="mp-tab" :class="{ active: isActive(tab.path) }">
        <el-icon :size="20"><component :is="tab.icon" /></el-icon>
        <span>{{ tab.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const tabs = [
  { name: '概览', path: '/m/overview', icon: 'DataAnalysis' },
  { name: '评价', path: '/m/reviews', icon: 'Star' },
  { name: '报表', path: '/m/reports', icon: 'DataLine' },
  { name: '我的', path: '/m/profile', icon: 'User' }
]
function isActive(path) { return route.path === path }
</script>

<style scoped>
.miniapp-layout{display:flex;flex-direction:column;height:100vh;max-width:430px;margin:0 auto;background:#f5f7fa;position:relative;box-shadow:0 0 40px rgba(0,0,0,0.1)}
.mp-header{background:var(--primary);color:#fff;text-align:center;padding:12px 16px 10px;padding-top:max(12px,env(safe-area-inset-top));flex-shrink:0}
.mp-title{font-size:16px;font-weight:600;display:block}
.mp-sub{font-size:10px;color:rgba(255,255,255,0.7)}
.mp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.mp-tabs{display:flex;background:#fff;border-top:1px solid #e5e7eb;padding-bottom:max(6px,env(safe-area-inset-bottom));flex-shrink:0}
.mp-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0;font-size:10px;color:#999;text-decoration:none;-webkit-tap-highlight-color:transparent}
.mp-tab.active{color:var(--primary);font-weight:600}
</style>
