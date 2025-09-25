<template>
  <div class="stat-cards-row3">
    <div class="stat-card3" v-for="card in cards" :key="card.title" :style="{borderImage:card.border}" >
      <div class="stat-card3-value">{{ card.value }}</div>
      <div class="stat-card3-bottom">
        <a-progress type="circle" :percent="card.percent" :width="64" :strokeColor="card.color" :format="() => ''" />
        <div class="stat-card3-title">{{ card.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
const cards = [
  { title: '项目总数', value: 128, percent: 80, color: '#234fa2', border: 'linear-gradient(135deg,#234fa2,#4e7be6) 1' },
  { title: '待办事项', value: 12, percent: 60, color: '#faad14', border: 'linear-gradient(135deg,#faad14,#ffe58f) 1' },
  { title: '逾期任务', value: 3, percent: 20, color: '#ff4d4f', border: 'linear-gradient(135deg,#ff4d4f,#ffccc7) 1' },
  { title: '预警项目', value: 5, percent: 40, color: '#52c41a', border: 'linear-gradient(135deg,#52c41a,#b7eb8f) 1' }
]
</script>
<style scoped>
.stat-cards-row3 {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-card3 {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0 18px 0;
  min-width: 220px;
  flex: 1;
  border: 3px solid;
  border-image-slice: 1;
}
.stat-card3-value {
  font-size: 36px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 10px;
}
.stat-card3-bottom {
  display: flex;
  align-items: center;
  gap: 18px;
}
.stat-card3-title {
  font-size: 16px;
  color: #234fa2;
  font-weight: 600;
}
</style> 