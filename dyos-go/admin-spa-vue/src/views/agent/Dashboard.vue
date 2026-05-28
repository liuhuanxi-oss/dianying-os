<template>
  <div class="page">
    <div class="stat-grid">
      <div class="stat-card accent-blue"><div class="stat-num">{{ (stats.myMerchants || 0).toLocaleString() }}</div><div class="stat-text">旗下商户</div><div class="stat-sub">本月新增 +{{ stats.newThisMonth || 0 }}</div></div>
      <div class="stat-card accent-green"><div class="stat-num">¥{{ (stats.monthRevenue || 0).toLocaleString() }}</div><div class="stat-text">本月营收</div><div class="stat-sub">同比 +{{ stats.revenueGrowth || '--' }}%</div></div>
      <div class="stat-card accent-gold"><div class="stat-num">¥{{ (stats.pendingCommission || 0).toLocaleString() }}</div><div class="stat-text">待结算佣金</div><div class="stat-sub">{{ stats.settleDate || '--' }}</div></div>
      <div class="stat-card accent-red"><div class="stat-num">{{ (stats.activeMerchants || 0).toLocaleString() }}</div><div class="stat-text">活跃商户</div><div class="stat-sub">活跃率 {{ stats.activeRate || 0 }}%</div></div>
    </div>
    <div class="charts-row">
      <div class="chart-card"><div class="chart-title">商户营收排行</div><div ref="revenueChart" class="chart-box"></div></div>
      <div class="chart-card"><div class="chart-title">月度佣金趋势</div><div ref="commissionChart" class="chart-box"></div></div>
    </div>
    <div class="card"><div class="card-header"><span class="chart-title">旗下商户</span><el-button size="small" type="primary" @click="$router.push('/agent/merchants')">全部商户</el-button></div>
      <el-table :data="merchants" stripe v-loading="loading"><el-table-column prop="name" label="商户名称"/><el-table-column prop="contact" label="联系人" width="100"/><el-table-column label="信任等级" width="90"><template #default="{row}"><el-tag :type="trustType(row.trust_level)" size="small">{{ row.trust_level || 'C级' }}</el-tag></template></el-table-column><el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag :type="row.status==='APPROVED'?'success':'warning'" size="small">{{ row.status==='APPROVED'?'已激活':'待审核' }}</el-tag></template></el-table-column></el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()
const agentId = auth.user?.agent_id || auth.user?.id
const revenueChart = ref(null), commissionChart = ref(null), loading = ref(false)
const stats = ref({ myMerchants: 0, newThisMonth: 0, monthRevenue: 0, pendingCommission: 0, activeMerchants: 0, activeRate: 0, revenueGrowth: '--', settleDate: '--' })
const merchants = ref([])

onMounted(async () => {
  try {
    const data = await http.get('/admin/agents/dashboard')
    if (data) { stats.value = { ...stats.value, ...data } }
  } catch (e) { console.error('加载代理商仪表盘失败:', e) }
  loading.value = true
  try {
    const data = await http.get(`/admin/agents/${agentId}/merchants`, { params: { page: 1, page_size: 5 } })
    if (data?.items) merchants.value = data.items
  } catch (e) { console.error('加载商户失败:', e) }
  finally { loading.value = false }
  nextTick(() => { initRevenueChart(); initCommissionChart() })
})

async function initRevenueChart() {
  if (!revenueChart.value) return
  const c = echarts.init(revenueChart.value)
  let names = [], values = []
  try {
    const data = await http.get(`/admin/agents/${agentId}/merchants`, { params: { page: 1, page_size: 5, sort: 'gmv', order: 'desc' } })
    if (data?.items?.length) {
      names = data.items.map(m => m.name)
      values = data.items.map(m => m.total_gmv || m.gmv || 0)
    }
  } catch (e) { /* no data */ }
  if (!names.length) { c.setOption({ title: { text: '暂无商户数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  c.setOption({ tooltip:{trigger:'axis',formatter:p=>'¥'+(p[0].value/10000).toFixed(0)+'万'}, grid:{left:80,right:20,top:10,bottom:20}, xAxis:{type:'value',axisLabel:{formatter:v=>'¥'+(v/10000).toFixed(0)+'万'}}, yAxis:{type:'category',data:names,inverse:true}, series:[{type:'bar',barWidth:18,data:values,itemStyle:{color:'#2196F3',borderRadius:[0,4,4,0]}}] })
}

async function initCommissionChart() {
  if (!commissionChart.value) return
  const c = echarts.init(commissionChart.value)
  let months = [], amounts = []
  try {
    const data = await http.get(`/admin/agents/${agentId}/commission`)
    if (data?.history?.length) {
      months = data.history.map(h => h.month || h.period)
      amounts = data.history.map(h => h.amount || 0)
    }
  } catch (e) { /* no data */ }
  if (!months.length) { c.setOption({ title: { text: '暂无佣金数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  c.setOption({ tooltip:{trigger:'axis',formatter:p=>'¥'+(p[0].value/10000).toFixed(0)+'万'}, grid:{left:60,right:20,top:20,bottom:30}, xAxis:{type:'category',data:months}, yAxis:{type:'value',axisLabel:{formatter:v=>'¥'+(v/10000).toFixed(0)+'万'}}, series:[{type:'bar',data:amounts,itemStyle:{color:'#F59E0B',borderRadius:[4,4,0,0]}}] })
}

function trustType(l) { const m={ 'A级':'success','B级':'','C级':'warning','D级':'danger','E级':'danger' }; return m[l]||'' }
</script>

<style scoped>
.page{max-width:1400px}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px}.stat-card{background:#fff;border-radius:12px;padding:24px;position:relative;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.stat-card::after{content:"";position:absolute;top:0;left:0;width:4px;height:100%}.stat-card.accent-blue::after{background:#2196F3}.stat-card.accent-green::after{background:#10B981}.stat-card.accent-gold::after{background:#F59E0B}.stat-card.accent-red::after{background:#EF4444}.stat-num{font-size:32px;font-weight:700;color:#1a1a1a}.stat-text{font-size:14px;color:#666;margin-top:4px}.stat-sub{font-size:11px;color:#999;margin-top:6px}.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.chart-card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.chart-title{font-size:14px;font-weight:600;color:#333;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}.chart-box{width:100%;height:300px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
</style>
