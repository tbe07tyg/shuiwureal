<template>
  <div style="padding: 32px;">
    <h2>顶部统计圆环方案</h2>
    <StatPreview />
    <h2 style="margin-top:32px;">菜单栏方案</h2>
    <MenuPreview />
    <h2 style="margin-top:32px;">日历方案1</h2>
    <CalendarScheme1 />
    <h2 style="margin-top:32px;">日历方案2</h2>
    <CalendarScheme2 />
    <h2 style="margin-top:32px;">日历方案3</h2>
    <CalendarScheme3 />
  </div>
</template>
<script setup>
import CalendarScheme1 from './日历方案1.vue'
import CalendarScheme2 from './日历方案2.vue'
import CalendarScheme3 from './日历方案3.vue'
import StatPreview from '../顶部统计圆环方案/Preview.vue'
import MenuPreview from '../菜单栏/Preview.vue'
</script> 