<template>
  <div>
    <div class="ai-float-btn" @click="showModal = true">🤖</div>
    <a-modal v-model:open="showModal" width="420px" :footer="null" :closable="true" :maskClosable="true" class="ai-modal" title="科研管控小助手">
      <div class="ai-modal-header">
        <div class="ai-avatar">🤖</div>
        <div class="ai-title">科研管控小助手</div>
      </div>
      <section class="ai-section ai-card">
        <h4>🔔 今日提醒</h4>
        <ul>
          <li v-for="item in reminders" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section class="ai-section ai-card">
        <h4>⚡ 智能建议</h4>
        <ul>
          <li v-for="item in suggestions" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section class="ai-section ai-card">
        <h4>📝 快捷操作</h4>
        <a-button v-for="btn in actions" :key="btn.text" @click="btn.action" size="small" style="margin-right:8px; margin-bottom:8px;">{{ btn.text }}</a-button>
      </section>
      <section class="ai-section ai-chat ai-card">
        <div v-for="msg in chatHistory" :key="msg.id" :class="'ai-msg ' + msg.role">
          <span v-if="msg.role==='user'" class="ai-user-avatar">🧑</span>
          <span v-if="msg.role==='ai'" class="ai-ai-avatar">🤖</span>
          <span class="ai-msg-text">{{ msg.text }}</span>
        </div>
      </section>
      <div class="ai-input-bar">
        <a-input-search v-model:value="input" enter-button="发送" @search="sendMsg" placeholder="请输入您的问题..." />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
const reminders = ref([
  '3个项目节点今日到期',
  '2份合同即将到期',
  '1个项目预算超支'
])
const suggestions = ref([
  '建议优先推进"智能水表"项目',
  '发现3个项目进度滞后'
])
const actions = ref([
  { text: '一键短信催询', action: () => {} },
  { text: '节点管理计划', action: () => {} },
  { text: '一键付款申请', action: () => {} }
])
const chatHistory = ref([
  { id: 1, role: 'user', text: '如何查看项目进度？' },
  { id: 2, role: 'ai', text: '请在"项目实施-进度监控"中查看详细的项目进度信息…' }
])
const input = ref('')
function sendMsg(val) {
  if (!val) return
  chatHistory.value.push({ id: Date.now(), role: 'user', text: val })
  // 这里可集成AI回复逻辑
  input.value = ''
}
</script>

<style scoped>
.ai-float-btn {
  position: fixed;
  right: 32px;
  bottom: 80px;
  z-index: 2000;
  width: 56px;
  height: 56px;
  background: #234fa2;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 2px 8px #234fa233;
  cursor: pointer;
  transition: background 0.2s;
}
.ai-float-btn:hover {
  background: #3a6ed8;
}
.ai-modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.ai-avatar {
  width: 40px;
  height: 40px;
  background: #eaf0fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
}
.ai-title {
  font-size: 20px;
  font-weight: bold;
  color: #234fa2;
}
.ai-section {
  margin-bottom: 12px;
}
.ai-card {
  background: #f8fafd;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px #234fa211;
  margin-bottom: 12px;
}
.ai-chat {
  max-height: 180px;
  overflow-y: auto;
  background: #fff;
}
.ai-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.ai-msg.user {
  flex-direction: row-reverse;
  text-align: right;
}
.ai-msg.ai {
  text-align: left;
}
.ai-user-avatar, .ai-ai-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin: 0 6px;
}
.ai-msg-text {
  background: #eaf0fa;
  border-radius: 6px;
  padding: 6px 12px;
  color: #234fa2;
  max-width: 260px;
  word-break: break-all;
}
.ai-msg.user .ai-msg-text {
  background: #234fa2;
  color: #fff;
}
.ai-input-bar {
  margin-top: 8px;
}
</style> 