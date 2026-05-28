<template>
  <div class="mp-page">
    <div class="mp-profile-card">
      <el-avatar :size="56" icon="UserFilled"/>
      <div class="mp-profile-name">{{ auth.userName }}</div>
      <div class="mp-profile-role">商户管理员</div>
    </div>
    <div class="mp-card">
      <div class="mp-menu-item" v-for="item in menuItems" :key="item.label" @click="item.action">
        <el-icon :size="18"><component :is="item.icon"/></el-icon>
        <span>{{ item.label }}</span>
        <el-icon><ArrowRight/></el-icon>
      </div>
    </div>
    <div class="mp-card">
      <div class="mp-menu-item" style="color:#EF4444" @click="handleLogout">
        <el-icon :size="18"><SwitchButton/></el-icon><span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessageBox } from 'element-plus'
const router = useRouter()
const auth = useAuthStore()
const menuItems = [
  { label: '账号设置', icon: 'Setting', action: () => ElMessageBox.alert('账号设置功能开发中', '提示') },
  { label: '关于店赢OS', icon: 'InfoFilled', action: () => ElMessageBox.alert('店赢OS v2.0 — AI驱动的智能门店运营平台', '关于') }
]
function handleLogout() {
  ElMessageBox.confirm('确定退出？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => { auth.logout(); router.push('/login') }).catch(() => {})
}
</script>

<style scoped>
.mp-page{padding:14px}.mp-profile-card{background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:12px;padding:24px;text-align:center;color:#fff;margin-bottom:12px}.mp-profile-name{font-size:18px;font-weight:600;margin-top:10px}.mp-profile-role{font-size:12px;opacity:0.7;margin-top:4px}.mp-card{background:#fff;border-radius:10px;overflow:hidden;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.mp-menu-item{display:flex;align-items:center;gap:12px;padding:14px;font-size:14px;border-bottom:1px solid #f5f5f5;cursor:pointer}.mp-menu-item:last-child{border-bottom:none}.mp-menu-item span{flex:1}.mp-menu-item:active{background:#f8f9fa}
</style>
