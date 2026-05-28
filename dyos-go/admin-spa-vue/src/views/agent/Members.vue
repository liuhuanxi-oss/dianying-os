<template>
  <div class="page"><div class="stat-grid">
    <div class="stat-card accent-blue"><div class="stat-num">{{ stats.total.toLocaleString() }}</div><div class="stat-text">全部会员</div></div>
    <div class="stat-card accent-green"><div class="stat-num">{{ stats.active.toLocaleString() }}</div><div class="stat-text">活跃会员</div></div>
    <div class="stat-card accent-gold"><div class="stat-num">{{ stats.renewRate }}%</div><div class="stat-text">平均续费率</div></div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">会员列表</span></div>
    <el-table :data="members" stripe v-loading="loading"><el-table-column prop="name" label="姓名"/><el-table-column prop="phone" label="手机号"/><el-table-column prop="merchant_name" label="所属商户"/><el-table-column prop="level" label="等级" width="80"/><el-table-column prop="points" label="积分" width="80"/><el-table-column prop="created_at" label="加入时间" width="120"/></el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
const stats = ref({ total: 0, active: 0, renewRate: 0 }), members = ref([]), loading = ref(false), page = ref(1), total = ref(0)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try {
    const data = await http.get('/admin/members', { params: { page: page.value, page_size: 15 } })
    if (data) {
      members.value = data.items || []
      total.value = data.total || 0
      if (data.stats) stats.value = { ...stats.value, ...data.stats }
    }
  } catch (e) { console.error('加载会员失败:', e) }
  finally { loading.value = false }
}
</script>

<style scoped>
.page{max-width:1400px}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}.stat-card{background:#fff;border-radius:12px;padding:24px;position:relative;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.stat-card::after{content:"";position:absolute;top:0;left:0;width:4px;height:100%}.stat-card.accent-blue::after{background:#2196F3}.stat-card.accent-green::after{background:#10B981}.stat-card.accent-gold::after{background:#F59E0B}.stat-num{font-size:32px;font-weight:700;color:#1a1a1a}.stat-text{font-size:14px;color:#666;margin-top:4px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}
</style>
