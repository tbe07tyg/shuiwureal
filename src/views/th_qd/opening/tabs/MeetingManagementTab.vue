<!--
 * @file 会议管理标签页组件
 * @description 适配嵌入到标签页中的会议管理功能
-->
<template>
  <div class="tab-meeting-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">会议结论管理</h1>
          <p class="page-description">查看和管理开题会议的结论信息</p>
        </div>
        <div class="header-right">
          <a-button type="primary" @click="handleRefresh">
            <ReloadOutlined />
            刷新数据
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-label">待安排会议</div>
          </div>
        </div>
        <div class="stat-card scheduled">
          <div class="stat-icon">
            <CalendarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.scheduled }}</div>
            <div class="stat-label">已安排会议</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.completed }}</div>
            <div class="stat-label">已完成开题</div>
          </div>
        </div>
        <div class="stat-card conclusion">
          <div class="stat-icon">
            <FileTextOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.conclusion }}</div>
            <div class="stat-label">待录入结论</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和过滤 -->
    <div class="search-filter">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="会议状态:">
          <a-select
            v-model:value="searchForm.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending">待安排</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="conclusion">待录入结论</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议时间:">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="项目名称:">
          <a-input
            v-model:value="searchForm.projectName"
            placeholder="搜索项目名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-navigation">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="arrangement" tab="会议安排">
          <div class="tab-content">
            <div class="project-cards">
              <div 
                v-for="project in filteredProjects" 
                :key="project.id"
                class="project-card"
              >
                <div class="project-header">
                  <h3 class="project-title">{{ project.name }}</h3>
                  <a-tag :color="getProjectStatusColor(project.status)">
                    {{ getProjectStatusText(project.status) }}
                  </a-tag>
                </div>
                <div class="project-info">
                  <div class="info-row">
                    <span class="info-label">项目编号:</span>
                    <span class="info-value">{{ project.code }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">材料审核:</span>
                    <span class="info-value">{{ project.materialReview }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">申请时间:</span>
                    <span class="info-value">{{ project.applyTime }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">项目负责人:</span>
                    <span class="info-value">{{ project.leader }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">材料审核情况:</span>
                    <span class="info-value">{{ project.materialStatus }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">项目周期:</span>
                    <span class="info-value">{{ project.duration }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">项目预算:</span>
                    <span class="info-value">{{ project.budget }}</span>
                  </div>
                </div>
                <div class="project-actions">
                  <a-button type="primary" @click="handleScheduleMeeting(project)">
                    <CalendarOutlined />
                    安排会议
                  </a-button>
                  <a-button @click="handleViewDetails(project)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="scheduled" tab="已安排会议">
          <div class="tab-content">
            <div class="meeting-list">
              <a-table
                :columns="meetingColumns"
                :data-source="scheduledMeetings"
                :pagination="pagination"
                row-key="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getMeetingStatusColor(record.status)">
                      {{ getMeetingStatusText(record.status) }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'actions'">
                    <a-space>
                      <a-button type="link" size="small" @click="handleViewMeeting(record)">
                        查看详情
                      </a-button>
                      <a-button type="link" size="small" @click="handleEditMeeting(record)">
                        编辑
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="conclusion" tab="结论管理">
          <div class="tab-content">
            <div class="conclusion-list">
              <a-table
                :columns="conclusionColumns"
                :data-source="conclusions"
                :pagination="pagination"
                row-key="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getConclusionStatusColor(record.status)">
                      {{ getConclusionStatusText(record.status) }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'actions'">
                    <a-space>
                      <a-button type="link" size="small" @click="handleViewConclusion(record)">
                        查看结论
                      </a-button>
                      <a-button type="link" size="small" @click="handleEditConclusion(record)">
                        编辑
                      </a-button>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const activeTab = ref('arrangement')
const searchForm = ref({
  status: '',
  dateRange: [],
  projectName: ''
})

// 统计数据
const stats = ref({
  pending: 5,
  scheduled: 8,
  completed: 12,
  conclusion: 3
})

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
})

// 项目数据
const projects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    materialReview: '已通过',
    applyTime: '2024-01-15',
    leader: '张三',
    materialStatus: '必需材料:4/4已通过, 可选材料:2已提交',
    duration: '12个月',
    budget: '500万元',
    status: 'pending'
  },
  {
    id: 2,
    name: '区块链技术在供应链管理中的应用',
    code: 'PROJ-2024-002',
    materialReview: '已通过',
    applyTime: '2024-01-16',
    leader: '李四',
    materialStatus: '必需材料:4/4已通过, 可选材料:1已提交',
    duration: '18个月',
    budget: '800万元',
    status: 'pending'
  }
])

// 会议数据
const scheduledMeetings = ref([
  {
    id: 1,
    title: '计算机学院开题答辩会议',
    date: '2024-01-20',
    time: '14:00-16:00',
    location: '会议室A',
    status: 'scheduled',
    participants: 8
  }
])

// 结论数据
const conclusions = ref([
  {
    id: 1,
    projectName: '深度学习图像识别系统',
    meetingDate: '2024-01-18',
    status: 'pending',
    conclusion: ''
  }
])

// 会议表格列配置
const meetingColumns = [
  {
    title: '会议名称',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '会议时间',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: '地点',
    dataIndex: 'location',
    key: 'location'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 结论表格列配置
const conclusionColumns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName'
  },
  {
    title: '会议时间',
    dataIndex: 'meetingDate',
    key: 'meetingDate'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value

  if (searchForm.value.projectName) {
    const keyword = searchForm.value.projectName.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 方法
const handleRefresh = () => {
  message.success('数据已刷新')
}

const handleSearch = () => {
  message.info('执行搜索')
}

const handleReset = () => {
  searchForm.value = {
    status: '',
    dateRange: [],
    projectName: ''
  }
  message.info('已重置搜索条件')
}

const handleTabChange = (key) => {
  activeTab.value = key
}

const handleScheduleMeeting = (project) => {
  message.info(`为项目"${project.name}"安排会议`)
}

const handleViewDetails = (project) => {
  message.info(`查看项目"${project.name}"详情`)
}

const handleViewMeeting = (meeting) => {
  message.info(`查看会议"${meeting.title}"详情`)
}

const handleEditMeeting = (meeting) => {
  message.info(`编辑会议"${meeting.title}"`)
}

const handleViewConclusion = (conclusion) => {
  message.info(`查看项目"${conclusion.projectName}"结论`)
}

const handleEditConclusion = (conclusion) => {
  message.info(`编辑项目"${conclusion.projectName}"结论`)
}

const getProjectStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    scheduled: 'blue',
    completed: 'green',
    conclusion: 'purple'
  }
  return colors[status] || 'default'
}

const getProjectStatusText = (status) => {
  const texts = {
    pending: '待安排会议',
    scheduled: '已安排会议',
    completed: '已完成开题',
    conclusion: '待录入结论'
  }
  return texts[status] || '未知状态'
}

const getMeetingStatusColor = (status) => {
  const colors = {
    scheduled: 'blue',
    ongoing: 'orange',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const texts = {
    scheduled: '已安排',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || '未知状态'
}

const getConclusionStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    completed: 'green'
  }
  return colors[status] || 'default'
}

const getConclusionStatusText = (status) => {
  const texts = {
    pending: '待录入',
    completed: '已录入'
  }
  return texts[status] || '未知状态'
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.tab-meeting-container {
  padding: 24px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
  background-color: #f5f5f5;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
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

.header-right {
  flex-shrink: 0;
}

/* 统计概览 */
.stats-overview {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1;
}

/* 状态特定样式 */
.stat-card.pending .stat-icon { background: #fff7e6; color: #fa8c16; }
.stat-card.pending .stat-number { color: #fa8c16; }

.stat-card.scheduled .stat-icon { background: #e6f7ff; color: #1890ff; }
.stat-card.scheduled .stat-number { color: #1890ff; }

.stat-card.completed .stat-icon { background: #f6ffed; color: #52c41a; }
.stat-card.completed .stat-number { color: #52c41a; }

.stat-card.conclusion .stat-icon { background: #f9f0ff; color: #722ed1; }
.stat-card.conclusion .stat-number { color: #722ed1; }

/* 搜索和过滤 */
.search-filter {
  background: white;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-filter :deep(.ant-form-item) {
  margin-bottom: 16px;
  margin-right: 16px;
}

.search-filter :deep(.ant-form-item-label) {
  font-weight: 500;
  color: #262626;
}

/* 标签页导航 */
.tabs-navigation {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-navigation :deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 24px;
  background: #fafafa;
}

.tabs-navigation :deep(.ant-tabs-content-holder) {
  padding: 24px;
}

.tab-content {
  min-height: 400px;
}

/* 项目卡片 */
.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

.project-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.project-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.info-label {
  color: #8c8c8c;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #262626;
  flex: 1;
}

.project-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 表格样式 */
.meeting-list,
.conclusion-list {
  width: 100%;
}

.meeting-list :deep(.ant-table-wrapper),
.conclusion-list :deep(.ant-table-wrapper) {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-meeting-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-filter {
    padding: 16px;
  }
  
  .search-filter :deep(.ant-form-item) {
    margin-right: 0;
    width: 100%;
  }
  
  .project-cards {
    grid-template-columns: 1fr;
  }
  
  .project-actions {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .project-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-label {
    width: auto;
  }
}
</style> 