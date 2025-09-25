<template>
  <div class="calendar-scheme3">
    <div class="calendar-header">
      <a-button size="small" @click="prevMonth">‹</a-button>
      <span>{{ year }}年{{ month + 1 }}月</span>
      <a-button size="small" @click="nextMonth">›</a-button>
    </div>
    <div class="calendar-grid">
      <div class="calendar-week" v-for="w in weeks" :key="w">{{ w }}</div>
      <div
        v-for="d in days"
        :key="d.date+d.day"
        :class="['calendar-day', d.isCurrent && 'current', d.isToday && 'today']"
        @click="selectDate(d.date)"
      >
        <span>{{ d.day }}</span>
        <span v-if="d.hasEvent" class="event-dot"></span>
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
// mock事件
const eventDates = [
  dayjs().date(3).format('YYYY-MM-DD'),
  dayjs().date(8).format('YYYY-MM-DD'),
  dayjs().date(15).format('YYYY-MM-DD')
]
const days = computed(() => {
  const first = dayjs().year(year.value).month(month.value).date(1)
  const start = first.day()
  const total = first.daysInMonth()
  const arr = []
  for(let i=0;i<start;i++) arr.push({ day:'', date:'', isCurrent:false, isToday:false, hasEvent:false })
  for(let d=1;d<=total;d++) {
    const date = dayjs().year(year.value).month(month.value).date(d)
    arr.push({
      day: d,
      date: date.format('YYYY-MM-DD'),
      isCurrent: selected.value === date.format('YYYY-MM-DD'),
      isToday: date.isSame(today, 'day'),
      hasEvent: eventDates.includes(date.format('YYYY-MM-DD'))
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
.calendar-scheme3 {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(35,79,162,0.10);
  padding: 28px;
  width: 440px;
}
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #234fa2;
  margin-bottom: 18px;
  gap: 16px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.calendar-week {
  color: #234fa2;
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
}
.calendar-day {
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 12px;
  cursor: pointer;
  background: #f8faff;
  color: #234fa2;
  position: relative;
  transition: box-shadow 0.2s, color 0.2s, background 0.2s;
  box-shadow: 0 1px 4px rgba(35,79,162,0.04);
}
.calendar-day.current {
  background: #234fa2;
  color: #fff;
  box-shadow: 0 2px 8px #234fa233;
}
.calendar-day.today {
  border: 2px solid #faad14;
}
.event-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: #faad14;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  bottom: 7px;
  transform: translateX(-50%);
}
</style> 