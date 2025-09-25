<!--
 * @file 项目立项管理页面
 * @description 包含申请管理、提交立项、管理中心、会议管理四个标签页
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
-->
<template>
  <div class="th-qd-scope">
    <div class="approval-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">项目立项管理</h1>
          <p class="page-description">管理项目立项相关材料、流程的各项、确保项目目标立项自动</p>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <a-tabs 
          v-model:activeKey="activeTab" 
          @change="handleTabChange"
          class="approval-tabs"
          type="card"
          :animated="true"
          :tabBarGutter="0"
        >
          <!-- 申请管理 -->
          <a-tab-pane key="manage">
            <template #tab>
              <span class="tab-label">
                <UserOutlined />
                申请管理
              </span>
            </template>
            <div class="tab-content">
              <transition name="tab-fade" mode="out-in">
                <ApplicantManage :key="'manage-' + activeTab" />
              </transition>
            </div>
          </a-tab-pane>

          <!-- 提交立项 -->
          <a-tab-pane key="submit">
            <template #tab>
              <span class="tab-label">
                <FileAddOutlined />
                提交立项
              </span>
            </template>
            <div class="tab-content">
              <transition name="tab-fade" mode="out-in">
                <ApplicantSubmit :key="'submit-' + activeTab" />
              </transition>
            </div>
          </a-tab-pane>

          <!-- 管理中心 -->
          <a-tab-pane key="center">
            <template #tab>
              <span class="tab-label">
                <SettingOutlined />
                管理中心
              </span>
            </template>
            <div class="tab-content">
              <transition name="tab-fade" mode="out-in">
                <ManagementCenter :key="'center-' + activeTab" />
              </transition>
            </div>
          </a-tab-pane>

          <!-- 会议管理 -->
          <a-tab-pane key="meeting">
            <template #tab>
              <span class="tab-label">
                <TeamOutlined />
                会议管理
              </span>
            </template>
            <div class="tab-content">
              <transition name="tab-fade" mode="out-in">
                <MeetingManagement :key="'meeting-' + activeTab" />
              </transition>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  UserOutlined,
  FileAddOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

// 动态导入组件（创建嵌入式版本）
import { defineAsyncComponent } from 'vue'

const ApplicantManage = defineAsyncComponent(() => import('./applicant/manage.vue'))
const ApplicantSubmit = defineAsyncComponent(() => import('./applicant/submit.vue'))
const ManagementCenter = defineAsyncComponent(() => import('./management/center.vue'))
const MeetingManagement = defineAsyncComponent(() => import('./management/conclusion.vue'))

const route = useRoute()
const router = useRouter()

// 当前激活的标签页
const activeTab = ref('manage')

/**
 * 处理标签页切换
 */
const handleTabChange = (key) => {
  activeTab.value = key
  
  // 可以根据需要更新URL查询参数
  router.replace({
    path: route.path,
    query: { ...route.query, tab: key }
  })
}

/**
 * 初始化标签页状态
 */
const initTab = () => {
  // 从URL查询参数中获取当前标签页
  const tabFromQuery = route.query.tab
  if (tabFromQuery && ['manage', 'submit', 'center', 'meeting'].includes(tabFromQuery)) {
    activeTab.value = tabFromQuery
  }
}

onMounted(() => {
  initTab()
})
</script>

<style scoped>
.approval-page {
  padding: 0;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
  width: 100%;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 24px 24px 16px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid #ffffff;
  width: 100%;
}

.header-content {
  width: 100%;
  padding: 0 24px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 32px;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 22px;
}

/* 标签页容器 */
.tabs-container {
  background: #ffffff;
  padding: 0;
  width: 100%;
}

/* 标签页样式 */
.approval-tabs {
  width: 100%;
  padding: 0 24px;
}

.approval-tabs :deep(.ant-tabs-nav) {
  margin: 0;
  padding-top: 2px;
  padding-left: 4px;
  padding-bottom: 2px;
  background: #f0f0f0;
}

.approval-tabs :deep(.ant-tabs-tab) {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 10px;
  background: transparent;
  margin-right: 4px;
  margin-left: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.approval-tabs :deep(.ant-tabs-tab-active) {
  background: white;
  color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.approval-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1890ff;
  font-weight: 500;
}

.approval-tabs :deep(.ant-tabs-tab:hover) {
  color: #1890ff;
  background: rgb(255, 255, 255);
}

.approval-tabs :deep(.ant-tabs-tab-active:hover .ant-tabs-tab-btn) {
  color: #1890ff;
}

/* 标签页内容 */
.tab-content {
  background: white;
  min-height: calc(100vh - 200px);
  padding: 24px 0;
  width: 100%;
  position: relative;
}

.approval-tabs :deep(.ant-tabs-content-holder) {
  background: white;
  width: 100%;
}

.approval-tabs :deep(.ant-tabs-tabpane) {
  padding: 0;
  width: 100%;
}

/* 图标和文字间距 */
.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
  transition: all 0.3s ease;
}

.approval-tabs :deep(.ant-tabs-tab-btn span) {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图标颜色 */
.approval-tabs :deep(.ant-tabs-tab:not(.ant-tabs-tab-active) .anticon) {
  color: #8c8c8c;
}

.approval-tabs :deep(.ant-tabs-tab-active .anticon) {
  color: #1890ff;
}

/* 标签页切换动画 */
.approval-tabs :deep(.ant-tabs-content) {
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

.approval-tabs :deep(.ant-tabs-ink-bar) {
  display: none;
}

/* Tab切换动画 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.3s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }
  
  .tabs-container {
    padding: 0;
  }
  
  .approval-tabs {
    padding: 0 16px;
  }
  
  .approval-tabs :deep(.ant-tabs-tab) {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .tab-content {
    min-height: calc(100vh - 180px);
    padding: 16px 0;
  }
}

/* 确保内容区域占满高度 */
.approval-tabs :deep(.ant-tabs-tabpane-active) {
  height: 100%;
}

/* 优化滚动条 */
.tab-content :deep(.ant-table-wrapper) {
  width: 100%;
}

.tab-content :deep(.ant-form) {
  width: 100%;
}

/* 添加加载动画 */
.approval-tabs :deep(.ant-tabs-tabpane) {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>