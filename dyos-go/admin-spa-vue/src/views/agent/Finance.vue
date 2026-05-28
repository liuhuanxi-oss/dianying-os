<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">财务管理</span></div>
    <el-tabs v-model="tab">
      <el-tab-pane label="交易流水" name="transactions">
        <el-table :data="transactions" stripe v-loading="tLoading"><el-table-column prop="id" label="流水号" width="180"/><el-table-column prop="merchant_name" label="商户" width="140"/><el-table-column label="金额" width="100"><template #default="{row}">¥{{ (row.amount || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="type" label="类型" width="80"/><el-table-column prop="created_at" label="时间" width="160"/></el-table>
        <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="tTotal" :page-size="15" v-model:current-page="tPage" @current-change="loadTransactions"/>
      </el-tab-pane>
      <el-tab-pane label="退款记录" name="refunds">
        <el-table :data="refunds" stripe v-loading="rLoading"><el-table-column prop="id" label="退款单号" width="180"/><el-table-column prop="merchant_name" label="商户" width="140"/><el-table-column label="退款金额" width="100"><template #default="{row}">¥{{ (row.amount || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="reason" label="原因" min-width="160"/><el-table-column prop="created_at" label="时间" width="160"/></el-table>
        <el-pagination style="margin-top:16px;justify-content:center" background layout="prev,pager,next" :total="rTotal" :page-size="15" v-model:current-page="rPage" @current-change="loadRefunds"/>
      </el-tab-pane>
    </el-tabs>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
const tab = ref('transactions'), transactions = ref([]), refunds = ref([]), tLoading = ref(false), rLoading = ref(false), tPage = ref(1), rPage = ref(1), tTotal = ref(0), rTotal = ref(0)
onMounted(() => { loadTransactions(); loadRefunds() })
async function loadTransactions() {
  tLoading.value = true
  try { const data = await http.get('/admin/finance/transactions', { params: { page: tPage.value, page_size: 15 } }); if (data) { transactions.value = data.items || []; tTotal.value = data.total || 0 } } catch (e) { console.error(e) }
  finally { tLoading.value = false }
}
async function loadRefunds() {
  rLoading.value = true
  try { const data = await http.get('/admin/finance/refunds', { params: { page: rPage.value, page_size: 15 } }); if (data) { refunds.value = data.items || []; rTotal.value = data.total || 0 } } catch (e) { console.error(e) }
  finally { rLoading.value = false }
}
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#2196F3;border-radius:2px;display:inline-block}
</style>
