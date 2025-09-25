<template>
  <div class="menu-tabs-demo">
    <a-menu mode="horizontal" :selectedKeys="[selected]" @click="onClick" class="menu-tabs-line">
      <a-menu-item v-for="item in items" :key="item.key">
        <component :is="item.icon" style="margin-right:8px;" />
        {{ item.label }}
      </a-menu-item>
    </a-menu>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { AppstoreOutlined, ProjectOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons-vue'
const items = [
  { key: 'dashboard', label: '工作台', icon: AppstoreOutlined },
  { key: 'project', label: '项目管理', icon: ProjectOutlined },
  { key: 'literature', label: '文献管理', icon: FileTextOutlined },
  { key: 'settings', label: '系统设置', icon: SettingOutlined }
]
const selected = ref('dashboard')
function onClick(e) {
  selected.value = e.key
}
</script>
<style scoped>
.menu-tabs-demo {
  background: #f5f8ff;
  padding: 32px;
}
.menu-tabs-line {
  border-bottom: 3px solid #e6eaf2;
  background: #fff;
  border-radius: 10px 10px 0 0;
  padding: 0 16px;
}
.menu-tabs-line :deep(.ant-menu-item) {
  font-size: 16px;
  font-weight: 600;
  border-radius: 0;
  margin: 0 8px;
  padding: 0 20px 0 20px;
  border-bottom: 3px solid transparent;
  transition: border 0.2s, color 0.2s;
}
.menu-tabs-line :deep(.ant-menu-item-selected) {
  color: #234fa2 !important;
  border-bottom: 3px solid #234fa2 !important;
  background: transparent !important;
  font-weight: bold;
}
.menu-tabs-line :deep(.ant-menu-item:hover) {
  color: #234fa2 !important;
  background: #eaf0fa !important;
}
</style> 