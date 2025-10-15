<!--
 * @file 立项申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的立项申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化
 * 项目中调用接口直接返回res.data 因为拦截器进行直接赋值给data
 * 
-->
<template>
  <div class="applicant-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">立项申请管理</h1>
        <p class="page-description">查看和管理您提交的项目立项申请</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="goToSubmit">
          <PlusOutlined />
          提交新申请
        </a-button>
      </div>
    </div>

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
        <!-- 新增：材料审核未通过状态 -->
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
            <div class="stat-label">会议待组织</div>
          </div>
        </div>
        <div class="stat-card scheduled" @click="handleStatCardClick('meeting_scheduled')">
          <div class="stat-icon">
            <ClockCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.meetingScheduled }}</div>
            <div class="stat-label">会议已安排</div>
          </div>
        </div>
        <div class="stat-card completed" @click="handleStatCardClick('approval_passed')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approvalPassed }}</div>
            <div class="stat-label">立项通过</div>
          </div>
        </div>
        <div class="stat-card conditional" @click="handleStatCardClick('approval_conditional')">
          <div class="stat-icon">
            <BulbOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approvalConditional }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('approval_failed')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approvalFailed }}</div>
            <div class="stat-label">立项未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 立项流程说明 -->
    <a-card class="flow-description" title="立项流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交立项申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核立项材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织立项会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="立项结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">立项通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">立项未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </a-card>

    <!-- 申请列表 -->
    <a-card :bordered="false">
      <template #title>
        <div class="card-title-with-total">
          <span>我的立项申请</span>
          <a-badge :count="stats.total" :number-style="{ backgroundColor: '#1890ff' }" />
        </div>
      </template>
      <template #extra>
        <div class="header-filters">
          <a-select
            v-model:value="filters.status"
            placeholder="筛选状态"
            style="width: 150px"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="material_reviewing">材料审核中</a-select-option>
            <a-select-option value="meeting_preparing">会议待组织</a-select-option>
            <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
            <a-select-option value="approval_passed">立项通过</a-select-option>
            <a-select-option value="approval_conditional">有条件通过</a-select-option>
            <a-select-option value="approval_failed">立项未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="applications"
        :pagination="pagination"
        row-key="id"
        size="middle"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'progress'">
            <div class="progress-info">
              <a-progress 
                :percent="getProgressPercent(record.status)" 
                size="small"
                :status="getProgressStatus(record.status)"
              />
              <div class="progress-text">{{ getProgressText(record.status, record) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <!-- 当状态为在线填报中时显示编辑按钮 -->
              <a-button
                v-if="record.status === 'draft'"
                type="primary"
                size="small"
                @click="handleEditApplication(record)"
              >
                编辑申报书
              </a-button>
              <a-button
                v-if="record.status === 'draft'"
                type="primary"
                size="small"
                @click="handleEditBudget(record)"
              >
                编辑经费表
              </a-button>
               <a-button 
                v-if="record.status === 'draft'" 
                type="primary" 
                size="small" 
                @click="handleResubmitMaterial(record)"
              >
                提交材料
              </a-button>

              <!-- 当状态为审核中时显示取消申请按钮 -->
              <a-button
                v-if="record.status === 'material_reviewing'"
                type="primary"
                danger
                size="small"
                @click="handleCancelApplication(record)"
              >
                取消申请
              </a-button>
              <!-- 只有材料审核未通过状态才显示重新提交材料按钮 -->
              <a-button 
                v-if="record.status === 'material_rejected'" 
                type="primary" 
                size="small" 
                @click="handleResubmitMaterial(record)"
              >
                重新提交材料
              </a-button>
              <a-button 
                v-if="record.status === 'approval_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                <!-- 提交整改材料 -->
                提交整改材料
              </a-button>
              <a-button 
                v-if="record.status === 'approval_failed'" 
                type="primary" 
                size="small" 
                @click="handleResubmit(record)"
              >
                重新提交申请
              </a-button>

              <!-- 只有材料审核未通过状态才显示查看驳回原因按钮 -->
              <a-button 
                v-if="record.status === 'material_rejected'" 
                size="small" 
                @click="handleViewRejectionDetails(record)"
              >
                查看驳回原因
              </a-button>
              <a-button
                v-if="['approval_conditional', 'approval_failed'].includes(record.status)"
                size="small"
                @click="handleViewConclusion(record)"
              >
                查看结论
              </a-button>
              <a-button
                v-if="['approval_passed', 'approval_conditional', 'approval_failed'].includes(record.status)"
                size="small"
                @click="handleViewDetails(record)"
              >
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="立项申请详情"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >


      <div v-if="selectedApplication" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="年度">
              {{ selectedApplication.yearly }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedApplication.projectNo }}
            </a-descriptions-item>
            <a-descriptions-item label="立项名称" :span="2">
              {{ selectedApplication.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ selectedApplication.applicant }}
            </a-descriptions-item>
            <a-descriptions-item label="申请单位">
              {{ selectedApplication.applicantUnit }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期(月)">
              {{ selectedApplication.projectCycle }}个月
            </a-descriptions-item>
            <a-descriptions-item label="预算(万元)">
              {{ selectedApplication.budget }}万元
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedApplication.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedApplication.status)">
                {{ getStatusText(selectedApplication.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="项目描述" :span="2">
              {{ selectedApplication.applicationDescription }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 会议信息 -->
        <div class="detail-section" v-if="selectedApplication.meetingInfo">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ selectedApplication.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedApplication.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{ selectedApplication.meetingInfo.type === 'offline' ? '现场会议' : selectedApplication.meetingInfo.type === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedApplication.meetingInfo.description">
              {{ selectedApplication.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 立项结论 -->
        <div class="detail-section" v-if="selectedApplication.conclusion">
          <h4><AuditOutlined /> 立项结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="立项结果">
              <a-tag :color="getStatusColor(selectedApplication.status)">
                {{ getStatusText(selectedApplication.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ selectedApplication.conclusion.time }}
            </a-descriptions-item>
            <a-descriptions-item label="评分" v-if="selectedApplication.conclusion.score">
              <span :style="{ color: selectedApplication.conclusion.score >= 90 ? '#52c41a' : selectedApplication.conclusion.score >= 80 ? '#fa8c16' : '#ff4d4f' }">
                {{ selectedApplication.conclusion.score }}分
              </span>
            </a-descriptions-item>
            <!-- <a-descriptions-item label="结论说明" :span="2">
              {{ selectedApplication.conclusion.description }}
            </a-descriptions-item> -->
            <a-descriptions-item label="结论说明" :span="2" v-if="selectedApplication.conclusion.requirements">
              <div class="requirements-text">
                {{ selectedApplication.conclusion.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 驳回信息 -->
        <div class="detail-section" v-if="selectedApplication.rejectionInfo">
          <h4><ExclamationCircleOutlined /> 驳回信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="驳回时间">
              {{ selectedApplication.rejectionInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="审核人员">
              {{ selectedApplication.rejectionInfo.reviewer }}
            </a-descriptions-item>
            <a-descriptions-item label="审核意见" :span="2">
              {{ selectedApplication.rejectionInfo.comments }}
            </a-descriptions-item>
            <a-descriptions-item label="驳回原因" :span="2">
              <div class="rejection-reason">
                {{ selectedApplication.rejectionInfo.rejectionReason }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>

    <!-- 结论说明弹窗 -->
    <a-modal
      v-model:open="conclusionModalVisible"
      title="结论说明"
      width="600px"
      :footer="null"
      @cancel="handleConclusionCancel"
    >
      <div v-if="selectedApplication && selectedApplication.conclusion" style="line-height: 1.6;">
        <div style="margin-bottom: 16px;">
          <strong>立项结果：</strong>
          <a-tag :color="getStatusColor(selectedApplication.status)">
            {{ getStatusText(selectedApplication.status) }}
          </a-tag>
        </div>
        <div style="margin-bottom: 16px;">
          <strong>结论时间：</strong>{{ selectedApplication.conclusion.time }}
        </div>
        <div style="margin-bottom: 16px;" v-if="selectedApplication.conclusion.score">
          <strong>评分：</strong>
          <span :style="{ color: selectedApplication.conclusion.score >= 90 ? '#52c41a' : selectedApplication.conclusion.score >= 80 ? '#fa8c16' : '#ff4d4f' }">
            {{ selectedApplication.conclusion.score }}分
          </span>
        </div>
        <div style="margin-bottom: 16px;">
          <strong>结论说明：</strong>
          <div style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;">
            {{ selectedApplication.conclusion.description || selectedApplication.conclusion.requirements || '无' }}
          </div>
        </div>
        <div style="margin-top: 16px; padding: 12px; background: #e6f7ff; border-radius: 6px;" v-if="selectedApplication.conclusion.result === 'approval_conditional'">
          <div style="color: #1890ff; font-weight: 500;">💡 温馨提示</div>
          <div style="margin-top: 4px; color: #666;">请根据上述要求修改和补充材料后重新提交，如有疑问可联系审核人员。</div>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 24px 0;">
        <a-empty description="暂无结论信息" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 验收申请管理页面 - 申报单位角色
 * 
 * 本页面严格遵循《页面统一风格设计规范.md》中的规范要求：
 * 1. 使用PageContainer作为页面最外层容器
 * 2. 提供title和description作为PageContainer的属性
 * 3. 将主要操作按钮放在actions插槽中
 * 4. 内容区域使用统一的灰色背景
 * 5. 卡片内容区域置于灰色背景之上
 * 6. 统一使用Ant Design Vue组件和全局样式
 */
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { 
  getTechnologicalProjectPage,
  getTechnologicalMaterialReviewPage,
  deleteTechnologicalProject,
  getTechnologicalAcceptanceConclusionPage
} from '@/api/th_qd/approval'
import { ProjectStatus } from '@/api/th_qd/approval/types'
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
import {
  PlusOutlined,
  FolderOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  FileSearchOutlined,
  AuditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { quickConnectionTest } from '@/api/th_qd/approval/test-example'

const router = useRouter()

// 统计数据 - 基于申请列表动态计算
const stats = computed(() => {
  const total = applications.value.length
  const materialReviewing = applications.value.filter(app => 
    app.status === 'material_reviewing'
  ).length
  const materialRejected = applications.value.filter(app => 
    app.status === 'material_rejected'
  ).length
  const meetingPreparing = applications.value.filter(app => 
    app.status === 'meeting_preparing'
  ).length
  const meetingScheduled = applications.value.filter(app => 
    app.status === 'meeting_scheduled'
  ).length
  const approvalPassed = applications.value.filter(app => 
    app.status === 'approval_passed'
  ).length
  const approvalConditional = applications.value.filter(app => 
    app.status === 'approval_conditional'
  ).length
  const approvalFailed = applications.value.filter(app => 
    app.status === 'approval_failed'
  ).length
  
  return {
    total,
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    approvalPassed,
    approvalConditional,
    approvalFailed
  }
})

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})
const convertApiStatusToFrontend = (apiStatus) => {
  const statusMap = {
    [ProjectStatus.DRAFT]: 'draft',                              // 0 -> draft
    [ProjectStatus.MATERIAL_REVIEWING]: 'material_reviewing',    // 1 -> material_reviewing
    [ProjectStatus.MATERIAL_REJECTED]: 'material_rejected',      // 2 -> material_rejected
    [ProjectStatus.MEETING_PENDING]: 'meeting_preparing',        // 3 -> meeting_preparing
    [ProjectStatus.MEETING_SCHEDULED]: 'meeting_scheduled',      // 4 -> meeting_scheduled
    [ProjectStatus.MEETING_IN_PROGRESS]: 'meeting_scheduled',    // 5 -> meeting_scheduled (合并到已安排)
    [ProjectStatus.CONDITIONALLY_PASSED]: 'approval_conditional', // 6 -> approval_conditional
    // [ProjectStatus.RECTIFYING]: 'approval_conditional',          // 7 -> approval_conditional (合并到有条件通过)
    [ProjectStatus.RECTIFYING]: 'rectifying',          // 7 -> rectifying 整改审核中
    [ProjectStatus.PROJECT_APPROVED]: 'approval_passed',         // 8 -> approval_passed
    [ProjectStatus.PROJECT_REJECTED]: 'approval_failed'          // 9 -> approval_failed
  }
  
  return statusMap[apiStatus] || 'material_reviewing' // 默认为材料审核中
}

/**
 * 将前端状态字符串转换为后端API状态码（用于筛选等场景）
 * @param {string} frontendStatus 前端状态字符串
 * @returns {number} 后端API状态码
 */
const convertFrontendStatusToApi = (frontendStatus) => {
  const statusMap = {
    'draft': ProjectStatus.DRAFT,
    'material_reviewing': ProjectStatus.MATERIAL_REVIEWING,
    'material_rejected': ProjectStatus.MATERIAL_REJECTED,
    'meeting_preparing': ProjectStatus.MEETING_PENDING,
    'meeting_scheduled': ProjectStatus.MEETING_SCHEDULED,
    'approval_conditional': ProjectStatus.CONDITIONALLY_PASSED,
    'approval_passed': ProjectStatus.PROJECT_APPROVED,
    'approval_failed': ProjectStatus.PROJECT_REJECTED,
    'rectifying': ProjectStatus.RECTIFYING
  }
  
  return statusMap[frontendStatus] || ProjectStatus.MATERIAL_REVIEWING
}
// 流程说明显示状态
const showFlowDescription = ref(false)

// 详情弹窗状态
const detailModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const selectedApplication = ref(null)

// 申请列表数据
const applications = ref([])
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTechnologicalProjectPage1 = async () => {
  const params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    // 服务端筛选参数
    // projectName: filters.value.keyword || undefined,
    applicant: useUserStore().getUser.nickname || '系统',
    // status: filters.value.status ? convertFrontendStatusToApi(filters.value.status) : undefined
  }
  console.log(params)
  const res = await getTechnologicalProjectPage(params)

  const list = res.list || []
  const total = res.total ?? 0

  if (list.length > 0) {
    list.forEach((item) => {
      item.createTime = formatTimestamp(item.createTime)
      item.status = convertApiStatusToFrontend(item.status)
    })
  }

  applications.value = list
  pagination.value.total = total
}
// 表格列配置
const columns = [
  {
    title: '年度',
    dataIndex: 'yearly',
    width: 80
  },
  {
    title: '立项名称',
    dataIndex: 'projectName',
    width: 220,
    ellipsis: true
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    width: 100
  },
  {
    title: '申请单位',
    dataIndex: 'applicantUnit',
    width: 140,
    ellipsis: true
  },
  {
    title: '项目周期(月)',
    dataIndex: 'projectCycle',
    width: 120
  },
  {
    title: '预算(万元)',
    dataIndex: 'budget',
    width: 110
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    fixed: 'right'
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// 表格分页变化
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  getTechnologicalProjectPage1()
}

/**
 * 获取状态对应的颜色
 * @param {string} status 状态标识
 * @returns {string} 颜色代码
 */
const getStatusColor = (status) => {
  const colorMap = {
    material_reviewing: 'orange',
    meeting_preparing: 'blue',
    meeting_scheduled: 'cyan',
    approval_passed: 'green',
    approval_conditional: 'orange',
    approval_failed: 'red',
    material_rejected: 'red',
    rectifying: 'purple'
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
    draft: '申请中',
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '会议已安排',
    approval_passed: '立项通过',
    approval_conditional: '有条件通过',
    approval_failed: '立项未通过',
    material_rejected: '材料审核未通过',
    rectifying: '整改审核中'
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
    material_reviewing: 35,
    meeting_preparing: 60,
    meeting_scheduled: 80,
    approval_passed: 100,
    approval_conditional: 95,
    approval_failed: 100,
    rectifying: 70
  }
  return percentMap[status] || 0
}

/**
 * 获取进度状态
 * @param {string} status 状态标识
 * @returns {string} 进度状态
 */
const getProgressStatus = (status) => {
  if (status === 'approval_failed') return 'exception'
  if (status === 'approval_passed') return 'success'
  if (status === 'approval_conditional') return 'active'
  return 'active'
}

/**
 * 获取进度文本
 * @param {string} status 状态标识
 * @param {Object} record 记录对象
 * @returns {string} 进度文本
 */
const getProgressText = (status, record = null) => {
  // 特殊处理材料被驳回的情况
  if (status === 'material_reviewing' && record?.materialRejected) {
    return '材料需要重新提交'
  }
  
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '等待参加会议',
    approval_passed: '立项通过',
    approval_conditional: '待提交整改材料',
    approval_failed: '立项未通过',
    rectifying: '整改审核中'
  }
  return textMap[status] || '未知阶段'
}



// 事件处理方法
const goToSubmit = () => {
  router.push('/th-qd-project/approval/approval/applicant/submit')
}

/**
 * 编辑申报书
 * @param {Object} record 申请记录
 */
const handleEditApplication = (record) => {
  router.push({
    path: '/th-qd-project/approval/approval/applicant/online-form-new',
    query: {
      // tab: 'submit',
      // edit: 'true',
      projectId: record.id,
      // projectNo: record.projectNo || record.projectCode,
      // projectName: encodeURIComponent(record.projectName || ''),
      // projectCode: record.projectCode || '',
      // year: record.yearly || '2024',
      // applicant: encodeURIComponent(record.applicant || ''),
      // department: encodeURIComponent(record.applicantUnit || ''),
      // duration: record.projectCycle || '',
      // budget: record.budget || '',
      // expectedDate: record.createTime || record.expectedTime || '',
      // description: encodeURIComponent(record.applicationDescription || ''),
      // remarks: encodeURIComponent(record.remarks || ''),
      // status: record.status || ''
    }
  })
}

/**
 * 编辑经费表
 * @param {Object} record 申请记录
 */
const handleEditBudget = (record) => {
  router.push({
    path: '/th-qd-project/approval/online-budget',
    query: {
      // tab: 'budget',
      // edit: 'true',
      projectId: record.id,
      // projectNo: record.projectNo || record.projectCode,
      projectName: encodeURIComponent(record.projectName || ''),
      // projectCode: record.projectCode || '',
      // year: record.yearly || '2024',
      // applicant: encodeURIComponent(record.applicant || ''),
      // department: encodeURIComponent(record.applicantUnit || ''),
      // duration: record.projectCycle || '',
      // budget: record.budget || '',
      // expectedDate: record.createTime || record.expectedTime || '',
      // description: encodeURIComponent(record.applicationDescription || ''),
      // remarks: encodeURIComponent(record.remarks || ''),
      // status: record.status || ''
    }
  })
}

/**
 * 筛选变更处理
 */
const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 重新提交材料
 * @param {Object} record 申请记录
 */
const handleResubmit = (record) => {
  // message.info(`重新提交申请：${record.projectName}`)

  router.push({
    path: '/th-qd-project/approval/approval/applicant/submit',
    query: {
      tab:'submit',
      resubmit: 'true',
      // projectId: record.id, // 其他需要传递的参数
    }
  })

  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/th-qd-project/approval/approval/applicant/submit',
    query: {
      tab:'submit',
      resubmit: 'true',
      projectId: record.id,
      projectNo: record.projectNo || record.projectCode,
      projectName: encodeURIComponent(record.projectName || ''),
      projectCode: record.projectCode || '',
      year: record.yearly || '2024',
      applicant: encodeURIComponent(record.applicant || ''),
      department: encodeURIComponent(record.applicantUnit || ''),
      duration: record.projectCycle || '',
      budget: record.budget || '',
      expectedDate: record.createTime || record.expectedTime || '',
      description: encodeURIComponent(record.applicationDescription || ''),
      remarks: encodeURIComponent(record.remarks || ''),
      reviewComments: encodeURIComponent(reviewComments),
      status: record.status || ''
    }
  })
}

/**
 * 查看结论说明
 * @param {Object} record 申请记录
 */
const handleViewConclusion = async (record) => {
  console.log(record)
  try {
    // 调用接口获取结论信息
    const res = await getTechnologicalAcceptanceConclusionPage({ 
      projectId: record.id,
      pageNo: 1,
      pageSize: 1
    })

    // 如果获取到结论信息，将其添加到记录中
    if (res && res.list && res.list.length > 0) {
      const conclusion = res.list[0]
      // 创建或更新记录的conclusion属性
      const updatedRecord = {
        ...record,
        conclusion: {
          result: conclusion.conclusionResult === 1 ? 'passed' : conclusion.conclusionResult === 2 ? 'failed' : 'conditional',
          time: formatTimestamp(conclusion.createTime),
          score: conclusion.conclusionScore,
          description: conclusion.conclusionDescription,
          requirements: conclusion.conclusionDescription // 暂时使用相同字段，如果有专门字段可以替换
        }
      }
      selectedApplication.value = updatedRecord
    } else {
      // 如果没有获取到结论信息，使用原始记录
      selectedApplication.value = record
    }
    conclusionModalVisible.value = true
  } catch (error) {
    console.error('获取结论信息失败:', error)
    message.error('获取结论信息失败，请稍后重试')
    // 出错时仍然显示结论弹窗，但不包含结论信息
    selectedApplication.value = record
    conclusionModalVisible.value = true
  }
}

/**
 * 查看详情
 * @param {Object} record 申请记录
 */
const handleViewDetails = (record) => {
  console.log(record)
  selectedApplication.value = record
  detailModalVisible.value = true
}

/**
 * 关闭详情弹窗
 */
const handleDetailCancel = () => {
  detailModalVisible.value = false
  selectedApplication.value = null
}

/**
 * 关闭结论弹窗
 */
const handleConclusionCancel = () => {
  conclusionModalVisible.value = false
  selectedApplication.value = null
}

/**
 * 重新提交材料
 * @param {Object} record 申请记录
 */
const handleResubmitMaterial = (record) => {
  console.log('重新提交记录')
  console.log(record)
  // 携带上一轮上传的材料用于回显（如果后端有接口可拉取，可改为按 projectId 拉取）
  const materialsPayload = record.materials ? encodeURIComponent(JSON.stringify(record.materials)) : ''
  console.log(record.materials)
  router.push({
    path: '/th-qd-project/approval/approval/applicant/submit',
    query: {
      tab:'submit',
      resubmit: 'true',
      projectId: record.id,
      projectNo: record.projectNo || record.projectCode,
      projectName: encodeURIComponent(record.projectName || ''),
      projectCode: record.projectCode || '',
      year: record.yearly || '2024',
      applicant: encodeURIComponent(record.applicant || ''),
      department: encodeURIComponent(record.applicantUnit || ''),
      duration: record.projectCycle || '',
      budget: record.budget || '',
      expectedDate: record.createTime || record.expectedTime || '',
      description: encodeURIComponent(record.applicationDescription || ''),
      remark: encodeURIComponent(record.remark || ''),
      rejectionReason: encodeURIComponent(record.rejectionInfo?.rejectionReason || ''),
      materials: materialsPayload,
      status: record.status || ''
    }
  })
}

/**
 * 查看驳回原因详情
 * @param {Object} record 申请记录
 */
const handleViewRejectionDetails = async (record) => {
  const rejectionInfo = record.reviewComments
  console.log(record)
  const res = await getTechnologicalMaterialReviewPage({ pageNo: 1, pageSize: 100, projectId: record.id })
  const reviewer = res.list[0].reviewer
  if (!rejectionInfo) {
    message.warning('暂无驳回信息')
    return
  }
  
  // 创建驳回详情内容
  const content = `
    <div style="line-height: 1.6;">
      <div style="margin-bottom: 16px;">
        <strong>驳回时间：</strong>${record.createTime}
      </div>
      <div style="margin-bottom: 16px;">
        <strong>审核人员：</strong>${reviewer}
      </div>
      <div style="margin-bottom: 16px;">
        <strong>审核意见：</strong>
        <div style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;">
          ${rejectionInfo}
        </div>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #e6f7ff; border-radius: 6px;">
        <div style="color: #1890ff; font-weight: 500;">💡 温馨提示</div>
        <div style="margin-top: 4px; color: #666;">请根据上述要求修改和补充材料后重新提交，如有疑问可联系审核人员。</div>
      </div>
    </div>
  `
  
  // 显示驳回原因详情弹窗
  Modal.info({
    title: '材料审核驳回详情',
    width: 600,
    content: h('div', {
      innerHTML: content,
      style: {
        lineHeight: '1.6'
      },
    }),
    okText: '我知道了'
  })
}

const handleSubmitImprovement = (record) => {
  // message.info(`提交整改材料：${record.projectName}`)
  
  // 提取整改要求
  let improvementRequirements = ''
  // if (record.conclusion && record.conclusion.requirements) {
  //   improvementRequirements = record.conclusion.requirements
  // }
  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/th-qd-project/approval/approval/applicant/submit',
    query: {
      tab:'submit',
      improvement: 'true',
      projectId: record.id,
      projectNo: record.projectNo || record.projectCode,
      projectName: encodeURIComponent(record.projectName || ''),
      projectCode: record.projectCode || '',
      year: record.yearly || '2024',
      applicant: encodeURIComponent(record.applicant || ''),
      department: encodeURIComponent(record.applicantUnit || ''),
      duration: record.projectCycle || '',
      budget: record.budget || '',
      expectedDate: record.createTime || record.expectedTime || '',
      description: encodeURIComponent(record.applicationDescription || ''),
      remark: encodeURIComponent(record.remark || ''),
      improvementRequirements: encodeURIComponent(improvementRequirements),
      status: record.status || ''
    }
  })
}

/**
 * 取消申请
 * @param {Object} record 申请记录
 */
const handleCancelApplication = (record) => {
  Modal.confirm({
    title: '确认取消申请',
    content: `确定要取消项目"${record.projectName}"的申请吗？取消后将无法恢复。`,
    okText: '确认取消',
    okType: 'danger',
    cancelText: '再想想',
    onOk: async () => {
      try {
        // 调用删除项目接口
        await deleteTechnologicalProject(record.id)
        message.success('申请已成功取消')
        // 刷新列表
        getTechnologicalProjectPage1()
      } catch (error) {
        message.error('取消申请失败，请稍后重试')
        console.error('取消申请失败:', error)
      }
    }
  })
}



// 切换流程说明显示状态
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

// 处理统计卡片点击筛选
const handleStatCardClick = (filterType) => {
  // 清除关键词筛选
  filters.value.keyword = ''
  
  // 直接设置状态筛选
  filters.value.status = filterType
}



// 生命周期
onMounted(() => {
  // 初始化数据
  getTechnologicalProjectPage1()
})
</script>

<style scoped>
/* 遵循《页面统一风格设计规范.md》中的样式规范 */

.applicant-manage-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
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

/* 统计卡片区域样式 */
.stats-overview {
  margin: 0 16px 24px 16px;
}

/* Flex容器样式 - 让所有卡片在一排显示 */
.stats-flex-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stats-flex-container .stat-card {
  flex: 1;
  min-width: 140px;
  max-width: 200px;
}

/* 统计卡片样式 - 优化布局和视觉效果 */
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #f0f0f0;
  user-select: none;
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

/* 添加渐变装饰条 */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--accent-color);
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-card:hover .stat-number {
  color: var(--accent-color);
}

/* 统计图标样式 */
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  margin-right: 16px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 统计内容样式 */
.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  line-height: 1;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: color 0.3s ease;
}

.stat-label {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  line-height: 1.2;
}

/* 各状态卡片的主题色定义和悬停效果 */
.stat-card.pending {
  --accent-color: #1890ff;
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%);
  border-color: rgba(24, 144, 255, 0.2);
}

.stat-card.material-rejected {
  --accent-color: #ff4d4f;
}

.stat-card.material-rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%);
  border-color: rgba(255, 77, 79, 0.2);
}

.stat-card.reviewing {
  --accent-color: #faad14;
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7dc 100%);
  border-color: rgba(250, 173, 20, 0.2);
}

.stat-card.scheduled {
  --accent-color: #13c2c2;
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #d1f9f6 100%);
  border-color: rgba(19, 194, 194, 0.2);
}

.stat-card.completed {
  --accent-color: #52c41a;
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #edf9e3 100%);
  border-color: rgba(82, 196, 26, 0.2);
}

.stat-card.conditional {
  --accent-color: #fa8c16;
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1dc 100%);
  border-color: rgba(250, 140, 22, 0.2);
}

.stat-card.rejected {
  --accent-color: #ff4d4f;
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%);
  border-color: rgba(255, 77, 79, 0.2);
}

/* 图标背景渐变样式 */
.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #e6f7ff, #91d5ff);
  color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.stat-card.material-rejected .stat-icon {
  background: linear-gradient(135deg, #fff2f0, #ffb3b3);
  color: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

.stat-card.reviewing .stat-icon {
  background: linear-gradient(135deg, #fffbe6, #ffe58f);
  color: #faad14;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.15);
}

.stat-card.scheduled .stat-icon {
  background: linear-gradient(135deg, #e6fffb, #87e8de);
  color: #13c2c2;
  box-shadow: 0 4px 12px rgba(19, 194, 194, 0.15);
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #f6ffed, #b7eb8f);
  color: #52c41a;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
}

.stat-card.conditional .stat-icon {
  background: linear-gradient(135deg, #fff7e6, #ffec99);
  color: #fa8c16;
  box-shadow: 0 4px 12px rgba(250, 140, 22, 0.15);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #fff2f0, #ffb3b3);
  color: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
}

/* 统计卡片可点击样式 */
.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(35, 79, 162, 0.2);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 统计卡片样式 - 与管理中心保持一致 */
.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(35, 79, 162, 0.2);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e6 100%);
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #efffef 100%);
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 20px;
}

.stat-card.pending .stat-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-card.reviewing .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.scheduled .stat-icon {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-card.completed .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.conditional .stat-icon {
  background: #fffbe6;
  color: #faad14;
}

.stat-card.rejected .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
  line-height: 1.2;
}

/* 卡片标题样式 */
.card-title-with-total {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title-with-total span {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* 流程说明样式 */
.flow-description {
  margin-bottom: 16px;
}

.flow-content {
  padding: 8px 0;
}

/* 筛选区域样式 */
.header-filters {
  display: flex;
  gap: 12px;
}

/* 步骤描述样式 */
.step-description {
  text-align: center;
}

.step-status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  justify-content: center;
}

.step-status-tags .ant-tag {
  margin: 0;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 项目信息样式 */
.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

/* 进度信息样式 */
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
}

/* 详情弹窗样式 */
.detail-modal {
  max-height: 70vh;
  overflow-y: auto;
}

/* 结论弹窗样式 */
.conclusion-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.conclusion-section {
  margin-bottom: 16px;
}

.conclusion-description {
  white-space: pre-line;
  line-height: 1.6;
}

.no-conclusion {
  padding: 24px 0;
  text-align: center;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 16px;
  color: #262626;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-section h4 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.requirements-text {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  white-space: pre-line;
  line-height: 1.6;
}

.rejection-reason {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  white-space: pre-line;
  line-height: 1.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-filters {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 