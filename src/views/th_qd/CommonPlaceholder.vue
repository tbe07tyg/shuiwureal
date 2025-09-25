<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <ConstructionOutlined />
      </div>
      <h2>{{ pageTitle }}</h2>
      <p>此页面正在开发中，敬请期待...</p>
      <div class="placeholder-info">
        <p><strong>页面路径:</strong> {{ $route.path }}</p>
        <p><strong>页面名称:</strong> {{ $route.name }}</p>
      </div>
      <a-button type="primary" @click="goBack">
        <ArrowLeftOutlined />
        返回上一页
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConstructionOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

// 根据路由生成页面标题
const pageTitle = computed(() => {
  const path = route.path
  const titleMap = {
    '/research/requirements': '需求池管理',
    '/research/results': '调研记录',
    '/approval/materials': '申请材料管理',
    '/approval/review': '立项论证会',
    '/approval/decision': '立项审批',

    '/implementation/contract': '合同管理',
    '/implementation/nodes': '节点管理中心',
    '/implementation/payment': '付款管理',
    '/implementation/progress': '进度监控',
    '/implementation/acceptance': '项目验收',
    '/analytics/project': '项目统计',
    '/analytics/finance': '财务分析',
    '/analytics/efficiency': '效率分析'
  }
  
  return titleMap[path] || '页面开发中'
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px;
}

.placeholder-content {
  text-align: center;
  max-width: 500px;
}

.placeholder-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 24px;
}

.placeholder-content h2 {
  color: #234fa2;
  margin-bottom: 16px;
  font-size: 24px;
}

.placeholder-content p {
  color: #666;
  font-size: 16px;
  margin-bottom: 24px;
}

.placeholder-info {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  text-align: left;
}

.placeholder-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.placeholder-info strong {
  color: #333;
}
</style> 