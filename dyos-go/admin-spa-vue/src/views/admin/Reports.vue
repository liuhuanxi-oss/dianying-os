<template>
  <div class="page">
    <div class="card"><div class="card-header"><span class="card-title">数据报表</span></div>
    <el-tabs v-model="tab" @tab-change="loadTabData">
      <el-tab-pane label="日报" name="daily"><div v-if="dailyData" class="report-content">
        <div class="report-stats"><div class="r-stat"><div class="r-num">{{ dailyData.orders || 0 }}</div><div class="r-label">订单数</div></div><div class="r-stat"><div class="r-num">¥{{ (dailyData.gmv || 0).toLocaleString() }}</div><div class="r-label">GMV</div></div><div class="r-stat"><div class="r-num">{{ dailyData.new_reviews || 0 }}</div><div class="r-label">新增评价</div></div></div>
        <div ref="dailyChart" style="width:100%;height:300px"></div>
      </div><div v-else class="report-placeholder"><el-empty description="日报功能 — AI自动汇总每日评价、营收、客流数据"/></div></el-tab-pane>
      <el-tab-pane label="周报" name="weekly"><div class="report-placeholder"><el-empty description="周报功能 — 每周一自动生成上周分析报告"/></div></el-tab-pane>
      <el-tab-pane label="月报" name="monthly"><div v-if="monthlyData" class="report-content">
        <div class="report-stats"><div class="r-stat"><div class="r-num">{{ monthlyData.merchants || 0 }}</div><div class="r-label">活跃商户</div></div><div class="r-stat"><div class="r-num">¥{{ ((monthlyData.gmv || 0)/10000).toFixed(0) }}万</div><div class="r-label">月GMV</div></div><div class="r-stat"><div class="r-num">{{ monthlyData.ai_calls || 0 }}</div><div class="r-label">AI调用</div></div></div>
        <div ref="monthlyChart" style="width:100%;height:300px"></div>
      </div><div v-else class="report-placeholder"><el-empty description="月度深度分析，包含趋势对比和同行基准"/></div></el-tab-pane>
      <el-tab-pane label="小程序报告" name="miniapp"><div class="report-placeholder"><el-empty description="为商户小程序生成精美H5分析报告，支持一键分享"/></div></el-tab-pane>
    </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
const tab = ref('daily'), dailyChart = ref(null), monthlyChart = ref(null)
const dailyData = ref(null), monthlyData = ref(null)

async function loadTabData(name) {
  if (name === 'daily' && !dailyData.value) {
    try {
      const data = await http.get('/admin/reports')
      if (data) dailyData.value = data
    } catch (e) { console.error('加载日报失败:', e) }
    nextTick(initDailyChart)
  }
  if (name === 'monthly' && !monthlyData.value) {
    try {
      const data = await http.get('/admin/analytics/overview')
      if (data) monthlyData.value = data
    } catch (e) { console.error('加载月报失败:', e) }
    nextTick(initMonthlyChart)
  }
}

function initDailyChart() {
  if (!dailyChart.value) return
  const c = echarts.init(dailyChart.value)
  c.setOption({ title: { text: '暂无今日数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } })
}

async function initMonthlyChart() {
  if (!monthlyChart.value) return
  const c = echarts.init(monthlyChart.value)
  if (monthlyData.value) {
    const d = monthlyData.value
    c.setOption({ tooltip:{trigger:'axis'}, grid:{left:40,right:20,top:10,bottom:30}, xAxis:{type:'category',data:['商户数','今日订单','今日GMV(万)']}, yAxis:{type:'value'}, series:[{type:'bar',data:[d.total_merchants||0, d.today_orders||0, (d.today_gmv||0)/10000],itemStyle:{color:'#1E3A5F',borderRadius:[4,4,0,0]}}] })
  } else {
    c.setOption({ title: { text: '暂无月报数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } })
  }
}
</script>

<style scoped>
.page{max-width:1400px}
.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}
.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
.report-placeholder{padding:60px 0}
.report-content{padding:10px 0}
.report-stats{display:flex;gap:40px;margin-bottom:20px}
.r-stat{text-align:center}
.r-num{font-size:28px;font-weight:700;color:#1E3A5F}
.r-label{font-size:12px;color:#999;margin-top:4px}
</style>
