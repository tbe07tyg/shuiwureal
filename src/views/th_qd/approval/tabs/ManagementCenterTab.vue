<!--
 * @file 管理中心标签页组件
 * @description 适配嵌入到标签页中的管理中心功能
-->
<template>
  <div class="tab-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">
        <h3>立项申请审核</h3>
        <a-badge :count="pagination.total" :number-style="{ backgroundColor: '#1890ff' }">
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
            <a-select-option value="pending_review">待审核</a-select-option>
            <a-select-option value="under_review">审核中</a-select-option>
            <a-select-option value="passed">审核通过</a-select-option>
            <a-select-option value="rejected">审核不通过</a-select-option>
          </a-select>
          <a-select
            v-model:value="selectedDepartment"
            placeholder="全部单位"
            style="width: 150px"
            @change="handleDepartmentFilter"
          >
            <a-select-option value="">全部单位</a-select-option>
            <a-select-option value="技术部">技术部</a-select-option>
            <a-select-option value="工程部">工程部</a-select-option>
            <a-select-option value="研发部">研发部</a-select-option>
            <a-select-option value="设计部">设计部</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索项目名称或申请人"
            style="width: 250px"
            @search="handleSearch"
            allow-clear
          />
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
                v-if="record.status === 'pending_review'"
                type="link"
                size="small"
                @click="handleReview(record)"
              >
                审核
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
                    <a-menu-item key="meeting" v-if="record.status === 'passed'">
                      安排会议
                    </a-menu-item>
                    <a-menu-item key="feedback" v-if="record.status === 'rejected'">
                      反馈意见
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

    <!-- 批量操作 -->
    <div class="batch-operations" v-if="selectedRowKeys.length > 0">
      <a-space>
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <a-button @click="handleBatchApprove" type="primary">
          批量通过
        </a-button>
        <a-button @click="handleBatchReject" danger>
          批量拒绝
        </a-button>
        <a-button @click="clearSelection">
          取消选择
        </a-button>
      </a-space>
    </div>

    <!-- 审核模态框 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="审核立项申请"
      @ok="handleReviewSubmit"
      @cancel="handleReviewCancel"
      :ok-button-props="{ loading: reviewLoading }"
      width="600px"
    >
      <a-form
        ref="reviewFormRef"
        :model="reviewForm"
        layout="vertical"
      >
        <a-form-item label="审核结果" name="result" :rules="[{ required: true, message: '请选择审核结果' }]">
          <a-radio-group v-model:value="reviewForm.result">
            <a-radio value="passed">通过</a-radio>
            <a-radio value="rejected">不通过</a-radio>
            <a-radio value="conditional">有条件通过</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item 
          label="审核意见" 
          name="comments"
          :rules="[{ required: true, message: '请填写审核意见' }]"
        >
          <a-textarea
            v-model:value="reviewForm.comments"
            placeholder="请填写详细的审核意见"
            :rows="4"
            show-count
            :maxlength="500"
          />
        </a-form-item>

        <a-form-item 
          v-if="reviewForm.result === 'conditional'"
          label="改进要求"
          name="requirements"
        >
          <a-textarea
            v-model:value="reviewForm.requirements"
            placeholder="请说明具体的改进要求"
            :rows="3"
            show-count
            :maxlength="300"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  InfoCircleOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const selectedStatus = ref('')
const selectedDepartment = ref('')
const searchKeyword = ref('')
const selectedRowKeys = ref([])

// 审核相关
const reviewModalVisible = ref(false)
const reviewLoading = ref(false)
const reviewFormRef = ref()
const currentReviewRecord = ref(null)

const reviewForm = ref({
  result: '',
  comments: '',
  requirements: ''
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
    status: 'pending_review',
    priority: 'high'
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
    status: 'under_review',
    priority: 'medium'
  },
  {
    id: 3,
    year: '2024',
    projectName: '物联网环境监测系统',
    applicant: '李明',
    department: '研发部',
    duration: 24,
    budget: 180,
    submitTime: '2024-01-12',
    status: 'passed',
    priority: 'high'
  },
  {
    id: 4,
    year: '2024',
    projectName: '电子商务数据分析系统',
    applicant: '王强',
    department: '技术部',
    duration: 15,
    budget: 220,
    submitTime: '2024-01-08',
    status: 'rejected',
    priority: 'low'
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
  { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: 120 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 100 },
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

  // 单位过滤
  if (selectedDepartment.value) {
    result = result.filter(app => app.department === selectedDepartment.value)
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

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    pending_review: 'orange',
    under_review: 'processing',
    passed: 'success',
    rejected: 'error'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending_review: '待审核',
    under_review: '审核中',
    passed: '审核通过',
    rejected: '审核不通过'
  }
  return textMap[status] || '未知状态'
}

const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colorMap[priority] || 'default'
}

const getPriorityText = (priority) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '普通'
}

// 事件处理
const handleStatusFilter = () => {
  // 状态过滤已通过计算属性实现
}

const handleDepartmentFilter = () => {
  // 单位过滤已通过计算属性实现
}

const handleSearch = () => {
  // 搜索已通过计算属性实现
}

const handleTableChange = (pag) => {
  pagination.value = { ...pagination.value, ...pag }
}

const handleView = (record) => {
  console.log('查看详情:', record)
}

const handleReview = (record) => {
  currentReviewRecord.value = record
  reviewForm.value = {
    result: '',
    comments: '',
    requirements: ''
  }
  reviewModalVisible.value = true
}

const handleReviewSubmit = async () => {
  try {
    await reviewFormRef.value.validate()
    reviewLoading.value = true
    
    // 这里调用审核API
    setTimeout(() => {
      message.success('审核完成')
      reviewModalVisible.value = false
      reviewLoading.value = false
      
      // 更新记录状态
      const record = currentReviewRecord.value
      record.status = reviewForm.value.result === 'passed' ? 'passed' : 'rejected'
    }, 1000)
    
  } catch (error) {
    message.error('请完善审核信息')
  }
}

const handleReviewCancel = () => {
  reviewModalVisible.value = false
  reviewForm.value = {
    result: '',
    comments: '',
    requirements: ''
  }
}

const handleMoreAction = (action, record) => {
  console.log('更多操作:', action, record)
}

const handleBatchApprove = () => {
  message.success(`批量通过 ${selectedRowKeys.value.length} 项申请`)
  clearSelection()
}

const handleBatchReject = () => {
  message.error(`批量拒绝 ${selectedRowKeys.value.length} 项申请`)
  clearSelection()
}

const clearSelection = () => {
  selectedRowKeys.value = []
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.tab-management-container {
  padding: 24px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
}

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

/* 批量操作样式 */
.batch-operations {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-management-container {
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
}

/* 确保表格占满宽度 */
.application-list :deep(.ant-table-wrapper) {
  width: 100%;
}

.application-list :deep(.ant-table) {
  width: 100%;
}

/* 审核模态框样式 */
.review-modal :deep(.ant-modal-body) {
  max-height: 60vh;
  overflow-y: auto;
}

.review-form {
  padding: 16px 0;
}

.review-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.review-form :deep(.ant-input),
.review-form :deep(.ant-select),
.review-form :deep(.ant-input-number) {
  width: 100%;
}
</style>