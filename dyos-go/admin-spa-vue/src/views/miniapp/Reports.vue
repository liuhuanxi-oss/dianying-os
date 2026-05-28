<template>
  <div class="mp-page">
    <div class="mp-card" v-for="r in reports" :key="r.id || r.title" @click="viewReport(r)">
      <div class="mp-report-icon"><el-icon :size="24" color="#F59E0B"><DataLine/></el-icon></div>
      <div class="mp-report-info">
        <div class="mp-report-title">{{ r.title || r.name }}</div>
        <div class="mp-report-desc">{{ r.desc || r.created_at || '' }}</div>
      </div>
      <el-button size="small" type="primary" plain>查看</el-button>
    </div>
    <div v-if="reports.length===0" style="text-align:center;color:#999;padding:40px;font-size:13px">
      <el-empty description="暂无报告" :image-size="80"/>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const reports = ref([])
onMounted(async () => {
  try {
    const data = await http.get('/merchant/reports')
    if (data?.items) { reports.value = data.items }
    else if (Array.isArray(data)) { reports.value = data }
  } catch (e) { console.error('加载报告失败:', e) }
})
function viewReport(r) {
  if (r.url) { window.open(r.url, '_blank') }
  else { ElMessage.info({ message: `报告: ${r.name || r.title || '无标题'}\n类型: ${r.type || '日报'}\n状态: ${r.status || '草稿'}`, duration: 5000 }) }
}
</script>

<style scoped>
.mp-page{padding:14px}.mp-card{background:#fff;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);display:flex;align-items:center;gap:12px;cursor:pointer}.mp-card:active{background:#f8f9fa}.mp-report-icon{width:44px;height:44px;background:rgba(245,158,11,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.mp-report-info{flex:1}.mp-report-title{font-size:14px;font-weight:500;color:#333}.mp-report-desc{font-size:11px;color:#999;margin-top:2px}
</style>
