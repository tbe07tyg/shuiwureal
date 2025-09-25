<!--
 * @file 中期申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的中期申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化，复制验收模块完整功能
-->
<template>
  <div class="applicant-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">中期申请管理</h1>
        <p class="page-description">查看和管理您提交的项目中期申请</p>
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
        <div class="stat-card completed" @click="handleStatCardClick('midterm_passed')">
          <div class="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermPassed }}</div>
            <div class="stat-label">中期通过</div>
          </div>
        </div>
        <div class="stat-card conditional" @click="handleStatCardClick('midterm_conditional')">
          <div class="stat-icon">
            <BulbOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermConditional }}</div>
            <div class="stat-label">有条件通过</div>
          </div>
        </div>
        <div class="stat-card rejected" @click="handleStatCardClick('midterm_failed')">
          <div class="stat-icon">
            <CloseCircleOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.midtermFailed }}</div>
            <div class="stat-label">中期未通过</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中期流程说明 -->
    <a-card class="flow-description" title="中期检查流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交中期申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核中期材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织中期检查会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="中期结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">中期通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">中期未通过</a-tag>
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
          <span>我的中期申请</span>
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
            <a-select-option value="material_rejected">材料审核未通过</a-select-option>
            <a-select-option value="meeting_preparing">会议待组织</a-select-option>
            <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
            <a-select-option value="midterm_passed">中期通过</a-select-option>
            <a-select-option value="midterm_conditional">有条件通过</a-select-option>
            <a-select-option value="midterm_failed">中期未通过</a-select-option>
            <a-select-option value="rectification_reviewing">整改审核中</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
            @change="handleInputChange"
          />
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="filteredApplications"
        :pagination="pagination"
        row-key="id"
        size="middle"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectInfo'">
            <div class="project-info">
              <div class="project-name">{{ record.projectName }}</div>
              <div class="project-code">{{ record.applicationNo }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag >
              {{ getApplicationTypeText(record.applicationType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'applicationStatus'">
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
                :stroke-color="getStatusColor(record.status)"
              />
              <div class="progress-text" style="font-size: 10px;
  color: #8c8c8c;text-align: center;">
                <!-- <a-tag :color="getStatusColor(record.status)"> -->
                  {{ getProgressText(record.status, record) }}
                <!-- </a-tag> -->
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
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
                v-if="record.status === 'midterm_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                提交整改
              </a-button>
              <a-button 
                v-if="record.status === 'midterm_failed'" 
                type="primary" 
                size="small" 
                @click="handleResubmit(record)"
              >
                重新申请
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
                v-if="['midterm_passed', 'midterm_conditional', 'midterm_failed'].includes(record.status)" 
                size="small" 
                @click="handleViewDetails(record)"
              >
                查看结论
              </a-button>
              <a-button 
                v-if="record.status === 'material_reviewing'"
                size="small" 
                danger
                @click="handleCancelApplication(record)"
              >
                取消申请
              </a-button>
              <a-button size="small" @click="handleViewRecord(record)">
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="中期申请详情"
      width="1000px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedApplication" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedApplication.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedApplication.applicationNo }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ formatDate(selectedApplication.createTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="预期中期时间">
              {{ formatDate(selectedApplication.expectedMidtermTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="申请类型">
              {{ selectedApplication.applicationType === 1 ? '常规中期' : selectedApplication.applicationType === 2 ? '专项中期' : '延期中期' }}
            </a-descriptions-item>
            <a-descriptions-item label="申请状态">
              <a-tag :color="getStatusColor(selectedApplication.status)">
                {{ getStatusText(selectedApplication.status) }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </div>
        
        <!-- 申请描述
        <div class="detail-section">
          <h4><FileTextOutlined /> 申请描述</h4>
          <div class="description-content">
            {{ filterApplicationDescription(selectedApplication.applicationDescription) || '无描述信息' }}
          </div>
        </div> -->
        
        <!-- 提交材料 -->
        <!-- <div class="detail-section" v-if="selectedApplication.materials && selectedApplication.materials.length > 0">
          <h4><FileOutlined /> 提交材料</h4>
          <div class="material-list">
            <div
              v-for="material in selectedApplication.materials"
              :key="material.id"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ material.materialName || '未命名文件' }}{{ material.fileSuffix ? '.' + material.fileSuffix : '' }}
                </div>
                <div class="material-meta">
                  <span class="material-type">{{ material.type }}</span>
                  <a-tag
                    :color="
                      material.reviewStatus === 'approved'
                        ? 'green'
                        : material.reviewStatus === 'rejected'
                          ? 'red'
                          : 'orange'
                    "
                    size="small"
                  >
                    {{
                      material.reviewStatus === 'approved'
                        ? '已通过'
                        : material.reviewStatus === 'rejected'
                          ? '已驳回'
                          : '待审核'
                    }}
                  </a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(material)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(material)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div> -->
        
        <!-- 会议信息 -->
        <!-- <div class="detail-section" v-if="selectedApplication.meetingInfo">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ selectedApplication.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedApplication.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{
                selectedApplication.meetingInfo.type === 'offline'
                  ? '现场会议'
                  : selectedApplication.meetingInfo.type === 'online'
                    ? '线上会议'
                    : '混合会议'
              }}
            </a-descriptions-item>
            <a-descriptions-item
              label="会议说明"
              :span="2"
              v-if="selectedApplication.meetingInfo.description"
            >
              {{ selectedApplication.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div> -->

        <!-- 会议上传文件 -->
        <!-- <div class="detail-section" v-if="selectedApplication.meetingMaterials && selectedApplication.meetingMaterials.length > 0">
          <h4><FolderOpenOutlined /> 会议上传文件</h4>
          <div class="material-list">
            <div
              v-for="(file, index) in selectedApplication.meetingMaterials"
              :key="file.id || index"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ file.fileName || '未命名文件' }}
                </div>
                <div class="material-meta">
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                  <a-tag v-if="file.materialSource === 1" color="blue" size="small">上传文件</a-tag>
                  <a-tag v-else-if="file.materialSource === 2" color="green" size="small">链接文件</a-tag>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(file)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(file)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div> -->

        <!-- 中期结论 -->
        <!-- <div class="detail-section" v-if="selectedApplication.conclusion">
          <h4><AuditOutlined /> 中期结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="结论结果">
              <a-tag
                :color="
                  selectedApplication.conclusion.result === 'passed'
                    ? 'green'
                    : selectedApplication.conclusion.result === 'failed'
                      ? 'red'
                      : 'orange'
                "
              >
                {{
                  selectedApplication.conclusion.result === 'passed'
                    ? '中期通过'
                    : selectedApplication.conclusion.result === 'failed'
                      ? '中期未通过'
                      : '有条件通过'
                }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ selectedApplication.conclusion.time }}
            </a-descriptions-item>
            <a-descriptions-item label="结论评分" v-if="selectedApplication.conclusion.score">
              <span
                :style="{
                  color:
                    selectedApplication.conclusion.score >= 90
                      ? '#52c41a'
                      : selectedApplication.conclusion.score >= 80
                        ? '#fa8c16'
                        : '#ff4d4f'
                }"
              >
                {{ selectedApplication.conclusion.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="结论说明" :span="selectedApplication.conclusion.score ? 1 : 2">
              {{ selectedApplication.conclusion.description }}
            </a-descriptions-item>
            <a-descriptions-item
              label="整改要求"
              :span="2"
              v-if="selectedApplication.conclusion.requirements"
            >
              <div class="requirements-text">
                {{ selectedApplication.conclusion.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div> -->

        <!-- 结论文件 -->
        <!-- <div class="detail-section" v-if="selectedApplication.conclusionFiles && selectedApplication.conclusionFiles.length > 0">
          <h4><FileTextOutlined /> 结论文件</h4>
          <div class="material-list">
            <div
              v-for="(file, index) in selectedApplication.conclusionFiles"
              :key="file.id || index"
              class="material-item"
            >
              <div class="material-info">
                <div class="material-name">
                  <FileOutlined />
                  {{ file.fileName || '未命名文件' }}
                </div>
                <div class="material-meta">
                  <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                </div>
              </div>
              <div class="material-actions">
                <a-button type="link" size="small" @click="previewMaterial(file)">
                  <EyeOutlined />
                  预览
                </a-button>
                <a-button type="link" size="small" @click="downloadMaterial(file)">
                  <DownloadOutlined />
                  下载
                </a-button>
              </div>
            </div>
          </div>
        </div> -->

        <!-- 审核历史 -->
        <div class="detail-section">
          <h4><ClockCircleOutlined /> 审核历史</h4>
          <a-timeline>
            <a-timeline-item color="blue">
              <template #dot>
                <FileOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">项目中期申请提交</div>
                <div class="timeline-time">{{ selectedApplication.createTime ? formatDate(selectedApplication.createTime) : '' }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item v-if="selectedApplication.materials && selectedApplication.materials.some(m => m.reviewStatus === 'approved')" color="green">
              <template #dot>
                <CheckCircleOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">材料审核通过</div>
                <div class="timeline-time">{{
                  selectedApplication.materials
                    .filter(m => m.reviewStatus === 'approved')
                    .map(m => formatDate(m.reviewTime || m.createTime || ''))[0] || ''
                }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item v-if="selectedApplication.meetingInfo" color="blue">
              <template #dot>
                <CalendarOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">中期会议安排</div>
                <div class="timeline-time">{{ selectedApplication.meetingInfo?.time }}</div>
              </div>
            </a-timeline-item>

            <a-timeline-item
              v-if="selectedApplication.conclusion"
              :color="
                selectedApplication.conclusion.result === 'passed'
                  ? 'green'
                  : selectedApplication.conclusion.result === 'failed'
                    ? 'red'
                    : 'orange'
              "
            >
              <template #dot>
                <AuditOutlined />
              </template>
              <div class="timeline-content">
                <div class="timeline-title">
                  {{
                    selectedApplication.conclusion.result === 'passed'
                      ? '中期通过'
                      : selectedApplication.conclusion.result === 'failed'
                        ? '中期未通过'
                        : '有条件通过'
                  }}
                </div>
                <div class="timeline-time">{{ selectedApplication.conclusion.time }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
    
    <!-- 文件预览弹窗 -->
    <FilePreview
      v-model:visible="previewVisible"
      :file-info="currentPreviewFile"
      :file-list="fileList"
      :current-file-index="currentFileIndex"
      :title="getFilePreviewTitle(currentPreviewFile)"
      @file-change="handleFileChange"
      @download="handleDownloadFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
import {
  FileSearchOutlined,
  FileOutlined,
  CalendarOutlined,
  AuditOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 引入接口
import { thQdMidPage, thQdMidDetail, thQdMidMaterialReviewPage, thQdMidMaterialPage,thQdMidDelete } from '@/api/th_qd/mid/add/index' // 替换为实际接口文件路径
import { NumberFormatResult } from 'vue-i18n'
import { getMidtermConclusionPage } from '@/api/th_qd/mid/meet/index'
import { getTechnologicalProject } from '@/api/th_qd/approval/index';
import FilePreview from '@/components/th_qd/FilePreview.vue';
import { getMidtermMeetingPage, getMidtermMeetingMaterialPage, getMidtermConclusionFilePage } from '@/api/th_qd/mid/meet/index';

const router = useRouter()

// 弹窗状态
const detailModalVisible = ref(false)
const selectedApplication = ref(null)

// 材料审核历史
const materialReviewHistory = ref([])

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})
const fileList = ref([])
const currentFileIndex = ref(0)

// 时间格式化函数，将时间戳转换为YYYY-MM-DD格式
const formatDate = (timestamp: number | string) => {
  if (!timestamp) return '';
  
  // 处理字符串类型的时间戳
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  
  const date = new Date(ts);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 获取项目名称的方法
const getProjectName = async (projectId: number) => {
  try {
    // 检查 projectId 是否存在且为有效数字
    if (!projectId || isNaN(projectId)) {
      // console.warn('无效的项目ID:', projectId)
      return '未知项目'
    }
    
    // console.log('正在获取项目名称，projectId:', projectId)
    const response = await getTechnologicalProject(projectId)
    // console.log('获取项目信息响应:', response)
    
    // 根据实际API响应格式，直接从response中获取projectName
    if (response && response.projectName) {
      // // console.log('项目名称:', response.projectName)
      return response.projectName
    } else {
      // // console.warn('响应数据格式不正确，缺少projectName字段')
      return '未知项目'
    }
  } catch (error) {
    // // console.error('获取项目名称失败:', error)
    return '未知项目'
  }
}

// 获取项目名称和申请人的方法
const getProjectInfo = async (projectId: number) => {
  try {
    // 检查 projectId 是否存在且为有效数字
    if (!projectId || isNaN(projectId)) {
      console.warn('无效的项目ID:', projectId)
      return { 
        projectName: '未知项目',
        applicant: ''
      }
    }

    console.log('正在获取项目信息，projectId:', projectId)
    const response = await getTechnologicalProject(projectId)
    console.log('获取项目信息响应:', response)
    console.log('响应类型:', typeof response)
    console.log('响应键:', Object.keys(response || {}))

    // 根据实际API响应格式，从response中获取projectName和applicant
    if (response) {
      // 尝试多种可能的字段名
      const projectName = response.projectName || response.name || response.title || '未知项目'
      const applicant = response.applicant || response.applicantName || response.creator || response.userName || ''

      console.log('提取的项目名称:', projectName)
      console.log('提取的申请人:', applicant)

      return {
        projectName,
        applicant
      }
    } else {
      console.warn('响应数据格式不正确')
      return { 
        projectName: '未知项目',
        applicant: ''
      }
    }
  } catch (error) {
    console.error('获取项目信息失败:', error)
    return { 
      projectName: '未知项目',
      applicant: ''
    }
  }
}

// 状态管理
const loading = ref(false)
const applications = ref<Array<{
  id: NumberFormatResult
  projectName: string
  projectCode: string
  status: string
  submitTime: string
  expectedTime: string
  applicant: string  // 添加申请人字段
  description?: string
  materials?: Array<{
    id: number
    name: string
    type: string
  }>
  materialRejected?: boolean
  rejectionInfo?: {
    time: string
    reviewer: string
    comments: string
    rejectionReason: string
  }
  meetingInfo?: {
    time: string
    location: string
    participants: string[]
  }
  conclusion?: {
    time: string
    type: string
    feedback: string
    score?: number
    requirements?: string
  }
}>>([])

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
  const midtermPassed = applications.value.filter(app => 
    app.status === 'midterm_passed'
  ).length
  const midtermConditional = applications.value.filter(app => 
    app.status === 'midterm_conditional'
  ).length
  const midtermFailed = applications.value.filter(app => 
    app.status === 'midterm_failed'
  ).length
  
  const rectificationReviewing = applications.value.filter(app =>
    app.status === 'rectification_reviewing'
  ).length

  return {
    total,
    materialReviewing,
    materialRejected,
    meetingPreparing,
    meetingScheduled,
    midtermPassed,
    midtermConditional,
    midtermFailed,
    rectificationReviewing
  }
})

// 筛选条件
const filters = ref({
  status: '',
  applicationType: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 表格列配置
const columns = [
  {
    title: '项目名称',
    key: 'projectInfo',
    width: 300
  },
  {
    title: '申请类型',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'applicationStatus',
    key: 'applicationStatus',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 120,
    customRender: ({ text }) => formatDate(text)
  },
  {
    title: '预期时间',
    dataIndex: 'expectedTime',
    key: 'expectedTime',
    width: 120,
    customRender: ({ text }) => formatDate(text)
  },
  {
    title: '进度',
    key: 'progress',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录`
})

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applications.value
  
  if (filters.value.status) {
    result = result.filter(app => app.status === filters.value.status)
  }

  if (filters.value.applicationType) {
    result = result.filter(app => app.applicationType === filters.value.applicationType)
  }
  
  if (filters.value.keyword) {
    // 确保keyword不为空字符串
    const keyword = filters.value.keyword.trim()
    if (keyword) {
      result = result.filter(app => 
        (app.projectName && app.projectName.toLowerCase().includes(keyword.toLowerCase())) ||
        (app.projectCode && app.projectCode.toLowerCase().includes(keyword.toLowerCase()))
      )
    }
  }
  
  return result
})

// 状态码与文本映射
const statusCodeMap = {
  1: 'material_reviewing',
  2: 'meeting_preparing',
  3: 'meeting_scheduled',
  4: 'midterm_passed',
  5: 'midterm_conditional',
  6: 'midterm_failed',
  7: 'material_rejected',
  8: 'rectification_reviewing'
}

// 文本与状态码映射
const statusTextMap = {
  'material_reviewing': 1,
  'meeting_preparing': 2,
  'meeting_scheduled': 3,
  'midterm_passed': 4,
  'midterm_conditional': 5,
  'midterm_failed': 6,
  'material_rejected': 7,
  'rectification_reviewing': 8
}

// 获取申请类型文本
const getApplicationTypeText = (type: number) => {
  switch(type) {
    case 1: return '常规中期'
    case 2: return '专项中期'
    case 3: return '延期中期'
    default: return '未知类型'
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap = {
    'material_reviewing': 'orange',
    'meeting_preparing': 'blue',
    'meeting_scheduled': 'cyan',
    'midterm_passed': 'green',
    'midterm_conditional': 'orange',
    'midterm_failed': 'red',
    'material_rejected': 'red',
    'rectification_reviewing': 'purple'
  }
  return colorMap[status] || 'default'
}



// 获取进度百分比
const getProgressPercent = (status: string) => {
  const percentMap = {
    'material_rejected': 25,
    'material_reviewing': 25,
    'meeting_preparing': 50,
    'meeting_scheduled': 75,
    'midterm_passed': 100,
    'midterm_conditional': 80,
    'midterm_failed': 100,
    'rectification_reviewing': 90
  }
  return percentMap[status] || 0
}

// 获取进度状态
const getProgressStatus = (status: string) => {
  // 不再使用内置状态，而是使用自定义颜色
  return 'normal'
}

// 获取进度文本
const getProgressText = (status: string, record: any) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'meeting_preparing': '等待会议组织',
    'meeting_scheduled': '会议已安排',
    'midterm_passed': '中期通过',
    'midterm_conditional': '有条件通过',
    'midterm_failed': '中期未通过',
    'material_rejected': '材料被驳回，需重新提交',
    'rectification_reviewing': '整改审核中',
  }
  return textMap[status] || '未知状态'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'meeting_preparing': '会议待组织',
    'meeting_scheduled': '会议已安排',
    'midterm_passed': '中期通过',
    'midterm_conditional': '有条件通过',
    'midterm_failed': '中期未通过',
    'material_rejected': '材料审核未通过',
    'rectification_reviewing': '整改审核中',
  }
  return textMap[status] || '未知状态'
}


const fetchApplications = async () => {
  // // console.log('开始获取申请列表，loading设置为true')
  loading.value = true
  try {
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      applicationStatus: filters.value.status 
        ? statusTextMap[filters.value.status as keyof typeof statusTextMap] 
        : undefined,
      applicationType: filters.value.applicationType || undefined
    }

    // // console.log('请求参数:', params)
    const response = await thQdMidPage(params)
    
    // 打印后端返回的原始数据
    console.log('后端返回的原始数据:', response)
    
    // 检查响应结构并提取数据
    if (response && response.list) {
      // 转换接口返回的状态码为前端文本标识
      const formattedData = await Promise.all(response.list.map(async (item: any) => {
        // 获取项目信息，包括项目名称和申请人
        const projectInfo = await getProjectInfo(item.projectId)
        console.log(`项目ID ${item.projectId} 的信息:`, projectInfo)

        return {
          ...item,
          projectName: projectInfo.projectName, // 添加项目名称
          applicant: projectInfo.applicant,     // 添加申请人信息
          status: statusCodeMap[item.applicationStatus] || item.applicationStatus,
          submitTime: item.createTime,
          expectedTime: item.expectedMidtermTime || '' // 处理可能的 null 值
        }
      }))
      
      // 打印格式化后的数据
      console.log('格式化后的数据:', formattedData)
      
      // 获取当前用户信息
      const userStore = useUserStore()
      const currentUser = userStore.getUser
      console.log('当前用户信息:', currentUser)
      
      // 获取当前用户ID和昵称
      const currentUserId = currentUser.id
      const currentUserNickname = currentUser.nickname || currentUser.name || currentUser.username
      console.log('当前用户ID:', currentUserId)
      console.log('当前用户昵称:', currentUserNickname)

      // 筛选出申请人等于当前用户的数据
      const filteredData = formattedData.filter(item => {
        // 检查多种可能的申请人字段
        const itemApplicant = item.applicant || item.applicantName || item.creator || item.userName || item.createBy || ''
        const itemUserId = item.createId || item.userId || item.applicantId
        
        console.log(`项目ID ${item.projectId} 的申请人信息:`, {
          applicant: itemApplicant,
          userId: itemUserId,
          item: item
        })
        
        // 优先比较用户ID，如果没有则比较昵称
        return (itemUserId && itemUserId === currentUserId) || 
               (itemApplicant && itemApplicant === currentUserNickname)
      })

      console.log('筛选后的数据:', filteredData)

      applications.value = filteredData
      pagination.value.total = filteredData.length || 0
    } else {
      // 处理 API 返回错误的情况
      message.error('获取数据失败：返回数据格式不正确')
      // // console.error('API 返回数据格式不正确:', response)
    }
  } catch (error) {
    // console.error('获取申请列表时发生错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    message.error(`获取申请列表失败: ${errorMessage}`)
  } finally {
    // // console.log('获取申请列表完成，loading设置为false')
    loading.value = false
  }
}


// 事件处理函数
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const handleStatCardClick = (status: string) => {
  filters.value.status = status
  pagination.value.current = 1 // 重置分页
  fetchApplications()
}

const handleFilterChange = () => {
  pagination.value.current = 1 // 重置分页
  fetchApplications()
}

const handleSearch = () => {
  pagination.value.current = 1 // 重置分页
  fetchApplications()
}

const handleInputChange = () => {
  // 实时搜索，当输入框内容变化时立即触发搜索
  pagination.value.current = 1 // 重置分页
  fetchApplications()
}

const handleTableChange = (paginationParams: any) => {
  pagination.value.current = paginationParams.current
  pagination.value.pageSize = paginationParams.pageSize
  fetchApplications()
}

const goToSubmit = () => {
  router.push('/th-qd-project/implementation/midterm/midterm/applicant/submit')
}







/**
 * 查看详情
 * @param {Object} record 申请记录
 */
// const handleViewDetails = (record) => {
//   console.log(record)
//   selectedApplication.value = record
//   detailModalVisible.value = true
// }

// /**
//  * 关闭详情弹窗
//  */
// const handleDetailCancel = () => {
//   detailModalVisible.value = false
//   selectedApplication.value = null
// }



const handleResubmitMaterial = (record: any) => {
  console.log('重新提交记录')
  console.log(record)
  const materialsPayload = record.materials ? encodeURIComponent(JSON.stringify(record.materials)) : ''
  console.log(record.materials)

  // 处理日期数据
  const expectedMidtermTime = record.expectedMidtermTime ? JSON.stringify(record.expectedMidtermTime) : ''
  const expectedTime = record.expectedTime ? JSON.stringify(record.expectedTime) : ''

  router.push({
    path: '/th-qd-project/implementation/midterm/midterm/applicant/submit',
    query: {
      tab: 'submit',
      resubmit: 'true',
      id: record.id,
      projectId: record.projectId || '',
      applicationType: record.applicationType || 2,
      applicationDescription: encodeURIComponent(record.applicationDescription || ''),
      createTime: record.createTime || '',
      expectedMidtermTime: expectedMidtermTime,
      expectedTime: expectedTime,
      notes: encodeURIComponent(record.notes || ''),
      // 保留原有参数
      expectedDate: record.createTime || record.expectedTime || '',
      description: encodeURIComponent(record.applicationDescription || ''),
      remarks: encodeURIComponent(record.remarks || ''),
      rejectionReason: encodeURIComponent(record.rejectionInfo?.rejectionReason || ''),
      materials: materialsPayload,
      status: record.status || ''
    }
  })
}


const handleSubmitImprovement = (record: any) => {
  console.log('提交整改记录')
  console.log(record)
  // 将材料数组转换为JSON字符串并进行URL编码
const materialsPayload = record.materials ? encodeURIComponent(JSON.stringify(record.materials)) : ''
  console.log(record.materials)
    // 处理日期数据
  const expectedMidtermTime = record.expectedMidtermTime ? JSON.stringify(record.expectedMidtermTime) : ''
  const expectedTime = record.expectedTime ? JSON.stringify(record.expectedTime) : ''
  router.push({
    path: '/th-qd-project/implementation/midterm/midterm/applicant/submit',
    query: {
        tab:'submit',
      // resubmit: 'true',
      improvement: 'true',
      id: record.id,
      projectId: record.projectId || '',
      applicationType: record.applicationType || 2,
      applicationDescription: encodeURIComponent(record.applicationDescription || ''),
      createTime: record.createTime || '',
      expectedMidtermTime: expectedMidtermTime,
      expectedTime: expectedTime,
      notes: encodeURIComponent(record.notes || ''),
      // 保留原有参数
      expectedDate: record.createTime || record.expectedTime || '',
      description: encodeURIComponent(record.applicationDescription || ''),
      remarks: encodeURIComponent(record.remarks || ''),
      rejectionReason: encodeURIComponent(record.rejectionInfo?.rejectionReason || ''),
      materials: materialsPayload,
      status: record.status || ''
    }
  })
}

const handleResubmit = (record: any) => {
  router.push(`/th-qd-project/implementation/midterm/midterm/applicant/submit`)
}

const handleViewDetails = async (record: any) => {
  console.log('查看结论详情，记录对象:', record)

  try {
    loading.value = true

    // 调用getMidtermConclusionPage接口获取结论详情
    const params = {
      midtermApplicationId: record.id
    }

    console.log('请求结论详情参数:', params)
    const response = await getMidtermConclusionPage(params)
    console.log('结论详情响应数据:', response)

    // 处理接口返回的数据结构
    if (!response || !response.list || !Array.isArray(response.list) || response.list.length === 0) {
      message.warning('暂无结论详情信息')
      return
    }

    // 获取结论记录（假设返回的数组按时间倒序排列）
    const conclusionDetail = response.list[0]
    // 创建结论详情内容
    const content = h('div', { style: 'line-height: 1.6;' }, [
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '结论时间：'),
        h('span', conclusionDetail.conclusionTime ? formatDate(conclusionDetail.conclusionTime) : formatDate(conclusionDetail.createTime))
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '结论类型：'),
        h('span', getStatusText(record.status))
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '中期评分：'),
        h('span', conclusionDetail.conclusionScore !== undefined && conclusionDetail.conclusionScore !== null ? `${conclusionDetail.conclusionScore}分` : '未评分')
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '结论意见：'),
        h('div', { style: 'margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;' },
          conclusionDetail.conclusionDescription || '无结论意见'
        )
      ]),
      conclusionDetail.requirements && h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '整改要求：'),
        h('div', { style: 'margin-top: 8px; padding: 12px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px;' },
          conclusionDetail.requirements
        )
      ])
    ])

    // 显示结论详情弹窗
    Modal.info({
      title: '中期结论详情',
      width: 600,
      content: content,
      okText: '我知道了'
    })
  } catch (error) {
    console.error('获取结论详情失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    message.error(`获取结论详情失败: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}


//           h('div', { style: 'background: #f5f5f5; padding: 12px; border-radius: 4px; margin-top: 8px;' }, 
//             record.conclusion.feedback)
//         ]),
//         record.conclusion.requirements && h('div', [
//           h('p', { style: 'margin-top: 16px;' }, '整改要求:'),
//           h('div', { style: 'background: #fff7e6; padding: 12px; border-radius: 4px; margin-top: 8px; border: 1px solid #ffd591;' }, 
//             record.conclusion.requirements)
//         ])
//       ])
//     })
//   } else {
//     message.info('暂无结论详情')
//   }
// }

const handleViewRecord = (record) => {
  selectedApplication.value = record
  loading.value = true // 显示加载状态
  ;(async () => {
    try {
      // 加载中期申请材料
      const res = await thQdMidMaterialPage({ pageNo: 1, pageSize: 100, midtermApplicationId: record.id })
      const list = res?.list || []
      console.log('材料数据:', list)

      // 将材料列表赋值给selectedApplication，确保详情弹窗中能显示材料
      selectedApplication.value.materials = list.map((m) => ({
        ...m,
        reviewStatus: (m.reviewStatus === 1 ? 'approved' : m.reviewStatus === 2 ? 'rejected' : 'pending'),
        rejectionReason: m.reviewComments || '',
        type: getMaterialTypeName(m.materialType)
      }))

      // 同时保存材料审核历史
      materialReviewHistory.value = list.map((r) => ({
        materialName: r.materialName || `材料#${r.materialId}`,
        reviewResult: r.reviewResult,
        reviewComments: r.reviewComments,
        reviewTime: r.reviewTime,
        createTime: r.createTime,
        reviewOpinion: r.reviewOpinion
      }))
      console.log('材料审核历史:', materialReviewHistory.value)

      // 加载会议信息
      try {
        const meetingRes = await getMidtermMeetingPage({ midtermApplicationId: record.id })
        const meetingList = meetingRes?.list || []
        console.log('会议数据:', meetingList)

        if (meetingList.length > 0) {
          const meeting = meetingList[0]
          // 保存会议信息
          selectedApplication.value.meetingInfo = {
            time: meeting.meetingTime ? dayjs(meeting.meetingTime).format('YYYY-MM-DD HH:mm') : '',
            location: meeting.meetingPlace,
            type: meeting.meetingType === 0 ? 'offline' : meeting.meetingType === 1 ? 'online' : 'hybrid',
            description: meeting.meetingInstructions,
            id: meeting.id // 保存会议ID，用于获取会议上传文件
          }

          // 使用会议ID加载会议上传文件
          try {
            // 初始化会议上传文件数组
            selectedApplication.value.meetingMaterials = []

            const meetingMaterialRes = await getMidtermMeetingMaterialPage({ meetingId: meeting.id })
            const meetingMaterialList = meetingMaterialRes?.list || []
            console.log('会议上传文件数据:', meetingMaterialList)

            if (meetingMaterialList.length > 0) {
              selectedApplication.value.meetingMaterials = meetingMaterialList.map(item => ({
                id: item.id,
                fileName: item.materialName,
                fileUrl: item.fileUrl,
                fileSize: item.fileSize,
                fileSuffix: item.fileSuffix,
                materialSource: item.materialSource,
                sort: item.sort
              }))
              console.log('会议上传文件:', selectedApplication.value.meetingMaterials)
            }
          } catch (meetingMaterialError) {
            console.error('加载会议上传文件失败:', meetingMaterialError)
            selectedApplication.value.meetingMaterials = []
          }
        }
      } catch (meetingError) {
        console.error('加载会议信息失败:', meetingError)
        selectedApplication.value.meetingMaterials = []
      }

      // 加载结论信息
      try {
        // 首先获取结论基本信息
        const conclusionRes = await getMidtermConclusionPage({ midtermApplicationId: record.id })
        const conclusionList = conclusionRes?.list || []
        console.log('结论数据:', conclusionList)

        if (conclusionList.length > 0) {
          const conclusion = conclusionList[0]
          // 保存结论信息
          selectedApplication.value.conclusion = {
            result: conclusion.conclusionResult === 0 ? 'passed' : conclusion.conclusionResult === 1 ? 'conditional_passed' : 'failed',
            time: conclusion.createTime ? dayjs(conclusion.createTime).format('YYYY-MM-DD HH:mm') : '',
            score: conclusion.conclusionScore,
            description: conclusion.conclusionDescription,
            requirements: conclusion.requirements, // 添加整改要求字段
            id: conclusion.id // 保存结论ID，用于获取结论文件
          }

          // 使用结论ID加载结论文件
          try {
            // 初始化结论文件数组
            selectedApplication.value.conclusionFiles = []

            console.log('使用conclusionId获取结论文件:', conclusion.id)
            // 使用getMidtermConclusionFilePage函数获取结论文件
            const conclusionFileRes = await getMidtermConclusionFilePage({ conclusionId: conclusion.id })
            const conclusionFileList = conclusionFileRes?.list || []
            console.log('结论文件数据:', conclusionFileList)

            // 处理结论文件列表
            if (conclusionFileList.length > 0) {
              // 直接使用返回的文件列表，因为getMidtermConclusionFilePage应该直接返回文件列表
              selectedApplication.value.conclusionFiles = conclusionFileList.map(item => ({
                id: item.id,
                fileName: item.fileName || '未命名文件',
                fileUrl: item.fileUrl || '',
                fileSize: item.fileSize || 0,
                fileSuffix: item.fileSuffix,
                sort: item.sort || 0
              }))
              console.log('从getMidtermConclusionFilePage获取结论文件:', selectedApplication.value.conclusionFiles)
            } else {
              console.log('未找到结论文件')
              selectedApplication.value.conclusionFiles = []
            }
          } catch (conclusionFileError) {
            console.error('使用conclusionId加载结论文件失败:', conclusionFileError)
            selectedApplication.value.conclusionFiles = []
          }
        }
      } catch (conclusionError) {
        console.error('加载结论信息失败:', conclusionError)
        selectedApplication.value.conclusionFiles = []
      }



    

    

    



    

    const projectName = detail.projectName || record.projectName || '未知项目'
    const projectCode = detail.applicationNo || record.applicationNo || detail.projectCode || record.projectCode || '未知编号'
    
    // 获取申请类型文本
    const getApplicationTypeText = (type) => {
      switch(type) {
        case 1: return '常规中期'
        case 2: return '专项中期'
        case 3: return '延期中期'
        default: return '未知类型'
      }
    }

    // 安全地访问嵌套属性
    const safeGetProperty = (obj: any, path: string, defaultValue: any = '') => {
      if (!obj) return defaultValue
      const keys = path.split('.')
      return keys.reduce((o, k) => (o && o[k] !== undefined) ? o[k] : defaultValue, obj)
    }
    
    Modal.info({
      title: '中期申请详情',
      width: 700,
      content: h('div', [
        h('p', `项目名称: ${projectName}`),
        h('p', `项目编号: ${projectCode}`),
        h('p', `申请时间: ${formatDate(safeGetProperty(detail, 'createTime'))}`),
        h('p', `预期中期时间: ${formatDate(safeGetProperty(detail, 'expectedMidtermTime'))}`),
        h('p', `申请类型: ${getApplicationTypeText(safeGetProperty(detail, 'applicationType', 1))}`),
        h('p', `申请状态: ${getStatusText(statusCodeMap[safeGetProperty(detail, 'applicationStatus')] || '')}`),
        h('div', [
          h('p', '申请描述:'),
          h('div', { style: 'background: #f5f5f5; padding: 12px; border-radius: 4px;' }, 
            safeGetProperty(detail, 'applicationDescription', '无'))

        ]),
        safeGetProperty(detail, 'midtermMaterialDOList') && Array.isArray(detail.midtermMaterialDOList) && detail.midtermMaterialDOList.length > 0 && h('div', { style: 'margin-top: 16px;' }, [
          h('p', '提交材料:'),
          h('ul', { style: 'padding-left: 20px;' }, 
            detail.midtermMaterialDOList.map((material: any) => 
              h('li', `${safeGetProperty(material, 'materialName', '未知材料')} (${getMaterialTypeName(safeGetProperty(material, 'materialType', 5))})`)
            )
          )
        ])
      ])
    })
    } catch (e) {
      materialReviewHistory.value = []
      // 如果加载失败，至少确保materials属性存在
      if (!selectedApplication.value.materials) {
        selectedApplication.value.materials = []
      }
      // 确保其他资料属性也存在
      if (!selectedApplication.value.meetingMaterials) {
        selectedApplication.value.meetingMaterials = []
      }
      if (!selectedApplication.value.conclusionFiles) {
        selectedApplication.value.conclusionFiles = []
      }
    } finally {
      // 添加1.5秒的加载效果
      setTimeout(() => {
        loading.value = false // 隐藏加载状态
        // 显示详情弹窗
        detailModalVisible.value = true
      }, 500)
    }
  })()
}

// 材料类型转换
const getMaterialTypeName = (type: number) => {
  const typeMap = {
    1: '中期报告',
    2: '技术方案',
    3: '实施计划',
    4: '调研报告',
    5: '其他'
  }
  return typeMap[type] || '未知类型'
}

// 文件大小格式化
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 关闭详情弹窗
const handleDetailCancel = () => {
  detailModalVisible.value = false
  selectedApplication.value = null
}

// 预览材料
const previewMaterial = (material: any) => {
  console.log('预览文件:', material)

  // 判断文件类型，确定使用哪个文件列表
  let sourceFiles = []
  let fileTypeName = ''

  // 检查是否是会议上传文件
  if (selectedApplication.value.meetingMaterials &&
      selectedApplication.value.meetingMaterials.some(item => item.id === material.id)) {
    sourceFiles = selectedApplication.value.meetingMaterials
    fileTypeName = '会议上传文件'
  }
  // 检查是否是结论文件
  else if (selectedApplication.value.conclusionFiles &&
           selectedApplication.value.conclusionFiles.some(item => item.id === material.id)) {
    sourceFiles = selectedApplication.value.conclusionFiles
    fileTypeName = '结论文件'
  }
  // 默认使用中期申请材料
  else if (selectedApplication.value.materials) {
    sourceFiles = selectedApplication.value.materials
    fileTypeName = '中期申请材料'
  }

  console.log(`使用${fileTypeName}列表进行预览:`, sourceFiles)

  // 构建文件预览列表
  fileList.value = sourceFiles.map(item => {
    // 处理文件名，确保不为null
    const materialName = item.materialName || item.fileName || '未命名文件'
    const fileSuffix = item.fileSuffix ? '.' + item.fileSuffix :
                      (materialName && materialName.includes('.') ? '' :
                       (item.name && item.name.includes('.') ? '' : '.pdf'))

    // 确定文件URL
    let fileUrl = item.fileUrl || item.url || ''

    return {
      id: item.id,
      name: materialName + fileSuffix,
      type: item.fileSuffix || (item.name ? item.name.split('.').pop() : ''),
      size: item.fileSize || 0,
      url: fileUrl,
      uploadTime: item.createTime || item.uploadTime || '2024-01-15 10:30',
      sourceType: fileTypeName // 添加文件来源类型标识
    }
  })

  console.log('构建的文件预览列表:', fileList.value)

  // 查找当前预览文件在列表中的索引
  const index = fileList.value.findIndex(f => f.id === material.id)
  currentFileIndex.value = index >= 0 ? index : 0
  console.log('当前文件索引:', currentFileIndex.value)

  // 设置当前预览文件
  currentPreviewFile.value = fileList.value[currentFileIndex.value]
  previewVisible.value = true
}

// 下载材料
const downloadMaterial = (material: any) => {
  // 尝试多种可能的文件URL属性
  let url = material.fileUrl || material.filePath || material.url || material.path

  // 处理文件名，确保不为null
  const materialName = material.materialName || material.name || '未命名文件'
  const fileSuffix = material.fileSuffix ? '.' + material.fileSuffix : ''
  const name = materialName + fileSuffix

  // 如果仍然没有URL，尝试根据ID构造下载链接
  if (!url && material.id) {
    // 假设有一个通用的文件下载API，可以根据文件ID下载
    url = `/api/file/download?id=${material.id}`
  }

  if (!url) {
    message.error('文件地址不存在，无法下载')
    return
  }

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success(`正在下载：${name}`)
  } catch (e) {
    // 兜底方案
    window.open(url, '_blank')
  }
}

// 获取文件预览标题
const getFilePreviewTitle = (fileInfo: any) => {
  if (!fileInfo) return '文件预览'

  // 根据文件来源类型返回不同的标题
  switch (fileInfo.sourceType) {
    case '会议上传文件':
      return '会议上传文件预览'
    case '结论文件':
      return '结论文件预览'
    case '中期申请材料':
      return '中期申请材料预览'
    default:
      return '文件预览'
  }
}

// 处理文件切换
const handleFileChange = (index: number) => {
  currentFileIndex.value = index
  // 同时更新当前预览文件
  if (fileList.value && fileList.value.length > index) {
    currentPreviewFile.value = fileList.value[index]
  }
}

// 处理文件下载
const handleDownloadFile = (fileInfo: any) => {
  downloadMaterial(fileInfo)
}

const handleViewRejectionDetails = async (record: any) => {
  console.log('查看驳回详情，记录对象:', record)

  try {
    loading.value = true

    // 调用thQdMidMaterialReviewPage接口获取驳回详情
    const params = {
      midtermApplicationId: record.id
    }

    console.log('请求驳回详情参数:', params)
    const response = await thQdMidMaterialReviewPage(params)
    console.log('驳回详情响应数据:', response)

    // 处理接口返回的数据结构 {list: Array(2), total: 2}
    if (!response || !response.list || !Array.isArray(response.list) || response.list.length === 0) {
      message.warning('暂无驳回详情信息')
      return
    }

    // 获取最新的驳回记录（假设返回的数组按时间倒序排列）
    const rejectionDetail = response.list[0]
  
    // 创建驳回详情内容
    const content = h('div', { style: 'line-height: 1.6;' }, [
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '驳回时间：'),
        h('span', rejectionDetail.reviewTime ? formatDate(rejectionDetail.reviewTime) : formatDate(rejectionDetail.createTime))
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '审核人员：'),
        h('span', rejectionDetail.reviewer || '未知')
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '审核意见：'),
        h('div', { style: 'margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;' },
          rejectionDetail.reviewOpinion || '无审核意见'
        )
      ]),
      h('div', { style: 'margin-bottom: 16px;' }, [
        h('strong', '审核结果：'),
        h('span', { style: 'margin-left: 8px;' }, 
          rejectionDetail.reviewResult === 1 ? '通过' : '不通过'
        )
      ]),
      h('div', { style: 'margin-top: 16px; padding: 12px; background: #e6f7ff; border-radius: 6px;' }, [
        h('div', { style: 'color: #1890ff; font-weight: 500;' }, '💡 温馨提示'),
        h('div', { style: 'margin-top: 4px; color: #666;' }, '请根据上述要求修改和补充材料后重新提交，如有疑问可联系审核人员。')
      ])
    ])
  
    // 显示驳回原因详情弹窗
    Modal.info({
      title: '材料审核驳回详情',
      width: 600,
      content: content,
      okText: '我知道了'
    })
  } catch (error) {
    console.error('获取驳回详情失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    message.error(`获取驳回详情失败: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}

// 取消申请函数
const handleCancelApplication = (record: any) => {
  Modal.confirm({
    title: '确认取消申请',
    content: `确定要取消项目"${record.projectName}"的中期申请吗？取消后将无法恢复。`,
    okText: '确认取消',
    okType: 'danger',
    cancelText: '再想想',
    onOk: async () => {
      try {
        loading.value = true
        // 调用删除接口，直接传递ID作为参数
        console.log('取消申请参数:', record.id)
        await thQdMidDelete(record.id)
        message.success('申请已成功取消')
        // 刷新列表
        fetchApplications()
      } catch (error) {
        console.error('取消申请失败:', error)
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        message.error(`取消申请失败: ${errorMessage}`)
      } finally {
        loading.value = false
      }
    }
  })
}

// 页面初始化
onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
/* 页面容器样式 */
.applicant-manage-container {
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
}

/* 页面头部样式 */
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

/* 统计概览样式 */
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

/* 页面主要内容区域 */
.applicant-manage-container :deep(.ant-card) {
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

/* 避免重复的统计卡片样式覆盖 */
.applicant-manage-container .stat-card:hover {
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

/* 材料列表样式 */
.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  gap: 16px;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.material-type {
  font-size: 12px;
  color: #8c8c8c;
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

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 16px;
  color: #262626;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h4 .anticon {
  color: #1890ff;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.requirements-text {
  line-height: 1.6;
  color: #595959;
  padding: 8px 12px;
  background-color: #fff7e6;
  border-radius: 4px;
  border-left: 3px solid #fa8c16;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-filters {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
