<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <div class="page-desc">{{ description }}</div>
    </div>
    
    <!-- 操作区域 -->
    <div class="action-bar" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
    
    <!-- 内容区域使用统一灰色背景 -->
    <div class="content-area">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * 统一的页面容器组件
 * 提供一致的页面布局和样式
 */
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.page-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 14px;
  color: #8c8c8c;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.content-area {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 0;
}
</style> 