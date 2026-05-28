<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">数据报表</span><el-button size="small" type="primary" @click="loadReports">刷新</el-button></div>
    <el-tabs v-model="tab" @tab-change="onTabChange">
      <el-tab-pane label="日报" name="daily"><div v-loading="loading">
        <div v-if="dailyData" class="report-content">
          <div class="report-stats"><div class="r-stat"><div class="r-num">¥{{ (dailyData.gmv_today || dailyData.gmv || 0).toLocaleString() }}</div><div class="r-label">今日GMV</div></div><div class="r-stat"><div class="r-num">{{ dailyData.orders_today || dailyData.orders || 0 }}</div><div class="r-label">今日订单</div></div><div class="r-stat"><div class="r-num">{{ dailyData.new_reviews || 0 }}</div><div class="r-label">新增评价</div></div></div>
          <div ref="dailyChart" style="width:100%;height:300px"></div>
        </div>
        <div v-else class="report-placeholder"><el-empty description="暂无日报数据"/></div>
      </div></el-tab-pane>
      <el-tab-pane label="周报" name="weekly"><div style="text-align:center;padding:40px"><el-empty description="每周一自动生成上周分析报告"/></div></el-tab-pane>
      <el-tab-pane label="月报" name="monthly"><div style="text-align:center;padding:40px"><el-empty description="月度深度分析报告"/></div></el-tab-pane>
    </el-tabs>
  </div></div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
const tab = ref('daily'), dailyChart = ref(null), loading = ref(false), dailyData = ref(null)

async function onTabChange(name) {
  if (name === 'daily' && !dailyData.value) await loadReports()
}

async function loadReports() {
  loading.value = true
  try {
    const data = await http.get('/merchant/reports')
    if (data) dailyData.value = data.daily || data
  } catch (e) {
    try {
      const overview = await http.get('/merchant/overview')
      if (overview) dailyData.value = overview
    } catch (e2) { console.error('加载报表失败:', e2) }
  }
  finally { loading.value = false }
  nextTick(initChart)
}

function initChart() {
  if (!dailyChart.value) return
  const c = echarts.init(dailyChart.value)
  c.setOption({ title: { text: '暂无实时数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } })
}
</script>

<style scoped>
.page{max-width:1280px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#10B981;border-radius:2px;display:inline-block}.report-placeholder{padding:60px 0}.report-content{padding:10px 0}.report-stats{display:flex;gap:40px;margin-bottom:20px}.r-stat{text-align:center}.r-num{font-size:28px;font-weight:700;color:#10B981}.r-label{font-size:12px;color:#999;margin-top:4px}
</style>
