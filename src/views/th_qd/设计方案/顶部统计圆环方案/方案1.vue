<template>
  <div class="stat-cards-row">
    <div class="stat-card" v-for="card in cards" :key="card.title">
      <div class="stat-card-icon" :style="{background:card.iconBg}">
        <component :is="card.icon" />
      </div>
      <div class="stat-card-content">
        <div class="stat-card-title">{{ card.title }}</div>
        <div class="stat-card-value">{{ card.value }}</div>
      </div>
      <a-progress type="circle" :percent="card.percent" :width="56" :strokeColor="card.color" :format="() => ''" />
    </div>
  </div>
</template>
<script setup>
import { CarryOutOutlined, ProjectOutlined, ExclamationCircleOutlined, AlertOutlined } from '@ant-design/icons-vue'
const cards = [
  { title: '项目总数', value: 128, percent: 80, color: '#234fa2', icon: ProjectOutlined, iconBg: 'rgba(35,79,162,0.08)' },
  { title: '待办事项', value: 12, percent: 60, color: '#faad14', icon: CarryOutOutlined, iconBg: 'rgba(250,173,20,0.08)' },
  { title: '逾期任务', value: 3, percent: 20, color: '#ff4d4f', icon: ExclamationCircleOutlined, iconBg: 'rgba(255,77,79,0.08)' },
  { title: '预警项目', value: 5, percent: 40, color: '#52c41a', icon: AlertOutlined, iconBg: 'rgba(82,196,26,0.08)' }
]
</script>
<style scoped>
.stat-cards-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
  display: flex;
  align-items: center;
  padding: 18px 28px;
  min-width: 260px;
  position: relative;
  flex: 1;
}
.stat-card-icon {
  position: absolute;
  left: 18px;
  top: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.stat-card-content {
  margin-left: 60px;
  flex: 1;
}
.stat-card-title {
  font-size: 15px;
  color: #234fa2;
  font-weight: 600;
}
.stat-card-value {
  font-size: 28px;
  font-weight: bold;
  color: #234fa2;
}
</style> 