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
            <div class="stat-label">立项通过</div>
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
            <div class="stat-label">立项未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">
        <h3>我的立项申请</h3>
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
            <a-select-option value="approved">立项通过</a-select-option>
            <a-select-option value="need_improvement">有条件通过</a-select-option>
            <a-select-option value="rejected">立项未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索项目名称"
            style="width: 250px"
            @search="handleSearch"
            allow-clear
          />
          <a-button type="primary" @click="handleSubmitNew">
            <PlusOutlined />
            提交立项申请
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
                    <a-menu-item key="resubmit" v-if="['material_rejected', 'rejected'].includes(record.status)">
                      重新提交
                    </a-menu-item>
                    <a-menu-item key="improve" v-if="record.status === 'need_improvement'">
                      提交整改材料
                    </a-menu-item>
                    <a-menu-item key="progress">
                      查看进度
                    </a-menu-item>
                    <a-menu-item key="materials">
                      查看材料
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
import { useRouter } from 'vue-router'
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

const router = useRouter()

// 响应式数据
const loading = ref(false)
const selectedStatus = ref('')
const searchKeyword = ref('')

// 统计数据
const stats = ref({
  materialReviewing: 1,
  materialRejected: 0,
  meetingPreparing: 1,
  meetingReviewing: 1,
  approved: 1,
  needImprovement: 1,
  rejected: 1
})

// 申请数据
const applications = ref([
  {
    id: 1,
    year: '2024',
    projectName: '智慧城市大数据平台建设项目',
    applicant: '王五',
    department: '技术部',
    duration: 18,
    budget: 200,
    submitTime: '2024-01-15',
    status: 'material_reviewing'
  },
  {
    id: 2,
    year: '2024',
    projectName: '区块链供应链金融平台',
    applicant: '赵六',
    department: '工程部',
    duration: 12,
    budget: 150,
    submitTime: '2024-01-20',
    status: 'meeting_preparing'
  },
  {
    id: 3,
    year: '2024',
    projectName: '物联网环境监测系统',
    applicant: '李明',
    department: '自动化部',
    duration: 24,
    budget: 180,
    submitTime: '2024-01-12',
    status: 'meeting_reviewing'
  },
  {
    id: 4,
    year: '2024',
    projectName: '电子商务数据分析系统',
    applicant: '王强',
    department: '信息部',
    duration: 15,
    budget: 220,
    submitTime: '2024-01-08',
    status: 'approved'
  },
  {
    id: 5,
    year: '2024',
    projectName: '在线教育管理平台',
    applicant: '张华',
    department: '教育部',
    duration: 20,
    budget: 160,
    submitTime: '2024-01-03',
    status: 'need_improvement'
  },
  {
    id: 6,
    year: '2024',
    projectName: '移动办公应用系统',
    applicant: '刘涛',
    department: '移动部',
    duration: 14,
    budget: 130,
    submitTime: '2024-01-05',
    status: 'rejected'
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// 表格列配置
const columns = [
  { title: '年度', dataIndex: 'year', key: 'year', width: 80 },
  { title: '立项名称', dataIndex: 'projectName', key: 'projectName', width: 200 },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 100 },
  { title: '申请单位', dataIndex: 'department', key: 'department', width: 120 },
  { title: '项目周期(月)', dataIndex: 'duration', key: 'duration', width: 120 },
  { title: '预算(万元)', dataIndex: 'budget', key: 'budget', width: 120 },
  { title: '申请时间', dataIndex: 'submitTime', key: 'submitTime', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

// 过滤后的申请数据
const filteredApplications = computed(() => {
  let result = applications.value

  // 状态过滤
  if (selectedStatus.value) {
    result = result.filter(app => app.status === selectedStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(app =>
      app.projectName.toLowerCase().includes(keyword) ||
      app.applicant.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 监听过滤结果并更新分页总数
watch(filteredApplications, (newList) => {
  pagination.value.total = newList.length
}, { immediate: true })

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'default',
    material_reviewing: 'processing',
    material_rejected: 'error',
    meeting_preparing: 'warning',
    meeting_reviewing: 'cyan',
    approved: 'success',
    need_improvement: 'orange',
    rejected: 'red'
  }
  return colorMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    material_reviewing: '材料审核中',
    material_rejected: '材料审核未通过',
    meeting_preparing: '会议准备组织',
    meeting_reviewing: '会议已安排',
    approved: '立项通过',
    need_improvement: '有条件通过',
    rejected: '立项未通过'
  }
  return textMap[status] || '未知状态'
}

// 事件处理
const handleStatCardClick = (status) => {
  selectedStatus.value = status
}

const handleStatusFilter = () => {
  // 状态过滤已通过计算属性实现
}

const handleSearch = () => {
  // 搜索已通过计算属性实现
}

const handleSubmitNew = () => {
  // 由父组件处理，切换到提交标签页
  window.parent.postMessage({ type: 'switchTab', tab: 'submit' }, '*')
}

const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

const handleView = (record) => {
  // 查看详情逻辑
  console.log('查看详情:', record)
}

const handleEdit = (record) => {
  // 编辑逻辑
  console.log('编辑:', record)
}

const handleMoreAction = (action, record) => {
  console.log('更多操作:', action, record)
}

onMounted(() => {
  // 初始化数据
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