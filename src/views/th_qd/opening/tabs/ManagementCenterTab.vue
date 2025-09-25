<!--
 * @file 管理中心标签页组件
 * @description 适配嵌入到标签页中的管理中心功能
-->
<template>
  <div class="tab-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">
        <h3>开题申请审核</h3>
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
            <a-select-option value="计算机学院">计算机学院</a-select-option>
            <a-select-option value="电子工程学院">电子工程学院</a-select-option>
            <a-select-option value="经济管理学院">经济管理学院</a-select-option>
            <a-select-option value="机械工程学院">机械工程学院</a-select-option>
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

    <!-- 审核模态框 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="开题申请审核"
      width="600px"
      @ok="handleReviewSubmit"
      @cancel="handleReviewCancel"
      class="review-modal"
    >
      <a-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        layout="vertical"
        class="review-form"
      >
        <a-form-item label="审核结果" name="result">
          <a-radio-group v-model:value="reviewForm.result">
            <a-radio value="passed">通过</a-radio>
            <a-radio value="rejected">不通过</a-radio>
            <a-radio value="need_improvement">需要修改</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核意见" name="comment">
          <a-textarea
            v-model:value="reviewForm.comment"
            placeholder="请输入审核意见"
            :rows="4"
            show-count
            :maxlength="500"
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
const applications = ref([])

// 审核模态框
const reviewModalVisible = ref(false)
const reviewFormRef = ref()
const currentRecord = ref(null)
const reviewForm = ref({
  result: 'passed',
  comment: ''
})

// 审核表单验证规则
const reviewRules = {
  result: [
    { required: true, message: '请选择审核结果' }
  ],
  comment: [
    { required: true, message: '请输入审核意见' },
    { min: 10, max: 500, message: '审核意见长度在10-500个字符之间' }
  ]
}

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

  // 单位筛选
  if (selectedDepartment.value) {
    result = result.filter(item => item.department === selectedDepartment.value)
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
const handleStatusFilter = (value) => {
  selectedStatus.value = value
}

const handleDepartmentFilter = (value) => {
  selectedDepartment.value = value
}

const handleSearch = (value) => {
  searchKeyword.value = value
}

const handleView = (record) => {
  message.info(`查看详情: ${record.projectName}`)
}

const handleReview = (record) => {
  currentRecord.value = record
  reviewModalVisible.value = true
  reviewForm.value = {
    result: 'passed',
    comment: ''
  }
}

const handleReviewSubmit = async () => {
  try {
    await reviewFormRef.value.validate()
    
    // 这里可以调用API提交审核结果
    message.success(`审核完成: ${currentRecord.value.projectName}`)
    
    reviewModalVisible.value = false
    initData() // 刷新数据
  } catch (error) {
    message.error('请完善审核信息')
  }
}

const handleReviewCancel = () => {
  reviewModalVisible.value = false
  currentRecord.value = null
}

const handleMoreAction = (key, record) => {
  const actions = {
    materials: '查看材料',
    history: '审核历史',
    meeting: '安排会议',
    feedback: '反馈意见'
  }
  message.info(`${actions[key]}: ${record.projectName}`)
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

const getStatusColor = (status) => {
  const colors = {
    pending_review: 'processing',
    under_review: 'warning',
    passed: 'success',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending_review: '待审核',
    under_review: '审核中',
    passed: '审核通过',
    rejected: '审核不通过'
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
        status: 'pending_review',
        priority: 'high'
      },
      {
        id: 2,
        projectName: '智能家居控制系统设计与实现',
        applicant: '李四',
        department: '电子工程学院',
        applyTime: '2024-01-16',
        status: 'under_review',
        priority: 'medium'
      },
      {
        id: 3,
        projectName: '区块链技术在供应链管理中的应用',
        applicant: '王五',
        department: '经济管理学院',
        applyTime: '2024-01-17',
        status: 'passed',
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