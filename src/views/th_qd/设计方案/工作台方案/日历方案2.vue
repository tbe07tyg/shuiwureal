<template>
  <div class="calendar-scheme2">
    <div class="calendar-header">
      <a-select v-model:value="month" :options="monthOptions" style="width:100px" />
      <a-select v-model:value="year" :options="yearOptions" style="width:100px;margin-left:8px;" />
    </div>
    <div class="calendar-grid">
      <div class="calendar-week" v-for="w in weeks" :key="w">{{ w }}</div>
      <div
        v-for="d in days"
        :key="d.date+d.day"
        :class="['calendar-day', d.isCurrent && 'current', d.isToday && 'today']"
        @click="selectDate(d.date)"
      >
        {{ d.day }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
const today = dayjs()
const year = ref(today.year())
const month = ref(today.month())
const selected = ref(today.format('YYYY-MM-DD'))
const weeks = ['日','一','二','三','四','五','六']
const monthOptions = Array.from({length:12},(_,i)=>({label:`${i+1}月`,value:i}))
const yearOptions = Array.from({length:5},(_,i)=>({label:`${today.year()-2+i}年`,value:today.year()-2+i}))
const days = computed(() => {
  const first = dayjs().year(year.value).month(month.value).date(1)
  const start = first.day()
  const total = first.daysInMonth()
  const arr = []
  for(let i=0;i<start;i++) arr.push({ day:'', date:'', isCurrent:false, isToday:false })
  for(let d=1;d<=total;d++) {
    const date = dayjs().year(year.value).month(month.value).date(d)
    arr.push({
      day: d,
      date: date.format('YYYY-MM-DD'),
      isCurrent: selected.value === date.format('YYYY-MM-DD'),
      isToday: date.isSame(today, 'day')
    })
  }
  return arr
})
function selectDate(date) {
  selected.value = date
}
</script>
<style scoped>
.calendar-scheme2 {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 20px;
  width: 400px;
}
.calendar-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.calendar-week {
  color: #234fa2;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2px;
}
.calendar-day {
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e6eaf2;
  background: #fff;
  color: #234fa2;
  transition: border 0.2s, color 0.2s, background 0.2s;
}
.calendar-day.current {
  border: 2px solid #234fa2;
  color: #234fa2;
  background: #f5f8ff;
}
.calendar-day.today {
  border: 2px solid #faad14;
  color: #faad14;
}
</style> 