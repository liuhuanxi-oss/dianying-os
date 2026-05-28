<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">支付投诉处理</span></div>
    <el-steps :active="activeStep" align-center style="margin-bottom:24px"><el-step title="投诉接收"/><el-step title="AI分诊"/><el-step title="天阙退款"/><el-step title="完成处理"/></el-steps>
    <el-table :data="complaints" stripe v-loading="loading"><el-table-column prop="complaint_id" label="投诉单号" width="160"/><el-table-column prop="platform" label="支付平台" width="100"><template #default="{row}"><el-tag :type="row.platform==='wechat_pay'?'success':row.platform==='alipay'?'':'info'" size="small">{{ row.platform==='wechat_pay'?'微信支付':row.platform==='alipay'?'支付宝':row.platform||'--' }}</el-tag></template></el-table-column><el-table-column prop="content" label="投诉内容" min-width="220" show-overflow-tooltip/><el-table-column label="退款金额" width="110"><template #default="{row}">¥{{ (row.refund_amount || row.complaint_amount || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag></template></el-table-column><el-table-column label="操作" width="200"><template #default="{row}"><el-button link type="primary" size="small" @click="handleAnalyze(row)">AI分析</el-button><el-button link type="warning" size="small" @click="handleRefund(row)">天阙退款</el-button><el-button link type="success" size="small" @click="handleComplete(row)">完成</el-button></template></el-table-column></el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const complaints = ref([]), loading = ref(false), page = ref(1), total = ref(0), activeStep = ref(1)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try {
    const data = await http.get('/admin/complaints', { params: { page: page.value, page_size: 15 } })
    if (data) { complaints.value = data.items || []; total.value = data.total || 0 }
  } catch (e) { console.error('加载投诉失败:', e) }
  finally { loading.value = false }
}
function statusType(s) { const m={ 'pending':'warning','analyzing':'','processing':'warning','refunded':'success','completed':'success' }; return m[s]||'info' }
function statusLabel(s) { const m={ 'pending':'待处理','analyzing':'AI分析中','processing':'处理中','refunded':'已退款','completed':'已完成' }; return m[s]||s||'待处理' }
async function handleAnalyze(row) { try { await http.post(`/admin/complaints/${row.id}/analyze`); ElMessage.success('AI分析完成'); activeStep.value=2; loadData() } catch (e) { ElMessage.error('分析失败') } }
async function handleRefund(row) { try { await http.post(`/admin/complaints/${row.id}/refund`); ElMessage.success('退款处理中'); activeStep.value=3; loadData() } catch (e) { ElMessage.error('退款失败') } }
async function handleComplete(row) { try { await http.post(`/admin/complaints/${row.id}/complete`); ElMessage.success('处理完成'); activeStep.value=4; loadData() } catch (e) { ElMessage.error('操作失败') } }
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
</style>
