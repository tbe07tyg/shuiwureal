<template>
  <div class="calendar-scheme1">
    <div class="calendar-header">
      <span>{{ year }}年{{ month + 1 }}月</span>
      <div class="calendar-actions">
        <a-button size="small" @click="prevMonth">上月</a-button>
        <a-button size="small" @click="nextMonth">下月</a-button>
      </div>
    </div>
    <div class="calendar-grid">
      <div class="calendar-week" v-for="w in weeks" :key="w">{{ w }}</div>
      <div
        v-for="d in days"
        :key="d.date"
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
function prevMonth() {
  if(month.value === 0) {
    year.value--
    month.value = 11
  } else {
    month.value--
  }
}
function nextMonth() {
  if(month.value === 11) {
    year.value++
    month.value = 0
  } else {
    month.value++
  }
}
function selectDate(date) {
  selected.value = date
}
</script>
<style scoped>
.calendar-scheme1 {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
  padding: 24px;
  width: 420px;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 16px;
}
.calendar-actions a-button {
  margin-left: 8px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.calendar-week {
  color: #234fa2;
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
}
.calendar-day {
  height: 38px;
  line-height: 38px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  background: #f5f8ff;
  color: #234fa2;
  transition: background 0.2s, color 0.2s;
}
.calendar-day.current {
  background: #234fa2;
  color: #fff;
}
.calendar-day.today {
  border: 2px solid #faad14;
}
</style> 