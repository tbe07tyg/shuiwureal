<!--
 * @file 申请管理标签页组件
 * @description 适配嵌入到标签页中的申请管理功能
-->
<template>
  <div class="tab-manage-container">
    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-flex-container">
        <div class="stat-card pending" @click="handleStatCardClick('material_reviewing')">
          <div class="stat-icon">
            <FileTextOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.materialReviewing }}</div>
            <div class="stat-label">材料审核中</div>
          </div>
        </div>
        <div class="stat-card material-rejected" @click="handleStatCardClick('material_rejected')">
          <div class="stat-icon">
            <ExclamationCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.materialRejected }}</div>
            <div class="stat-label">材料审核未通过</div>
          </div>
        </div>
        <div class="stat-card reviewing" @click="handleStatCardClick('meeting_preparing')">
          <div class="stat-icon">
            <CalendarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.meetingPreparing }}</div>
            <div class="stat-label">会议准备组织</div>
          </div>
        </div>
        <div class="stat-card meeting-review" @click="handleStatCardClick('meeting_reviewing')">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.meetingReviewing }}</div>
            <div class="stat-label">会议已安排</div>
          </div>
        </div>
        <div class="stat-card approved" @click="handleStatCardClick('approved')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approved }}</div>
            <div class="stat-label">开题通过</div>
          </div>
        </div>
        <div class="stat-card need-improvement" @click="handleStatCardClick('need_improvement')">
          <div class="stat-icon">
            <EditOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.needImprovement }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('rejected')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.rejected }}</div>
            <div class="stat-label">开题未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">
        <h3>我的开题申请</h3>
        <a-badge :count="pagination.total" :number-style="{ backgroundColor: '#52c41a' }">
          <InfoCircleOutlined style="color: #1890ff;" />
        </a-badge>
      </div>
      <div class="toolbar-actions">
        <a-space>
          <a-select
            v-model:value="selectedStatus"
            placeholder="全部状态"
            style="width: 150px"
            @change="handleStatusFilter"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="material_reviewing">材料审核中</a-select-option>
            <a-select-option value="material_rejected">材料审核未通过</a-select-option>
            <a-select-option value="meeting_preparing">会议准备组织</a-select-option>
            <a-select-option value="meeting_reviewing">会议已安排</a-select-option>
            <a-select-option value="approved">开题通过</a-select-option>
            <a-select-option value="need_improvement">有条件通过</a-select-option>
            <a-select-option value="rejected">开题未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索项目名称或申请人"
            style="width: 250px"
            @search="handleSearch"
            allow-clear
          />
          <a-button type="primary" @click="handleCreateApplication">
            <PlusOutlined />
            提交开题申请
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="application-list">
      <a-table
        :columns="columns"
        :data-source="filteredApplications"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                查看详情
              </a-button>
              <a-button
                v-if="record.status === 'draft'"
                type="link"
                size="small"
                @click="handleEdit(record)"
              >
                编辑
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleMoreAction(key, record)">
                    <a-menu-item key="materials">
                      查看材料
                    </a-menu-item>
                    <a-menu-item key="history">
                      审核历史
                    </a-menu-item>
                    <a-menu-item key="copy">
                      复制申请
                    </a-menu-item>
                    <a-menu-item key="delete" v-if="record.status === 'draft'">
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多
                  <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const selectedStatus = ref('')
const searchKeyword = ref('')
const applications = ref([])

// 统计数据
const stats = ref({
  materialReviewing: 5,
  materialRejected: 2,
  meetingPreparing: 3,
  meetingReviewing: 4,
  approved: 12,
  needImprovement: 3,
  rejected: 1
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

// 表格列配置
const columns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 200,
    ellipsis: true
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
    width: 100
  },
  {
    title: '申请单位',
    dataIndex: 'department',
    key: 'department',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性
const filteredApplications = computed(() => {
  let result = applications.value

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter(item => item.status === selectedStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.projectName.toLowerCase().includes(keyword) ||
      item.applicant.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 监听筛选结果变化，更新分页信息
watch(filteredApplications, (newFilteredApplications) => {
  pagination.value.total = newFilteredApplications.length
}, { immediate: true })

// 方法
const handleStatCardClick = (status) => {
  selectedStatus.value = status
  message.info(`筛选状态: ${getStatusText(status)}`)
}

const handleStatusFilter = (value) => {
  selectedStatus.value = value
}

const handleSearch = (value) => {
  searchKeyword.value = value
}

const handleCreateApplication = () => {
  message.info('跳转到提交开题申请页面')
}

const handleView = (record) => {
  message.info(`查看申请: ${record.projectName}`)
}

const handleEdit = (record) => {
  message.info(`编辑申请: ${record.projectName}`)
}

const handleMoreAction = (key, record) => {
  const actions = {
    materials: '查看材料',
    history: '审核历史',
    copy: '复制申请',
    delete: '删除申请'
  }
  message.info(`${actions[key]}: ${record.projectName}`)
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'default',
    material_reviewing: 'processing',
    material_rejected: 'error',
    meeting_preparing: 'warning',
    meeting_reviewing: 'processing',
    approved: 'success',
    need_improvement: 'warning',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    material_reviewing: '材料审核中',
    material_rejected: '材料审核未通过',
    meeting_preparing: '会议准备组织',
    meeting_reviewing: '会议已安排',
    approved: '开题通过',
    need_improvement: '有条件通过',
    rejected: '开题未通过'
  }
  return texts[status] || '未知状态'
}

const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || '未知'
}

// 初始化数据
const initData = () => {
  loading.value = true
  
  // 模拟数据
  setTimeout(() => {
    applications.value = [
      {
        id: 1,
        projectName: '基于深度学习的图像识别系统研究',
        applicant: '张三',
        department: '计算机学院',
        applyTime: '2024-01-15',
        status: 'approved',
        priority: 'high'
      },
      {
        id: 2,
        projectName: '智能家居控制系统设计与实现',
        applicant: '李四',
        department: '电子工程学院',
        applyTime: '2024-01-16',
        status: 'material_reviewing',
        priority: 'medium'
      },
      {
        id: 3,
        projectName: '区块链技术在供应链管理中的应用',
        applicant: '王五',
        department: '经济管理学院',
        applyTime: '2024-01-17',
        status: 'meeting_preparing',
        priority: 'high'
      }
    ]
    
    loading.value = false
  }, 1000)
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.tab-manage-container {
  padding: 24px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
}

/* 统计概览样式 */
.stats-overview {
  margin-bottom: 24px;
  width: 100%;
}

.stats-flex-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  border: 2px solid transparent;
  flex: 1;
  min-width: 200px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1;
}

/* 状态特定样式 */
.stat-card.pending .stat-icon { background: #e6f7ff; color: #1890ff; }
.stat-card.pending .stat-number { color: #1890ff; }

.stat-card.material-rejected .stat-icon { background: #fff2e8; color: #fa541c; }
.stat-card.material-rejected .stat-number { color: #fa541c; }

.stat-card.reviewing .stat-icon { background: #fff7e6; color: #fa8c16; }
.stat-card.reviewing .stat-number { color: #fa8c16; }

.stat-card.meeting-review .stat-icon { background: #e6fffb; color: #13c2c2; }
.stat-card.meeting-review .stat-number { color: #13c2c2; }

.stat-card.approved .stat-icon { background: #f6ffed; color: #52c41a; }
.stat-card.approved .stat-number { color: #52c41a; }

.stat-card.need-improvement .stat-icon { background: #fff0f6; color: #eb2f96; }
.stat-card.need-improvement .stat-number { color: #eb2f96; }

.stat-card.rejected .stat-icon { background: #fff1f0; color: #ff4d4f; }
.stat-card.rejected .stat-number { color: #ff4d4f; }

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* 申请列表样式 */
.application-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-flex-container {
    justify-content: center;
  }
  
  .stat-card {
    min-width: 120px;
    flex: 1 1 calc(50% - 8px);
  }
}

@media (max-width: 768px) {
  .tab-manage-container {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toolbar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-flex-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    flex: 1 1 100%;
  }
}

/* 确保表格占满宽度 */
.application-list :deep(.ant-table-wrapper) {
  width: 100%;
}

.application-list :deep(.ant-table) {
  width: 100%;
}
</style> 