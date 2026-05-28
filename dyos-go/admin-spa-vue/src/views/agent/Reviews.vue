<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">评价监控</span><div style="display:flex;gap:10px"><el-button type="primary" @click="batchSync" :loading="syncing">批量同步</el-button><el-button @click="loadData">刷新</el-button></div></div>
    <el-table :data="reviews" stripe v-loading="loading"><el-table-column prop="merchant_name" label="商户" width="140"/><el-table-column prop="platform" label="平台" width="90"/><el-table-column prop="content" label="评价内容" min-width="220" show-overflow-tooltip/><el-table-column prop="rating" label="评分" width="100"><template #default="{row}"><el-rate :model-value="row.rating" disabled text-color="#F59E0B" size="small"/></template></el-table-column><el-table-column prop="reply_status" label="回复状态" width="100"><template #default="{row}"><el-tag :type="row.reply_status==='已回复'?'success':'warning'" size="small">{{ row.reply_status || '未回复' }}</el-tag></template></el-table-column><el-table-column prop="created_at" label="时间" width="120"/><el-table-column label="操作" width="160"><template #default="{row}"><el-button link type="primary" size="small" @click="aiReply(row)">AI回复</el-button><el-button link type="success" size="small" @click="syncOne(row)">同步</el-button></template></el-table-column></el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const reviews = ref([]), loading = ref(false), syncing = ref(false), page = ref(1), total = ref(0)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const data = await http.get('/admin/reviews', { params: { page: page.value, page_size: 15 } }); if (data) { reviews.value = data.items || []; total.value = data.total || 0 } } catch (e) { console.error('加载评价失败:', e) }
  finally { loading.value = false }
}
async function aiReply(row) {
  try { await http.post(`/admin/reviews/${row.id}/generate-reply`); ElMessage.success('AI回复已生成'); loadData() } catch (e) { ElMessage.error('操作失败') }
}
async function syncOne(row) {
  try { await http.post(`/admin/reviews/${row.id}/sync`); ElMessage.success('已同步'); loadData() } catch (e) { ElMessage.error('同步失败') }
}
async function batchSync() {
  syncing.value = true
  try {
    let done = 0
    for (const r of reviews.value) {
      try { await http.post(`/admin/reviews/${r.id}/sync`); done++ } catch (e) { /* skip */ }
    }
    ElMessage.success(`已同步 ${done}/${reviews.value.length} 条评价`)
    loadData()
  } catch (e) { ElMessage.error('同步失败') }
  finally { syncing.value = false }
}
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}
</style>
