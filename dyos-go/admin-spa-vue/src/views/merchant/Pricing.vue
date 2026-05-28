<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">智能定价引擎</span><el-button size="small" type="primary" @click="loadData">刷新</el-button></div>
    <el-table :data="suggestions" stripe v-loading="loading"><el-table-column prop="dish" label="菜品"/><el-table-column prop="current_price" label="当前价格"/><el-table-column prop="suggested_price" label="AI建议价格"/><el-table-column prop="reason" label="建议理由" min-width="180"/><el-table-column label="置信度" width="100"><template #default="{row}"><el-progress :percentage="row.confidence||0" :color="(row.confidence||0)>80?'#10B981':'#F59E0B'" :stroke-width="6"/></template></el-table-column><el-table-column label="操作" width="140"><template #default="{row}"><el-button link type="primary" size="small" @click="applyOne(row)">采纳</el-button></template></el-table-column></el-table>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const suggestions = ref([]), loading = ref(false)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const data = await http.get('/merchant/smart-pricing/suggestions'); suggestions.value = data?.items || data || [] } catch (e) { console.error('加载定价建议失败:', e) }
  finally { loading.value = false }
}
async function applyOne(row) {
  try { await http.post(`/merchant/smart-pricing/apply/${row.id}`); ElMessage.success('已采纳AI定价建议'); loadData() }
  catch (e) { ElMessage.error('操作失败') }
}
</script>

<style scoped>
.page{max-width:1280px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:#10B981;border-radius:2px;display:inline-block}
</style>
