<template>
  <div class="login-wrap">
    <div class="login-bg">
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
      <div class="bg-circle c3"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="36"><Monitor /></el-icon>
        </div>
        <h1>店赢OS</h1>
        <p>AI驱动门店运营 · 智能管理后台</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
          class="login-btn"
        >
          登 录
        </el-button>
      </el-form>
      <div class="quick-login">
        <span class="ql-label">快速登录：</span>
        <el-button link type="warning" @click="quickLogin('admin')">管理员</el-button>
        <el-button link type="primary" @click="quickLogin('agent001')">代理商</el-button>
        <el-button link type="success" @click="quickLogin('m10001')">商户</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const formRef = ref(null)

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const roleHome = { admin: '/admin/dashboard', agent: '/agent/dashboard', merchant: '/merchant/dashboard' }

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const { data } = await axios.post('/api/login', {
      username: form.username,
      password: form.password
    })
    if (data.code === 0 && data.data?.token) {
      auth.token = data.data.token
      auth.user = data.data.user || {}
      localStorage.setItem('dyos_token', auth.token)
      localStorage.setItem('dyos_user', JSON.stringify(auth.user))
      ElMessage.success('登录成功')
      router.push(roleHome[auth.role] || '/admin/dashboard')
    } else {
      ElMessage.error(data.message || '登录失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || '登录失败')
  } finally {
    loading.value = false
  }
}

function quickLogin(username) {
  form.username = username
  form.password = '123456'
  handleLogin()
}
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0a1628 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.c1 {
  width: 600px;
  height: 600px;
  background: var(--gold);
  top: -200px;
  right: -150px;
  animation: float 8s ease-in-out infinite;
}

.c2 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  bottom: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite reverse;
}

.c3 {
  width: 200px;
  height: 200px;
  background: var(--gold);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  margin: 0 auto 16px;
}

.login-header h1 {
  font-size: 28px;
  color: var(--primary);
  font-weight: 700;
}

.login-header p {
  font-size: 13px;
  color: #999;
  margin-top: 6px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
  --el-button-bg-color: var(--primary);
  --el-button-border-color: var(--primary);
}

.login-btn:hover {
  --el-button-bg-color: var(--primary-light);
  --el-button-border-color: var(--primary-light);
}

.quick-login {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.ql-label {
  color: #bbb;
}
</style>
