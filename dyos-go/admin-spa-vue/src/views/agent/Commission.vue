<template>
  <div class="page"><div class="stat-grid">
    <div class="stat-card accent-gold"><div class="stat-num">¥{{ (stats.pending || 0).toLocaleString() }}</div><div class="stat-text">待结算佣金</div></div>
    <div class="stat-card accent-green"><div class="stat-num">¥{{ (stats.settled || 0).toLocaleString() }}</div><div class="stat-text">已结算佣金</div></div>
    <div class="stat-card accent-blue"><div class="stat-num">¥{{ ((stats.pending||0)+(stats.settled||0)).toLocaleString() }}</div><div class="stat-text">累计佣金</div></div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">佣金明细</span><el-button type="primary" @click="settleAll" :loading="settling">一键结算</el-button></div>
    <el-table :data="records" stripe v-loading="loading"><el-table-column prop="merchant_name" label="商户"/><el-table-column label="佣金金额" width="120"><template #default="{row}">¥{{ (row.amount || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="rate" label="费率" width="80"/><el-table-column prop="period" label="结算周期" width="120"/><el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="row.status==='已结算'?'success':'warning'" size="small">{{ row.status || '未结算' }}</el-tag></template></el-table-column><el-table-column label="操作" width="100"><template #default="{row}"><el-button v-if="row.status!=='已结算'" link type="primary" size="small" @click="settleOne(row)">结算</el-button></template></el-table-column></el-table>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const stats = ref({ pending: 0, settled: 0 }), records = ref([]), loading = ref(false), settling = ref(false)
onMounted(() => loadAll())
async function loadAll() {
  loading.value = true
  try {
    const data = await http.get('/admin/finance/commission')
    if (data) { records.value = data.items || []; stats.value.pending = data.pending || 0; stats.value.settled = data.settled || 0 }
  } catch (e) { console.error('加载佣金失败:', e) }
  finally { loading.value = false }
}
async function settleOne(row) {
  try { await http.post(`/admin/finance/commission/${row.id}/pay`); ElMessage.success('结算成功'); records.value = records.value.map(r => r.id===row.id ? {...r,status:'已结算'} : r) }
  catch (e) { ElMessage.error('结算失败') }
}
async function settleAll() {
  settling.value = true
  try {
    const pending = records.value.filter(r => r.status !== '已结算')
    if (pending.length === 0) { ElMessage.info('没有待结算的佣金'); return }
    let done = 0
    for (const r of pending) {
      try { await http.post(`/admin/finance/commission/${r.id}/pay`); done++ } catch (e) { /* skip */ }
    }
    ElMessage.success(`已结算 ${done}/${pending.length} 笔佣金`)
    loadAll()
  } catch (e) { ElMessage.error('操作失败') }
  finally { settling.value = false }
}
</script>

<style scoped>
.page{max-width:1400px}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}.stat-card{background:#fff;border-radius:12px;padding:24px;position:relative;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.stat-card::after{content:"";position:absolute;top:0;left:0;width:4px;height:100%}.stat-card.accent-gold::after{background:#F59E0B}.stat-card.accent-green::after{background:#10B981}.stat-card.accent-blue::after{background:#2196F3}.stat-num{font-size:32px;font-weight:700;color:#1a1a1a}.stat-text{font-size:14px;color:#666;margin-top:4px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}
</style>
