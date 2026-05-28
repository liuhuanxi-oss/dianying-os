<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">评价管理</span><el-button type="primary" @click="loadData">刷新数据</el-button></div>
    <el-tabs v-model="tab" @tab-change="onTabChange">
      <el-tab-pane label="评价列表" name="list">
        <el-table :data="reviews" stripe v-loading="loading"><el-table-column prop="platform" label="平台" width="90"/><el-table-column prop="merchant_name" label="商户" width="140"/><el-table-column prop="content" label="评价内容" min-width="220" show-overflow-tooltip/><el-table-column prop="rating" label="评分" width="100"><template #default="{row}"><el-rate :model-value="row.rating" disabled text-color="#F59E0B" size="small"/></template></el-table-column><el-table-column prop="created_at" label="时间" width="160"/><el-table-column label="操作" width="200"><template #default="{row}"><el-button link type="primary" size="small" @click="genReply(row)">AI回复</el-button><el-button link type="success" size="small" @click="syncReview(row)">同步</el-button></template></el-table-column></el-table>
        <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
      </el-tab-pane>
      <el-tab-pane label="菜品TOP10" name="top10">
        <div ref="topChart" style="width:100%;height:350px"></div>
      </el-tab-pane>
      <el-tab-pane label="关键词分析" name="keywords">
        <div ref="kwChart" style="width:100%;height:350px"></div>
      </el-tab-pane>
      <el-tab-pane label="品牌区域统计" name="brand">
        <div ref="brandChart" style="width:100%;height:350px"></div>
      </el-tab-pane>
    </el-tabs>
  </div></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import http from '../../api'
import { ElMessage } from 'element-plus'

const tab = ref('list'), loading = ref(false), page = ref(1), total = ref(0)
const reviews = ref([]), topChart = ref(null), kwChart = ref(null), brandChart = ref(null)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const data = await http.get('/admin/reviews', { params: { page: page.value, page_size: 15 } })
    if (data) { reviews.value = data.items || []; total.value = data.total || 0 }
  } catch (e) { console.error('加载评价失败:', e) }
  finally { loading.value = false }
}

function onTabChange(t) {
  if (t === 'top10') nextTick(initTopChart)
  else if (t === 'keywords') nextTick(initKwChart)
  else if (t === 'brand') nextTick(initBrandChart)
}

function showEmpty(c, text) { c.setOption({ title: { text, left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } }) }

async function initTopChart() {
  if (!topChart.value) return
  const c = echarts.init(topChart.value)
  let names = [], values = []
  try {
    const data = await http.get('/admin/reviews', { params: { page: 1, page_size: 500 } })
    if (data?.items?.length) {
      const freq = {}
      data.items.forEach(r => { const dish = r.dish_name || ''; if (dish) freq[dish] = (freq[dish] || 0) + 1 })
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)
      names = sorted.map(([k]) => k); values = sorted.map(([, v]) => v)
    }
  } catch (e) { /* no data */ }
  if (!names.length) { showEmpty(c, '暂无菜品排行数据'); return }
  c.setOption({ tooltip:{trigger:'axis'}, grid:{left:120,right:20,top:10,bottom:20}, xAxis:{type:'value'}, yAxis:{type:'category',data:names,inverse:true}, series:[{type:'bar',barWidth:16,data:values,itemStyle:{color:'#F59E0B',borderRadius:[0,4,4,0]}}] })
}

async function initKwChart() {
  if (!kwChart.value) return
  const c = echarts.init(kwChart.value)
  let names = [], values = []
  try {
    const data = await http.get('/admin/reviews', { params: { page: 1, page_size: 500 } })
    if (data?.items?.length) {
      const kwFreq = {}
      const kws = ['服务好','环境好','口味佳','价格实惠','分量足','上菜快','食材新鲜','性价比高','味道好','干净卫生']
      data.items.forEach(r => {
        const content = r.content || ''
        kws.forEach(kw => { if (content.includes(kw)) kwFreq[kw] = (kwFreq[kw] || 0) + 1 })
      })
      const sorted = Object.entries(kwFreq).sort((a, b) => b[1] - a[1]).slice(0, 6)
      names = sorted.map(([k]) => k); values = sorted.map(([, v]) => v)
    }
  } catch (e) { /* no data */ }
  if (!names.length) { showEmpty(c, '暂无关键词数据'); return }
  c.setOption({ tooltip:{trigger:'axis'}, grid:{left:120,right:20,top:10,bottom:20}, xAxis:{type:'value'}, yAxis:{type:'category',data:names,inverse:true}, series:[{type:'bar',barWidth:16,data:values,itemStyle:{color:'#3B82F6',borderRadius:[0,4,4,0]}}] })
}

async function initBrandChart() {
  if (!brandChart.value) return
  const c = echarts.init(brandChart.value)
  let brandData = []
  try {
    const data = await http.get('/admin/reviews', { params: { page: 1, page_size: 500 } })
    if (data?.items?.length) {
      const byMerchant = {}
      data.items.forEach(r => { const name = r.merchant_name || r.merchant || '未知'; byMerchant[name] = (byMerchant[name] || 0) + 1 })
      brandData = Object.entries(byMerchant).map(([name, value]) => ({ name, value }))
    }
  } catch (e) { /* no data */ }
  if (!brandData.length) { showEmpty(c, '暂无品牌数据'); return }
  c.setOption({ tooltip:{trigger:'item'}, series:[{type:'treemap',data:brandData}] })
}

async function genReply(row) {
  try { await http.post(`/admin/reviews/${row.id}/generate-reply`); ElMessage.success('AI回复已生成'); loadData() }
  catch (e) { ElMessage.error('生成失败: ' + (e.message || '未知错误')) }
}
async function syncReview(row) {
  try { await http.post(`/admin/reviews/${row.id}/sync`); ElMessage.success('同步成功') }
  catch (e) { ElMessage.error('同步失败: ' + (e.message || '未知错误')) }
}
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
</style>
