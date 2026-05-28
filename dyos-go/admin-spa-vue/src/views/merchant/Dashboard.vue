<template>
  <div class="page">
    <div class="stat-grid">
      <div class="stat-card accent-green"><div class="stat-num">{{ overview.rating ? Number(overview.rating).toFixed(1) : '--' }}</div><div class="stat-text">综合评分</div><div class="stat-sub">评价总数 {{ overview.total_reviews || 0 }}</div></div>
      <div class="stat-card accent-blue"><div class="stat-num">¥{{ (overview.gmv_today || 0).toLocaleString() }}</div><div class="stat-text">今日GMV</div><div class="stat-sub">订单 {{ overview.orders_today || 0 }} 笔</div></div>
      <div class="stat-card accent-gold"><div class="stat-num">{{ (memberCount || 0).toLocaleString() }}</div><div class="stat-text">会员数</div><div class="stat-sub">本月新增 +{{ newMembers || 0 }}</div></div>
      <div class="stat-card accent-red"><div class="stat-num">{{ overview.pending_reviews || 0 }}</div><div class="stat-text">待处理评价</div><div class="stat-sub">含 {{ alertCount || 0 }} 条预警</div></div>
    </div>
    <div class="charts-row">
      <div class="chart-card"><div class="chart-title">评分趋势</div><div ref="scoreChart" class="chart-box"></div></div>
      <div class="chart-card"><div class="chart-title">评价来源分布</div><div ref="sourceChart" class="chart-box"></div></div>
    </div>
    <div class="card"><div class="card-header"><span class="chart-title">最新评价</span><el-button size="small" type="primary" @click="$router.push('/merchant/reviews')">全部评价</el-button></div>
      <el-table :data="recentReviews" stripe v-loading="rLoading"><el-table-column prop="user_name" label="用户" width="100"/><el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip/><el-table-column prop="rating" label="评分" width="100"><template #default="{row}"><el-rate :model-value="row.rating" disabled text-color="#F59E0B" size="small"/></template></el-table-column><el-table-column prop="created_at" label="时间" width="160"/></el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'

const scoreChart = ref(null), sourceChart = ref(null), rLoading = ref(false)
const overview = ref({}), recentReviews = ref([]), memberCount = ref(0), newMembers = ref(0), alertCount = ref(0)

onMounted(async () => {
  try {
    const data = await http.get('/merchant/overview')
    if (data) overview.value = data
  } catch (e) { console.error('加载概览失败:', e) }

  try {
    const data = await http.get('/merchant/members', { params: { page: 1, page_size: 1 } })
    if (data) { memberCount.value = data.total || 0; newMembers.value = data.new_this_month || 0 }
  } catch (e) { console.error('加载会员失败:', e) }

  try {
    const data = await http.get('/merchant/overview/alerts')
    if (data?.items) alertCount.value = data.items.length
  } catch (e) { /* silent */ }

  rLoading.value = true
  try {
    const data = await http.get('/merchant/reviews', { params: { page: 1, page_size: 4 } })
    if (data?.items) recentReviews.value = data.items
  } catch (e) { console.error('加载评价失败:', e) }
  finally { rLoading.value = false }

  nextTick(() => { initScoreChart(); initSourceChart() })
})

async function initScoreChart() {
  if (!scoreChart.value) return
  const c = echarts.init(scoreChart.value)
  let scores = [], days = []
  try {
    const data = await http.get('/merchant/reviews', { params: { page: 1, page_size: 200 } })
    if (data?.items?.length) {
      const byDay = {}
      data.items.forEach(r => {
        const day = (r.created_at || '').slice(8, 10) || '00'
        if (!byDay[day]) byDay[day] = { sum: 0, cnt: 0 }
        byDay[day].sum += (r.rating || 0)
        byDay[day].cnt++
      })
      const sorted = Object.entries(byDay).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      days = sorted.map(([d]) => d)
      scores = sorted.map(([, v]) => Number((v.sum / v.cnt).toFixed(1)))
    }
  } catch (e) { /* no data */ }
  if (!scores.length) { c.setOption({ title: { text: '暂无评价数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  c.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 40, right: 20, top: 10, bottom: 30 }, xAxis: { type: 'category', data: days }, yAxis: { min: 3.5, max: 5 }, series: [{ type: 'line', smooth: true, data: scores, itemStyle: { color: '#10B981' }, areaStyle: { color: 'rgba(16,185,129,0.1)' } }] })
}

async function initSourceChart() {
  if (!sourceChart.value) return
  const c = echarts.init(sourceChart.value)
  let sourceData = []
  try {
    const data = await http.get('/merchant/reviews', { params: { page: 1, page_size: 100 } })
    if (data?.items?.length) {
      const byPlatform = {}
      data.items.forEach(r => {
        const p = r.platform || '其他'
        byPlatform[p] = (byPlatform[p] || 0) + 1
      })
      const colors = { '大众点评': '#F59E0B', '美团': '#10B981', '小红书': '#EF4444', '饿了么': '#2196F3' }
      sourceData = Object.entries(byPlatform).map(([name, value]) => ({ value, name, itemStyle: { color: colors[name] || '#999' } }))
    }
  } catch (e) { /* no data */ }
  if (!sourceData.length) { c.setOption({ title: { text: '暂无评价数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  c.setOption({ tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: '70%', center: ['50%', '50%'], label: { formatter: '{b}\n{d}%' }, data: sourceData }] })
}
</script>

<style scoped>
.page{max-width:1280px}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px}.stat-card{background:#fff;border-radius:12px;padding:24px;position:relative;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.stat-card::after{content:"";position:absolute;top:0;left:0;width:4px;height:100%}.stat-card.accent-green::after{background:#10B981}.stat-card.accent-blue::after{background:#2196F3}.stat-card.accent-gold::after{background:#F59E0B}.stat-card.accent-red::after{background:#EF4444}.stat-num{font-size:32px;font-weight:700;color:#1a1a1a}.stat-text{font-size:14px;color:#666;margin-top:4px}.stat-sub{font-size:11px;color:#999;margin-top:6px}.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.chart-card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.chart-title{font-size:14px;font-weight:600;color:#333;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-title::before{content:"";width:3px;height:14px;background:#10B981;border-radius:2px;display:inline-block}.chart-box{width:100%;height:280px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
</style>
