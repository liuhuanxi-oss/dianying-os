<template>
  <div class="page">
    <div class="stat-grid">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-icon" :style="{background:s.bg,color:s.color}"><el-icon :size="24"><component :is="s.icon"/></el-icon></div>
        <div class="stat-info"><div class="stat-value">{{ s.value }}</div><div class="stat-label">{{ s.label }}</div></div>
        <div class="stat-trend" :class="s.trendUp ? 'up' : 'down'">{{ s.trend }}</div>
      </div>
    </div>
    <div class="charts-row">
      <div class="chart-card"><div class="chart-title">近30天评价趋势</div><div ref="reviewChart" class="chart-box"></div></div>
      <div class="chart-card"><div class="chart-title">信任等级分布</div><div ref="trustChart" class="chart-box"></div></div>
    </div>
    <div class="bottom-row">
      <div class="quick-actions card"><div class="chart-title">快捷操作</div><div class="action-grid"><div class="action-item" v-for="a in quickActions" :key="a.label" @click="$router.push(a.path)"><el-icon :size="20"><component :is="a.icon"/></el-icon><span>{{ a.label }}</span></div></div></div>
      <div class="recent-list card"><div class="chart-title">最新入驻商户</div><div class="recent-item" v-for="m in recentMerchants" :key="m.id"><el-avatar :size="32" icon="Shop"/><div class="recent-info"><div class="recent-name">{{ m.name }}</div><div class="recent-time">{{ m.created_at || m.create_time || '' }}</div></div><el-tag size="small" :type="(m.status==='APPROVED'||m.status==='active')?'success':'warning'">{{ (m.status==='APPROVED'||m.status==='active')?'已激活':'待审核' }}</el-tag></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'

const reviewChart = ref(null), trustChart = ref(null)
const totalMerchants = ref(0), todayOrders = ref(0), todayGMV = ref(0), aiCalls = ref(0), onlineMerchants = ref(0)
const recentMerchants = ref([])

const statCards = computed(() => [
  { label: '入驻商户', value: totalMerchants.value.toLocaleString(), trend: '+持续增长', trendUp: true, bg: '#e8f5e9', color: '#10B981', icon: 'Shop' },
  { label: '今日GMV', value: '¥' + (todayGMV.value || 0).toLocaleString(), trend: '+实时更新', trendUp: true, bg: '#e3f2fd', color: '#2196F3', icon: 'Star' },
  { label: '今日订单', value: (todayOrders.value || 0).toLocaleString(), trend: onlineMerchants.value + ' 在线', trendUp: true, bg: '#fff3e0', color: '#F59E0B', icon: 'Warning' },
  { label: 'AI调用', value: (aiCalls.value || 0).toLocaleString(), trend: '+累积', trendUp: true, bg: '#fce4ec', color: '#EF4444', icon: 'TrendCharts' }
])

const quickActions = [
  { label: '商户管理', icon: 'Shop', path: '/admin/merchants' },
  { label: '评价管理', icon: 'Star', path: '/admin/reviews' },
  { label: '投诉处理', icon: 'Warning', path: '/admin/complaints' },
  { label: 'AI客服', icon: 'ChatDotRound', path: '/admin/chat' }
]

onMounted(async () => {
  try {
    const [analyticsData, mchData] = await Promise.all([
      http.get('/admin/analytics/overview'),
      http.get('/admin/merchants', { params: { page: 1, page_size: 4 } })
    ])
    if (analyticsData) {
      totalMerchants.value = analyticsData.total_merchants || 0
      todayOrders.value = analyticsData.today_orders || 0
      todayGMV.value = analyticsData.today_gmv || analyticsData.gmv || 0
      aiCalls.value = analyticsData.ai_calls || 0
      onlineMerchants.value = analyticsData.online_merchants || analyticsData.active_merchants || 0
    }
    if (mchData?.items) recentMerchants.value = mchData.items
  } catch (e) {
    console.error('加载仪表盘数据失败:', e)
    try {
      const [mchData, statsRes] = await Promise.all([
        http.get('/admin/merchants', { params: { page: 1, page_size: 4 } }),
        http.get('/admin/agents/stats')
      ])
      if (mchData?.items) recentMerchants.value = mchData.items
      if (mchData?.total) totalMerchants.value = mchData.total
      if (statsRes) {
        todayGMV.value = statsRes.monthly_gmv || 0
        onlineMerchants.value = statsRes.total_merchants || 0
      }
    } catch (e2) { console.error('备用数据加载也失败:', e2) }
  }

  nextTick(async () => {
    await initReviewChart()
    initTrustChart()
  })
})

async function initReviewChart() {
  if (!reviewChart.value) return
  const c = echarts.init(reviewChart.value)
  let goodData = [], badData = []
  try {
    const data = await http.get('/admin/reviews', { params: { page: 1, page_size: 1000 } })
    if (data?.items) {
      const byDay = {}
      data.items.forEach(r => {
        const day = (r.created_at || '').slice(8, 10) || '00'
        if (!byDay[day]) byDay[day] = { good: 0, bad: 0 }
        if (r.rating >= 4) byDay[day].good++
        else if (r.rating <= 2) byDay[day].bad++
      })
      const sorted = Object.entries(byDay).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      goodData = sorted.map(([, v]) => v.good)
      badData = sorted.map(([, v]) => v.bad)
    }
  } catch (e) { /* no data */ }
  if (!goodData.length) { c.setOption({ title: { text: '暂无评价数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  const xLabels = Array.from({ length: goodData.length }, (_, i) => `${i + 1}`)
  c.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 40, right: 20, top: 20, bottom: 30 }, xAxis: { type: 'category', data: xLabels, axisLabel: { fontSize: 10, rotate: 45 } }, yAxis: { type: 'value' }, series: [{ name: '好评', type: 'line', smooth: true, data: goodData, itemStyle: { color: '#10B981' } }, { name: '差评', type: 'line', smooth: true, data: badData, itemStyle: { color: '#EF4444' } }] })
}

async function initTrustChart() {
  if (!trustChart.value) return
  const c = echarts.init(trustChart.value)
  let trustData = []
  try {
    const data = await http.get('/admin/smart-pricing/trust-levels')
    if (data?.items?.length) {
      trustData = data.items.map(l => ({ value: l.count || 0, name: l.name, itemStyle: { color: l.name === 'A级' ? '#10B981' : l.name === 'B级' ? '#3B82F6' : l.name === 'C级' ? '#F59E0B' : l.name === 'D级' ? '#F97316' : '#EF4444' } }))
    }
  } catch (e) { /* no data */ }
  if (!trustData.length) { c.setOption({ title: { text: '暂无信任等级数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }); return }
  c.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { fontSize: 11 } }, series: [{ type: 'pie', radius: ['50%', '75%'], center: ['50%', '45%'], label: { show: false }, data: trustData }] })
}
</script>

<style scoped>
.page{max-width:1400px}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:20px}.stat-card{background:#fff;border-radius:12px;padding:20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:transform 0.2s}.stat-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.08)}.stat-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.stat-info{flex:1}.stat-value{font-size:28px;font-weight:700;color:#1a1a1a;line-height:1.2}.stat-label{font-size:12px;color:#999;margin-top:2px}.stat-trend{font-size:12px;font-weight:600;flex-shrink:0}.stat-trend.up{color:#10B981}.stat-trend.down{color:#EF4444}.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.chart-card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.chart-title{font-size:14px;font-weight:600;color:#333;margin-bottom:12px;display:flex;align-items:center;gap:8px}.chart-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}.chart-box{width:100%;height:280px}.bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.action-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.action-item{display:flex;align-items:center;gap:8px;padding:12px;border-radius:8px;background:#f8f9fa;cursor:pointer;font-size:13px;color:#333;transition:all 0.2s}.action-item:hover{background:rgba(30,58,95,0.08);color:var(--primary)}.recent-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0}.recent-item:last-child{border-bottom:none}.recent-info{flex:1}.recent-name{font-size:13px;font-weight:500}.recent-time{font-size:11px;color:#999}
</style>
