<template>
  <div class="mp-page">
    <div class="mp-kpi-grid">
      <div class="mp-kpi"><div class="mp-kpi-val">{{ stats.rating || '--' }}</div><div class="mp-kpi-label">综合评分</div></div>
      <div class="mp-kpi"><div class="mp-kpi-val">{{ stats.todayReviews || 0 }}</div><div class="mp-kpi-label">今日评价</div></div>
      <div class="mp-kpi"><div class="mp-kpi-val">{{ (stats.totalMembers || 0).toLocaleString() }}</div><div class="mp-kpi-label">会员数</div></div>
    </div>
    <div class="mp-card"><div class="mp-card-title">今日概况</div>
      <div class="mp-stat-row"><span>新增评价</span><span class="mp-stat-val up">+{{ stats.newReviews || 0 }}</span></div>
      <div class="mp-stat-row"><span>新增会员</span><span class="mp-stat-val up">+{{ stats.newMembers || 0 }}</span></div>
      <div class="mp-stat-row"><span>待处理投诉</span><span class="mp-stat-val down">{{ stats.pendingComplaints || 0 }}</span></div>
    </div>
    <div class="mp-card"><div class="mp-card-title">评价趋势</div><div ref="chart" style="width:100%;height:180px"></div></div>
    <div class="mp-card"><div class="mp-card-title">AI预警提醒</div>
      <div v-if="alerts.length===0" style="text-align:center;color:#999;padding:12px;font-size:12px">暂无预警</div>
      <div class="mp-alert" v-for="a in alerts" :key="a.id"><el-icon :size="14" :color="a.level==='warning'?'#EF4444':'#F59E0B'"><WarningFilled/></el-icon><span>{{ a.content }}</span><span style="font-size:11px;color:#999;margin-left:auto">{{ a.created_at || '' }}</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
const chart = ref(null)
const stats = ref({ rating: 0, todayReviews: 0, totalMembers: 0, newReviews: 0, newMembers: 0, pendingComplaints: 0 })
const alerts = ref([])

onMounted(async () => {
  try {
    const data = await http.get('/merchant/overview')
    if (data) stats.value = { ...stats.value, rating: data.rating, todayReviews: data.total_reviews, pendingComplaints: data.pending_reviews }
  } catch (e) { console.error('加载概览失败:', e) }
  try {
    const data = await http.get('/merchant/overview/alerts')
    if (data?.items) alerts.value = data.items
  } catch (e) { console.error('加载预警失败:', e) }
  try {
    const data = await http.get('/merchant/overview/trend')
    nextTick(() => {
      if (chart.value) {
        const c = echarts.init(chart.value)
        const trend = data?.trend || []
        const dates = trend.length ? trend.map(t => t.date?.slice(-5) || '') : ['5/21','5/22','5/23','5/24','5/25','5/26','5/27']
        const values = trend.length ? trend.map(t => t.gmv || 0) : [0,0,0,0,0,0,0]
        c.setOption({ grid:{left:0,right:0,top:10,bottom:10}, xAxis:{type:'category',data:dates,axisLabel:{fontSize:9}}, yAxis:{show:false}, series:[{type:'line',smooth:true,data:values,itemStyle:{color:'#10B981'},symbol:'none'}] })
      }
    })
  } catch (e) { console.error('加载趋势失败:', e) }
})
</script>

<style scoped>
.mp-page{padding:14px}.mp-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.mp-kpi{background:#fff;border-radius:10px;padding:14px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.mp-kpi-val{font-size:22px;font-weight:700;color:var(--primary)}.mp-kpi-label{font-size:10px;color:#999;margin-top:2px}.mp-card{background:#fff;border-radius:10px;padding:14px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.mp-card-title{font-size:13px;font-weight:600;color:#333;margin-bottom:10px}.mp-stat-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:13px}.mp-stat-val{font-weight:600}.mp-stat-val.up{color:#10B981}.mp-stat-val.down{color:#EF4444}.mp-alert{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:12px;color:#333;border-bottom:1px solid #f5f5f5}.mp-alert:last-child{border-bottom:none}
</style>
