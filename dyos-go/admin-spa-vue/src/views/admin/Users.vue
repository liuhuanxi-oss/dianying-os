<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">用户管理</span></div>
    <el-tabs v-model="tab">
      <el-tab-pane label="角色管理" name="roles">
        <el-table :data="roles" stripe v-loading="rLoading"><el-table-column prop="name" label="角色名称"/><el-table-column prop="description" label="描述" min-width="200"/><el-table-column prop="user_count" label="用户数" width="100"/></el-table>
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="logs" stripe v-loading="lLoading"><el-table-column prop="action" label="操作" min-width="200"/><el-table-column prop="operator" label="操作人" width="120"/><el-table-column prop="created_at" label="时间" width="160"/></el-table>
      </el-tab-pane>
    </el-tabs>
  </div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
const tab = ref('roles'), roles = ref([]), logs = ref([]), rLoading = ref(false), lLoading = ref(false)
onMounted(async () => {
  rLoading.value = true
  try { const data = await http.get('/admin/settings/roles'); roles.value = data || [] } catch (e) { console.error(e) }
  finally { rLoading.value = false }
  lLoading.value = true
  try { const data = await http.get('/admin/settings/operation-logs'); logs.value = data?.items || data || [] } catch (e) { console.error(e) }
  finally { lLoading.value = false }
})
</script>

<style scoped>
.page{max-width:1400px}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
</style>
