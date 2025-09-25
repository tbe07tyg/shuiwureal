<!--
 * @file 验收进度查询页面 - 申报单位角色
 * @description 申报单位查询验收申请的进度和状态
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化
-->
<template>
  <div class="progress-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">验收进度查询</h1>
        <p class="page-description">查询和跟踪您的项目验收申请进度</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 查询条件 -->
    <a-card :bordered="false" class="query-card" title="查询条件">
      <a-form layout="inline" :model="queryForm" @finish="handleQuery">
        <a-form-item label="项目名称" name="projectName">
          <a-input
            v-model:value="queryForm.projectName"
            placeholder="请输入项目名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="申请状态" name="status">
          <a-select
            v-model:value="queryForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="submitted">已提交</a-select-option>
            <a-select-option value="under_review">审核中</a-select-option>
            <a-select-option value="approved">审核通过</a-select-option>
            <a-select-option value="rejected">审核驳回</a-select-option>
            <a-select-option value="meeting_scheduled">会议已定</a-select-option>
            <a-select-option value="completed">验收完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提交时间" name="dateRange">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 进度概览 -->
    <div class="stats-overview">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card submitted">
            <div class="stat-icon">
              <SendOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overview.submitted }}</div>
              <div class="stat-label">已提交申请</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card reviewing">
            <div class="stat-icon">
              <EyeOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overview.reviewing }}</div>
              <div class="stat-label">审核中</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card meeting">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overview.meeting }}</div>
              <div class="stat-label">待会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overview.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 进度列表 -->
    <a-card :bordered="false" title="验收进度列表">
      <div class="progress-items">
        <div
          v-for="item in filteredProgressList"
          :key="item.id"
          class="progress-item"
          @click="showProgressDetail(item)"
        >
          <!-- 项目基本信息 -->
          <div class="item-header">
            <div class="project-info">
              <h4 class="project-name">{{ item.projectName }}</h4>
              <span class="project-code">{{ item.projectCode }}</span>
            </div>
            <div class="status-info">
              <a-tag :color="getStatusColor(item.status)" class="status-tag">
                {{ getStatusText(item.status) }}
              </a-tag>
              <span class="submit-time">{{ item.submitTime }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="item-progress">
            <a-progress
              :percent="getProgressPercent(item.status)"
              :status="getProgressStatus(item.status)"
              :stroke-color="getProgressColor(item.status)"
              size="small"
            />
            <div class="progress-text">{{ getProgressText(item.status) }}</div>
          </div>

          <!-- 时间线 -->
          <div class="item-timeline">
            <a-timeline size="small">
              <a-timeline-item
                v-for="step in item.timeline"
                :key="step.id"
                :color="getTimelineColor(step.status)"
              >
                <template #dot>
                  <component :is="getTimelineIcon(step.status)" />
                </template>
                <div class="timeline-content">
                  <div class="timeline-title">{{ step.title }}</div>
                  <div class="timeline-desc">{{ step.description }}</div>
                  <div class="timeline-time">{{ step.time }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <a-space>
              <a-button size="small" @click.stop="viewDetail(item)">
                查看详情
              </a-button>
              <a-button 
                v-if="item.status === 'rejected'" 
                type="primary" 
                size="small" 
                @click.stop="resubmit(item)"
              >
                重新提交
              </a-button>
              <a-button 
                v-if="item.status === 'meeting_scheduled'" 
                type="primary" 
                size="small" 
                @click.stop="viewMeetingInfo(item)"
              >
                查看会议安排
              </a-button>
            </a-space>
          </div>
        </div>
        
        <!-- 空数据状态 -->
        <div v-if="filteredProgressList.length === 0" class="empty-state">
          <a-empty description="暂无符合条件的验收申请记录" />
        </div>
      </div>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="`${currentItem?.projectName || ''} - 验收详情`"
      width="800px"
      :footer="null"
    >
      <div v-if="currentItem" class="detail-content">
        <!-- 详情内容... -->
      </div>
    </a-modal>

    <!-- 会议弹窗 -->
    <a-modal
      v-model:visible="meetingVisible"
      :title="`${currentItem?.projectName || ''} - 会议安排`"
      width="600px"
      :footer="null"
    >
      <div v-if="currentItem && currentItem.meetingInfo" class="meeting-content">
        <!-- 会议内容... -->
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 验收进度查询页面 - 申报单位角色
 * 
 * 本页面严格遵循《页面统一风格设计规范.md》中的规范要求：
 * 1. 使用PageContainer作为页面最外层容器
 * 2. 提供title和description作为PageContainer的属性
 * 3. 将主要操作按钮放在actions插槽中
 * 4. 内容区域使用统一的灰色背景
 * 5. 卡片内容区域置于灰色背景之上
 * 6. 统一使用Ant Design Vue组件和全局样式
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  ReloadOutlined,
  SendOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 查询表单
const queryForm = ref({
  projectName: '',
  status: undefined,
  dateRange: []
})

// 进度概览数据
const overview = ref({
  submitted: 8,
  reviewing: 3,
  meeting: 2,
  completed: 5
})

// 弹窗控制
const detailVisible = ref(false)
const meetingVisible = ref(false)
const currentItem = ref(null)

// 模拟进度数据
const progressList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    status: 'meeting_scheduled',
    submitTime: '2024-01-15',
    expectedTime: '2024-03-20',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-15 10:30',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核通过',
        time: '2024-01-16 14:20',
        status: 'completed'
      },
      {
        id: 3,
        title: '会议安排',
        description: '验收会议已安排',
        time: '2024-01-18 09:15',
        status: 'current'
      }
    ],
    meetingInfo: {
      time: '2024-01-25 14:00',
      location: '会议室A-201',
      type: '现场会议',
      requirements: '请携带项目相关材料',
      contact: '张秘书 13800138000'
    },
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-15 10:30',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核通过，符合验收要求',
        time: '2024-01-16 14:20',
        status: 'completed',
        operator: '张审核员',
        comments: '材料齐全，符合验收要求，同意进入验收程序。'
      },
      {
        id: 3,
        title: '会议安排',
        description: '验收会议已安排，请按时参加',
        time: '2024-01-18 09:15',
        status: 'current',
        operator: '李管理员',
        comments: '会议时间：2024-01-25 14:00，地点：会议室A-201'
      }
    ]
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    status: 'under_review',
    submitTime: '2024-01-20',
    expectedTime: '2024-04-15',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-20 15:45',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '正在审核中',
        time: '2024-01-21 08:00',
        status: 'current'
      }
    ],
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-20 15:45',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料正在审核中，请耐心等待',
        time: '2024-01-21 08:00',
        status: 'current',
        operator: '王审核员'
      }
    ]
  },
  {
    id: 3,
    projectName: 'AI智能客服系统',
    projectCode: 'PROJ-2024-003',
    status: 'rejected',
    submitTime: '2024-01-18',
    expectedTime: '2024-03-30',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-18 11:20',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核不通过',
        time: '2024-01-19 16:30',
        status: 'failed'
      }
    ],
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-18 11:20',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核不通过，需要补充材料',
        time: '2024-01-19 16:30',
        status: 'failed',
        operator: '李审核员',
        comments: '材料不完整，缺少财务决算报告和知识产权清单，请补充后重新提交。'
      }
    ]
  }
])

/**
 * 计算属性：过滤后的进度列表
 * @returns {Array} 过滤后的进度列表
 */
const filteredProgressList = computed(() => {
  let result = progressList.value
  
  if (queryForm.value.projectName) {
    result = result.filter(item => 
      item.projectName.includes(queryForm.value.projectName) ||
      item.projectCode.includes(queryForm.value.projectName)
    )
  }
  
  if (queryForm.value.status) {
    result = result.filter(item => item.status === queryForm.value.status)
  }
  
  if (queryForm.value.dateRange && queryForm.value.dateRange.length === 2) {
    // 日期过滤逻辑...
  }
  
  return result
})

/**
 * 获取状态对应的颜色
 * @param {string} status 状态标识
 * @returns {string} 颜色代码
 */
const getStatusColor = (status) => {
  const colorMap = {
    submitted: 'blue',
    under_review: 'orange',
    approved: 'cyan',
    rejected: 'red',
    meeting_scheduled: 'geekblue',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态对应的文本
 * @param {string} status 状态标识
 * @returns {string} 状态文本
 */
const getStatusText = (status) => {
  const textMap = {
    submitted: '已提交',
    under_review: '审核中',
    approved: '审核通过',
    rejected: '审核驳回',
    meeting_scheduled: '会议已安排',
    completed: '验收完成'
  }
  return textMap[status] || '未知'
}

/**
 * 获取进度百分比
 * @param {string} status 状态标识
 * @returns {number} 进度百分比
 */
const getProgressPercent = (status) => {
  const percentMap = {
    submitted: 20,
    under_review: 40,
    approved: 60,
    rejected: 30,
    meeting_scheduled: 80,
    completed: 100
  }
  return percentMap[status] || 0
}

/**
 * 获取进度状态
 * @param {string} status 状态标识
 * @returns {string} 进度状态
 */
const getProgressStatus = (status) => {
  if (status === 'rejected') return 'exception'
  if (status === 'completed') return 'success'
  return 'active'
}

/**
 * 获取进度颜色
 * @param {string} status 状态标识
 * @returns {string} 颜色代码
 */
const getProgressColor = (status) => {
  const colorMap = {
    submitted: '#1890ff',
    under_review: '#fa8c16',
    approved: '#13c2c2',
    rejected: '#ff4d4f',
    meeting_scheduled: '#2f54eb',
    completed: '#52c41a'
  }
  return colorMap[status] || '#1890ff'
}

/**
 * 获取进度文本
 * @param {string} status 状态标识
 * @returns {string} 进度文本
 */
const getProgressText = (status) => {
  const textMap = {
    submitted: '申请已提交，等待管理员审核',
    under_review: '材料正在审核中',
    approved: '材料审核通过，等待安排验收会议',
    rejected: '材料审核未通过，需要重新提交',
    meeting_scheduled: '验收会议已安排，请按时参加',
    completed: '验收流程已完成'
  }
  return textMap[status] || '未知状态'
}

/**
 * 获取时间线颜色
 * @param {string} status 状态标识
 * @returns {string} 颜色代码
 */
const getTimelineColor = (status) => {
  const colorMap = {
    done: 'green',
    doing: 'blue',
    pending: 'gray',
    error: 'red'
  }
  return colorMap[status] || 'blue'
}

/**
 * 获取时间线图标
 * @param {string} status 状态标识
 * @returns {Component} 图标组件
 */
const getTimelineIcon = (status) => {
  const iconMap = {
    done: CheckOutlined,
    doing: ClockCircleOutlined,
    pending: ClockCircleOutlined,
    error: CloseOutlined,
    warning: WarningOutlined
  }
  return iconMap[status] || ClockCircleOutlined
}

/**
 * 查询处理
 */
const handleQuery = () => {
  // 查询逻辑已在计算属性中处理
}

/**
 * 重置查询条件
 */
const handleReset = () => {
  queryForm.value = {
    projectName: '',
    status: undefined,
    dateRange: []
  }
}

/**
 * 刷新数据
 */
const refreshData = () => {
  // 实际应用中，这里应该调用API重新获取数据
}

/**
 * 显示进度详情
 * @param {Object} item 进度项
 */
const showProgressDetail = (item) => {
  currentItem.value = item
  detailVisible.value = true
}

/**
 * 查看详情
 * @param {Object} item 进度项
 */
const viewDetail = (item) => {
  currentItem.value = item
  detailVisible.value = true
}

/**
 * 重新提交
 * @param {Object} item 进度项
 */
const resubmit = (item) => {
  router.push({
    path: '/acceptance/applicant/submit',
    query: { 
      resubmit: 'true',
      id: item.id
    }
  })
}

/**
 * 查看会议信息
 * @param {Object} item 进度项
 */
const viewMeetingInfo = (item) => {
  currentItem.value = item
  meetingVisible.value = true
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
/* 遵循《页面统一风格设计规范.md》中的样式规范 */

.progress-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 0;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 查询卡片样式 */
.query-card {
  margin-bottom: 16px;
}

/* 统计卡片区域样式 */
.stats-overview {
  margin-bottom: 16px;
}

/* 进度项样式 */
.progress-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.submit-time {
  font-size: 12px;
  color: #8c8c8c;
}

.item-progress {
  margin-bottom: 16px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 时间线样式 */
.item-timeline {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
}

.timeline-desc {
  font-size: 12px;
  color: #595959;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 操作区域样式 */
.item-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-info {
    align-items: flex-start;
  }
}
</style>