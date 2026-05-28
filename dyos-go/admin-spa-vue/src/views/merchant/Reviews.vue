<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">评价管理</span><div style="display:flex;gap:10px"><el-select v-model="platform" placeholder="平台筛选" clearable style="width:120px" @change="loadData"><el-option label="大众点评" value="dianping"/><el-option label="美团" value="meituan"/><el-option label="小红书" value="xiaohongshu"/></el-select><el-button type="primary" @click="loadData">刷新</el-button></div></div>
    <el-table :data="reviews" stripe v-loading="loading"><el-table-column prop="platform" label="平台" width="90"/><el-table-column prop="content" label="评价内容" min-width="240" show-overflow-tooltip/><el-table-column prop="rating" label="评分" width="100"><template #default="{row}"><el-rate :model-value="row.rating" disabled text-color="#F59E0B" size="small"/></template></el-table-column><el-table-column prop="created_at" label="时间" width="160"/><el-table-column label="操作" width="160"><template #default="{row}"><el-button link type="primary" size="small" @click="aiReply(row)">AI回复</el-button><el-button link type="success" size="small" @click="syncReview(row)">同步</el-button></template></el-table-column></el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const platform = ref(''), reviews = ref([]), loading = ref(false), page = ref(1), total = ref(0)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try {
    const data = await http.get('/merchant/reviews', { params: { page: page.value, page_size: 15, platform: platform.value || undefined } })
    if (data) { reviews.value = data.items || []; total.value = data.total || 0 }
  } catch (e) { console.error('加载评价失败:', e) }
  finally { loading.value = false }
}
async function aiReply(row) {
  try { await http.post('/merchant/reviews/ai-reply', { review_id: row.id }); ElMessage.success('AI回复已生成'); loadData() }
  catch (e) { ElMessage.error('生成失败') }
}
async function syncReview(row) {
  try { await http.post(`/merchant/reviews/${row.id}/sync`); ElMessage.success('已同步') }
  catch (e) { ElMessage.error('同步失败') }
}
</script>

<style scoped>
.page{max-width:1280px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#10B981;border-radius:2px;display:inline-block}
</style>
