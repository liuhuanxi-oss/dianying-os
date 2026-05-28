<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">商户列表</span><div style="display:flex;gap:10px"><el-input v-model="search" placeholder="搜索商户名称" clearable style="width:240px" size="default" @keyup.enter="loadData"/><el-button type="primary" @click="loadData">查询</el-button></div></div>
    <el-table :data="filtered" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"/>
      <el-table-column prop="name" label="商户名称" min-width="160"/>
      <el-table-column prop="category" label="行业" width="120"/>
      <el-table-column prop="contact" label="联系人" width="100"/>
      <el-table-column label="支付子商户号" width="150"><template #default="{row}">{{ row.wx_sub_mch_id || row.ali_sub_mch_id || '-' }}</template></el-table-column>
      <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="row.status==='APPROVED'?'success':row.status==='PENDING'?'warning':'info'" size="small">{{ statusMap[row.status] || row.status }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="120"><template #default="{row}"><el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button></template></el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData"/>
    <el-dialog v-model="dialogVisible" title="商户详情" width="600px"><div v-if="currentMerchant" class="detail-grid"><div v-for="(v,k) in detailFields" :key="k" class="detail-item"><span class="detail-label">{{ v }}</span><span class="detail-val">{{ currentMerchant[k] || '-' }}</span></div></div></el-dialog>
  </div></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import http from '../../api'
const search = ref(''), loading = ref(false), page = ref(1), total = ref(0), pageSize = 15
const merchants = ref([]), dialogVisible = ref(false), currentMerchant = ref(null)
const statusMap = { APPROVED: '已激活', PENDING: '待审核', REJECTED: '已拒绝', SUSPENDED: '已停用' }
const detailFields = { name:'商户名称', category:'行业分类', contact:'联系人', mno:'商户编号', org_name:'所属机构', channel:'支付通道', settle_type:'结算类型', settle_method:'结算方式', create_time:'创建时间' }

const filtered = computed(() => merchants.value)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize }
    if (search.value) params.name = search.value
    const data = await http.get('/admin/merchants', { params })
    if (data) {
      merchants.value = data.items || []
      total.value = data.total || 0
    }
  } catch (e) { console.error('加载商户失败:', e) }
  finally { loading.value = false }
}

function viewDetail(row) { currentMerchant.value = row; dialogVisible.value = true }
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detail-item{display:flex;flex-direction:column;gap:2px}.detail-label{font-size:11px;color:#999}.detail-val{font-size:14px;color:#333;font-weight:500}
</style>
