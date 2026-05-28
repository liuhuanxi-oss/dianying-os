<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">五级信任体系</span><el-button size="small" type="primary" @click="loadData">刷新</el-button></div>
    <div class="trust-grid">
      <div class="trust-card" v-for="lv in levels" :key="lv.name" :class="'t-'+lv.name[0].toLowerCase()">
        <div class="trust-badge">{{ lv.name }}</div><div class="trust-desc">{{ lv.desc }}</div><div class="trust-count">{{ (lv.count || 0).toLocaleString() }}家商户</div><div class="trust-pct">{{ lv.pct || 0 }}%</div>
      </div>
    </div>
    <div ref="trustChart" style="width:100%;height:350px;margin-top:20px"></div>
  </div></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
const trustChart = ref(null)
const levels = ref([
  { name: 'A级', desc: '优秀商户 · 评分≥4.5', count: 0, pct: 0 },
  { name: 'B级', desc: '良好商户 · 评分4.0-4.5', count: 0, pct: 0 },
  { name: 'C级', desc: '一般商户 · 评分3.5-4.0', count: 0, pct: 0 },
  { name: 'D级', desc: '预警商户 · 评分3.0-3.5', count: 0, pct: 0 },
  { name: 'E级', desc: '危险商户 · 评分<3.0', count: 0, pct: 0 }
])

onMounted(async () => {
  try {
    const data = await http.get('/admin/smart-pricing/trust-levels')
    if (data?.items) {
      const total = data.items.reduce((s,i) => s + (i.count||0), 0) || 1
      levels.value = data.items.map(l => ({ ...l, pct: Math.round((l.count||0)/total*100) }))
    }
  } catch (e) { console.error('加载信任体系失败:', e) }
  nextTick(initChart)
})

function initChart() {
  if (!trustChart.value) return
  const c = echarts.init(trustChart.value)
  c.setOption({ tooltip:{trigger:'item'}, legend:{bottom:0}, series:[{type:'pie',radius:['50%','75%'],center:['50%','45%'],label:{show:false},data:levels.value.map(l=>({value:l.count,name:l.name,itemStyle:{color:l.name==='A级'?'#10B981':l.name==='B级'?'#3B82F6':l.name==='C级'?'#F59E0B':l.name==='D级'?'#F97316':'#EF4444'}}))}] })
}
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}.trust-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.trust-card{padding:24px 16px;border-radius:12px;text-align:center;border:2px solid transparent}.trust-badge{font-size:28px;font-weight:800;margin-bottom:8px}.trust-desc{font-size:12px;color:#666;margin-bottom:8px}.trust-count{font-size:14px;font-weight:600;color:#333}.trust-pct{font-size:11px;color:#999}.t-a{background:#ecfdf5;border-color:#10B981}.t-a .trust-badge{color:#065f46}.t-b{background:#eff6ff;border-color:#3B82F6}.t-b .trust-badge{color:#1e40af}.t-c{background:#fffbeb;border-color:#F59E0B}.t-c .trust-badge{color:#92400e}.t-d{background:#fff7ed;border-color:#F97316}.t-d .trust-badge{color:#9a3412}.t-e{background:#fef2f2;border-color:#EF4444}.t-e .trust-badge{color:#991b1b}
</style>
