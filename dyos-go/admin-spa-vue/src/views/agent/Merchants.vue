<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">商户管理</span><div style="display:flex;gap:10px"><el-input v-model="search" placeholder="搜索商户" clearable style="width:200px" size="default" @keyup.enter="loadData"/><el-button type="primary" @click="loadData">查询</el-button></div></div>
    <el-table :data="merchants" stripe v-loading="loading"><el-table-column prop="name" label="商户名称" min-width="160"/><el-table-column prop="contact" label="联系人" width="100"/><el-table-column label="支付子商户号" width="150"><template #default="{row}">{{ row.wx_sub_mch_id || row.ali_sub_mch_id || '-' }}</template></el-table-column><el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="row.status==='APPROVED'?'success':'warning'" size="small">{{ row.status==='APPROVED'?'已激活':'待审核' }}</el-tag></template></el-table-column><el-table-column label="操作" width="120"><template #default="{row}"><el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button></template></el-table-column></el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="15" v-model:current-page="page" @current-change="loadData"/>
    <el-dialog v-model="dialogVisible" title="商户详情" width="500px"><div v-if="current" class="detail-grid"><p><strong>商户名称：</strong>{{ current.name }}</p><p><strong>联系人：</strong>{{ current.contact }}</p><p><strong>支付子商户号：</strong>{{ current.wx_sub_mch_id || '-' }}</p><p><strong>支付宝子商户号：</strong>{{ current.ali_sub_mch_id || '-' }}</p><p><strong>结算类型：</strong>{{ current.settle_type || '-' }}</p><p><strong>费率：</strong>{{ current.rate || '-' }}</p><p><strong>状态：</strong>{{ current.status }}</p></div></el-dialog>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()
const agentId = auth.user?.agent_id || auth.user?.id
const search = ref(''), loading = ref(false), page = ref(1), total = ref(0), merchants = ref([]), dialogVisible = ref(false), current = ref(null)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try {
    const data = await http.get(`/admin/agents/${agentId}/merchants`, { params: { page: page.value, page_size: 15, name: search.value || undefined } })
    if (data) { merchants.value = data.items || []; total.value = data.total || 0 }
  } catch (e) { console.error('加载商户失败:', e) }
  finally { loading.value = false }
}
function showDetail(row) { current.value = row; dialogVisible.value = true }
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}.detail-grid p{margin:8px 0;font-size:14px}
</style>
