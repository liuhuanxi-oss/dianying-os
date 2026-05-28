<template>
  <div class="mp-page">
    <div v-if="reviews.length===0" style="text-align:center;color:#999;padding:40px;font-size:13px">暂无评价</div>
    <div class="mp-card" v-for="r in reviews" :key="r.id">
      <div class="mp-review-header">
        <span class="mp-platform"><el-tag size="small">{{ r.platform }}</el-tag></span>
        <el-rate :model-value="r.rating" disabled size="small"/>
        <span style="font-size:11px;color:#999;margin-left:auto">{{ formatTime(r.created_at) }}</span>
      </div>
      <div class="mp-review-content">{{ r.content }}</div>
      <div class="mp-review-reply" v-if="r.ai_reply || r.reply">
        <span style="color:var(--primary);font-size:11px">AI建议回复：</span>{{ r.ai_reply || r.reply }}
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <el-button size="small" type="primary" plain @click="adoptReply(r)">采纳并回复</el-button>
      </div>
    </div>
    <div style="text-align:center;padding:12px" v-if="total > reviews.length">
      <el-button size="small" @click="loadMore" :loading="loading">加载更多</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const reviews = ref([]), loading = ref(false), page = ref(1), total = ref(0)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try {
    const data = await http.get('/merchant/reviews', { params: { page: page.value, page_size: 10 } })
    if (data) { reviews.value = page.value === 1 ? (data.items || []) : [...reviews.value, ...(data.items || [])]; total.value = data.total || 0 }
  } catch (e) { console.error('加载评价失败:', e) }
  finally { loading.value = false }
}
async function loadMore() { page.value++; loadData() }
async function adoptReply(row) {
  try { await http.post(`/merchant/reviews/ai-reply`, { review_id: row.id, reply: row.ai_reply || row.reply }); ElMessage.success('已回复'); row.reply_status = '已回复' } catch (e) { ElMessage.error('操作失败') }
}
function formatTime(t) { if (!t) return ''; const d = new Date(t); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}` }
</script>

<style scoped>
.mp-page{padding:14px}.mp-card{background:#fff;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}.mp-review-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}.mp-review-content{font-size:13px;color:#333;line-height:1.5;margin-bottom:8px}.mp-review-reply{font-size:11px;color:#666;background:#f0f4ff;padding:8px 10px;border-radius:6px;line-height:1.5}
</style>
