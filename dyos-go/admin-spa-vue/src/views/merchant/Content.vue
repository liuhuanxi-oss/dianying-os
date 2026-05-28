<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">内容创作中心</span><el-button size="small" type="primary" @click="loadData">刷新</el-button></div>
    <div class="gen-actions">
      <el-button type="primary" size="large" @click="genNote" :loading="genLoading">📝 生成小红书笔记</el-button>
      <el-button type="warning" size="large" @click="genScript" :loading="genLoading">🎬 生成抖音脚本</el-button>
    </div>
    <div class="content-grid" v-if="contents.length > 0">
      <div class="content-card" v-for="item in contents" :key="item.id || item.title">
        <div class="content-type"><el-tag size="small" :type="item.industry ? 'success' : 'info'">{{ item.industry || item.category || '通用' }}</el-tag></div>
        <div class="content-title">{{ item.title || item.name }}</div>
        <div class="content-preview">{{ item.content || item.description || 'AI自动生成高质量内容，配合精美图片和热门话题标签...' }}</div>
      </div>
    </div>
    <div v-else style="text-align:center;padding:40px"><el-empty description="暂无历史记录，点击上方按钮生成第一条内容"/></div>
  </div></div>
</template>

<script setup>
import { ref } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const contents = ref([]), genLoading = ref(false)

async function loadData() {
  try {
    const data = await http.get('/merchant/content-gen/history')
    if (data?.items) contents.value = data.items
    else if (Array.isArray(data)) contents.value = data
  } catch (e) { console.error('加载内容历史失败:', e) }
}

async function genNote() {
  genLoading.value = true
  try {
    const data = await http.post('/merchant/content-gen/note', { platform: 'xiaohongshu', params: {} })
    if (data?.content) { ElMessage.success('笔记已生成'); loadData() }
    else { ElMessage.success('生成请求已提交') }
  } catch (e) { ElMessage.error('生成失败') }
  finally { genLoading.value = false }
}

async function genScript() {
  genLoading.value = true
  try {
    const data = await http.post('/merchant/content-gen/script', { params: {} })
    if (data?.content) { ElMessage.success('脚本已生成'); loadData() }
    else { ElMessage.success('生成请求已提交') }
  } catch (e) { ElMessage.error('生成失败') }
  finally { genLoading.value = false }
}

loadData()
</script>

<style scoped>
.page{max-width:1280px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#10B981;border-radius:2px;display:inline-block}.gen-actions{display:flex;gap:12px;margin-bottom:20px}.content-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.content-card{padding:20px;border:1px solid #e5e7eb;border-radius:12px;transition:all 0.2s}.content-card:hover{border-color:var(--primary);box-shadow:0 2px 8px rgba(0,0,0,0.06)}.content-type{margin-bottom:8px}.content-title{font-size:15px;font-weight:600;color:#333;margin-bottom:8px}.content-preview{font-size:12px;color:#999;line-height:1.5}
</style>
