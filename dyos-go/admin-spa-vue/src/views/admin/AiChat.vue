<template>
  <div class="page"><div class="card"><div class="card-header"><span class="card-title">AI客服中心</span><el-tag type="warning" size="small">实时在线</el-tag></div>
    <div class="chat-layout">
      <div class="chat-list"><div class="chat-item" v-for="(s,i) in sessions" :key="s.id" :class="{active:current===i}" @click="selectSession(i)"><el-avatar :size="36" icon="UserFilled"/><div class="chat-item-info"><div class="chat-item-name">{{ s.merchant_name || s.customer_name || '用户' }}</div><div class="chat-item-msg">{{ s.last_message || '暂无消息' }}</div></div><div class="chat-item-time">{{ formatTime(s.updated_at) }}</div></div></div>
      <div class="chat-main">
        <div class="chat-msgs" ref="chatMsgs" v-loading="msgLoading">
          <div v-if="messages.length===0" style="text-align:center;color:#999;padding:40px">选择左侧会话开始对话</div>
          <div v-for="(m,j) in messages" :key="j" :class="['msg',m.sender==='customer'?'msg-left':'msg-right']">
            <div v-if="m.sender==='customer'"><el-avatar :size="28" icon="UserFilled"/></div>
            <div class="msg-bubble" :class="m.sender==='customer'?'bubble-left':'bubble-right'">{{ m.content }}</div>
            <div v-if="m.sender!=='customer'"><el-avatar :size="28"><el-icon><Monitor/></el-icon></el-avatar></div>
          </div>
        </div>
        <div class="chat-input" v-if="currentSession"><el-input v-model="input" placeholder="输入回复..." @keyup.enter="sendMsg"><template #append><el-button type="primary" @click="sendMsg" :loading="sending">发送</el-button></template></el-input></div>
      </div>
    </div>
  </div></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import http from '../../api'
import { ElMessage } from 'element-plus'
const sessions = ref([]), messages = ref([]), current = ref(-1), currentSession = ref(null), input = ref(''), sending = ref(false), msgLoading = ref(false), chatMsgs = ref(null)

onMounted(async () => {
  try { const data = await http.get('/admin/chat/sessions'); if (data?.items) sessions.value = data.items } catch (e) { console.error('加载会话失败:', e) }
})

async function selectSession(i) {
  current.value = i; currentSession.value = sessions.value[i]; msgLoading.value = true
  try { const data = await http.get(`/admin/chat/sessions/${currentSession.value.id}/messages`); messages.value = data?.items || data || [] } catch (e) { messages.value = [] }
  finally { msgLoading.value = false; nextTick(() => { if (chatMsgs.value) chatMsgs.value.scrollTop = chatMsgs.value.scrollHeight }) }
}

async function sendMsg() {
  if (!input.value.trim() || !currentSession.value) return
  sending.value = true
  try {
    await http.post('/admin/chat/message', { session_id: currentSession.value.id, content: input.value, sender: 'admin' })
    messages.value.push({ sender: 'admin', content: input.value })
    input.value = ''
    nextTick(() => { if (chatMsgs.value) chatMsgs.value.scrollTop = chatMsgs.value.scrollHeight })
  } catch (e) { ElMessage.error('发送失败') }
  finally { sending.value = false }
}

function formatTime(t) { if (!t) return ''; const d = new Date(t); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}` }
</script>

<style scoped>
.page{max-width:1400px;height:calc(100vh - 120px)}.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);height:100%;display:flex;flex-direction:column}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-shrink:0}.card-title{font-size:14px;font-weight:600;color:#333;display:flex;align-items:center;gap:8px}.card-title::before{content:"";width:3px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}.chat-layout{display:flex;gap:16px;flex:1;overflow:hidden}.chat-list{width:240px;border-right:1px solid #f0f0f0;overflow-y:auto;flex-shrink:0}.chat-item{display:flex;align-items:center;gap:10px;padding:12px;cursor:pointer;border-radius:8px;margin-bottom:4px}.chat-item:hover{background:#f8f9fa}.chat-item.active{background:rgba(30,58,95,0.06)}.chat-item-info{flex:1;min-width:0}.chat-item-name{font-size:13px;font-weight:500}.chat-item-msg{font-size:11px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chat-item-time{font-size:10px;color:#bbb}.chat-main{flex:1;display:flex;flex-direction:column;overflow:hidden}.chat-msgs{flex:1;overflow-y:auto;padding:0 8px}.msg{display:flex;align-items:flex-start;gap:8px;margin-bottom:16px}.msg-left{justify-content:flex-start}.msg-right{justify-content:flex-end}.msg-bubble{padding:10px 14px;border-radius:12px;font-size:13px;max-width:70%;line-height:1.5}.bubble-left{background:#f0f0f0;color:#333}.bubble-right{background:var(--primary);color:#fff}.chat-input{margin-top:12px;flex-shrink:0}
</style>
