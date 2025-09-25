<template>
  <div class="stat-cards-row2">
    <div class="stat-card2" v-for="card in cards" :key="card.title" :style="{background:card.bg}">
      <div class="stat-card2-main">
        <div class="stat-card2-value">{{ card.value }}</div>
        <div class="stat-card2-title">{{ card.title }}</div>
      </div>
      <div class="stat-card2-progress">
        <a-progress
          type="circle"
          :percent="card.percent"
          :width="64"
          :strokeColor="card.color"
        >
          <template #format>
            <component :is="card.icon" :style="{fontSize:'32px',color:card.color}" />
          </template>
        </a-progress>
      </div>
    </div>
  </div>
</template>
<script setup>
import { CarryOutOutlined, ProjectOutlined, ExclamationCircleOutlined, AlertOutlined } from '@ant-design/icons-vue'
const cards = [
  { title: '项目总数', value: 128, percent: 80, color: '#234fa2', bg: 'linear-gradient(135deg,#eaf0fa 0%,#f5f8ff 100%)', icon: ProjectOutlined },
  { title: '待办事项', value: 12, percent: 60, color: '#faad14', bg: 'linear-gradient(135deg,#fff7e6 0%,#f5f8ff 100%)', icon: CarryOutOutlined },
  { title: '逾期任务', value: 3, percent: 20, color: '#ff4d4f', bg: 'linear-gradient(135deg,#fff1f0 0%,#f5f8ff 100%)', icon: ExclamationCircleOutlined },
  { title: '预警项目', value: 5, percent: 40, color: '#52c41a', bg: 'linear-gradient(135deg,#f6ffed 0%,#f5f8ff 100%)', icon: AlertOutlined }
]
</script>
<style scoped>
.stat-cards-row2 {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card2 {
  border-radius: 16px;
  box-shadow: 0 8px 36px rgba(35,79,162,0.20);
  display: flex;
  align-items: center;
  padding: 18px 32px 18px 24px;
  min-width: 240px;
  flex: 1;
  background: #f5f8ff;
  justify-content: space-between;
  gap: 32px;
}
.stat-card2-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.stat-card2-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card2-title {
  font-size: 15px;
  color: #234fa2;
  font-weight: 600;
  margin-top: 2px;
}
.stat-card2-value {
  font-size: 32px;
  font-weight: bold;
  color: #234fa2;
}
</style> 