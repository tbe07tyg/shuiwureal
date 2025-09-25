<template>
  <div class="menu-tabs-demo">
    <a-menu mode="vertical" :selectedKeys="[selected]" @click="onClick" class="menu-tabs-vertical">
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
  display: flex;
  justify-content: center;
}
.menu-tabs-vertical {
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.10);
  background: #fff;
  padding: 24px 0;
  min-width: 180px;
}
.menu-tabs-vertical :deep(.ant-menu-item) {
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin: 8px 0;
  padding: 0 24px;
  transition: background 0.2s, color 0.2s;
}
.menu-tabs-vertical :deep(.ant-menu-item-selected) {
  background: #234fa2 !important;
  color: #fff !important;
  font-weight: bold;
  box-shadow: 0 2px 8px #234fa233;
}
.menu-tabs-vertical :deep(.ant-menu-item:hover) {
  background: #eaf0fa !important;
  color: #234fa2 !important;
}
</style> 