<template>
  <div class="page">
    <div class="card"><div class="card-header"><span class="card-title">系统设置</span></div>
    <el-tabs v-model="tab">
      <el-tab-pane label="基本设置" name="basic">
        <el-form label-width="120px" style="max-width:550px" v-loading="loading">
          <el-form-item label="系统名称"><el-input v-model="form.site_name"/></el-form-item>
          <el-form-item label="管理员邮箱"><el-input v-model="form.admin_email"/></el-form-item>
          <el-form-item label="评价自动同步"><el-switch v-model="form.auto_sync_reviews"/></el-form-item>
          <el-form-item label="AI自动回复"><el-switch v-model="form.ai_auto_reply"/></el-form-item>
          <el-form-item><el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="通知配置" name="notify">
        <el-form label-width="140px" style="max-width:550px" v-loading="loading">
          <el-form-item label="差评预警通知"><el-switch v-model="form.bad_review_alert"/></el-form-item>
          <el-form-item label="投诉升级通知"><el-switch v-model="form.complaint_escalate"/></el-form-item>
          <el-form-item label="日报推送"><el-switch v-model="form.daily_report_push"/></el-form-item>
          <el-form-item label="新商户审核通知"><el-switch v-model="form.new_merchant_notify"/></el-form-item>
          <el-form-item><el-button type="primary" @click="saveSettings" :loading="saving">保存</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="定价配置" name="pricing">
        <el-form label-width="140px" style="max-width:550px" v-loading="pricingLoading">
          <el-form-item label="免费版"><el-input v-model="pricing.free" disabled/></el-form-item>
          <el-form-item label="专业版"><el-input v-model="pricing.pro"/></el-form-item>
          <el-form-item label="旗舰版"><el-input v-model="pricing.enterprise"/></el-form-item>
          <el-form-item label="代理商佣金比例"><el-input v-model="pricing.agent_commission"/></el-form-item>
          <el-form-item><el-button type="primary" @click="savePricing" :loading="savingPricing">保存</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const tab = ref('basic'), loading = ref(false), saving = ref(false), pricingLoading = ref(false), savingPricing = ref(false)
const form = ref({ site_name: '店赢OS 2.0', admin_email: 'admin@detian.xin', auto_sync_reviews: true, ai_auto_reply: true, bad_review_alert: true, complaint_escalate: true, daily_report_push: false, new_merchant_notify: true })
const pricing = ref({ free: '免费', pro: '¥299/月', enterprise: '¥799/月', agent_commission: '15%' })

onMounted(async () => {
  loading.value = true
  try {
    const data = await http.get('/admin/settings')
    if (data) form.value = { ...form.value, ...data }
  } catch (e) { console.error('加载设置失败:', e) }
  finally { loading.value = false }
  try {
    const data = await http.get('/admin/settings/pricing')
    if (data) pricing.value = { ...pricing.value, ...data }
  } catch (e) { /* use defaults */ }
})

async function saveSettings() {
  saving.value = true
  try { await http.put('/admin/settings', form.value); ElMessage.success('设置已保存') } catch (e) { ElMessage.error('保存失败') }
  finally { saving.value = false }
}

async function savePricing() {
  savingPricing.value = true
  try { await http.put('/admin/settings/pricing/v1', pricing.value); ElMessage.success('定价已更新') } catch (e) { ElMessage.error('保存失败') }
  finally { savingPricing.value = false }
}
</script>

<style scoped>
.page{max-width:1400px}
.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}
.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
</style>
