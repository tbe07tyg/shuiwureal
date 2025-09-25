<!--
 * @file 提交验收申请页面 - 申报单位角色
 * @description 申报单位提交新的项目验收申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化
-->
<template>
  <div class="submit-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-description">{{ pageDescription }}</p>
      </div>
      <div class="header-actions">
        <a-button @click="goBack">
          <ArrowLeftOutlined />
          返回列表
        </a-button>
      </div>
    </div>

    <!-- 申请表单 -->
    <a-card :bordered="false">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- 项目选择 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <ProjectOutlined />
              项目选择
            </h3>
            <p>选择需要申请验收的项目</p>
          </div>
          <div class="section-content">
            <a-form-item
              label="选择项目"
              name="projectId"
              :rules="[{ required: true, message: '请选择项目' }]"
            >
              <a-select
                v-model:value="formData.projectId"
                placeholder="请选择项目"
                size="large"
                show-search
                :filter-option="filterOption"
                @change="handleProjectChange"
              >
                <a-select-option
                  v-for="project in availableProjects"
                  :key="project.id"
                  :value="project.id"
                >
                  <div class="project-option">
                    <div class="project-name">{{ project.name }}</div>
                    <div class="project-info">
                      <span class="project-code">{{ project.code }}</span>
                      <span class="project-status">{{ project.status }}</span>
                    </div>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>

            <!-- 选中项目的详细信息 -->
            <div v-if="selectedProject" class="selected-project-info">
              <a-descriptions :column="2" bordered size="small">
                <a-descriptions-item label="项目名称" :span="2">
                  {{ selectedProject.name }}
                </a-descriptions-item>
                <a-descriptions-item label="项目编号">
                  {{ selectedProject.code }}
                </a-descriptions-item>
                <a-descriptions-item label="项目状态">
                  <a-tag :color="getProjectStatusColor(selectedProject.status)">
                    {{ selectedProject.status }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="开始时间">
                  {{ selectedProject.startDate ? dayjs(selectedProject.startDate).format('YYYY-MM-DD') : '' }}
                </a-descriptions-item>
                <a-descriptions-item label="计划结束时间">
                  {{ selectedProject.endDate ? dayjs(selectedProject.endDate).format('YYYY-MM-DD') : '' }}
                </a-descriptions-item>
                <a-descriptions-item label="项目负责人">
                  {{ selectedProject.leader }}
                </a-descriptions-item>
                <a-descriptions-item label="项目总预算">
                  {{ selectedProject.budget }}万元
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </div>

        <!-- 申请信息 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <FileTextOutlined />
              申请信息
            </h3>
            <p>填写验收申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预期验收时间"
                  name="expectedAcceptanceTime"
                  :rules="[{ required: true, message: '请选择预期验收时间' }]"
                >
                  <a-date-picker
                    v-model:value="formData.expectedAcceptanceTime"
                    placeholder="请选择预期验收时间"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="验收类型"
                  name="acceptanceType"
                  :rules="[{ required: true, message: '请选择验收类型' }]"
                >
                  <a-select
                    v-model:value="formData.acceptanceType"
                    placeholder="请选择验收类型"
                    size="large"
                  >
                    <a-select-option value="0">结题验收</a-select-option>
                    <a-select-option value="1">阶段验收</a-select-option>
                    <a-select-option value="2">专项验收</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item
              :label="isImprovement ? '整改说明' : '申请说明'"
              name="description"
              :rules="[{ required: true, message: isImprovement ? '请填写整改说明' : '请填写申请说明' }]"
            >
              <a-textarea
                v-model:value="formData.description"
                :placeholder="isImprovement ? '请详细说明整改完成情况、具体措施及改进效果' : '请详细说明项目完成情况、主要成果及验收准备情况'"
                :rows="4"
                size="large"
                show-count
                :maxlength="500"
              />
            </a-form-item>

            <a-form-item label="备注说明" name="remarks">
              <a-textarea
                v-model:value="formData.remarks"
                placeholder="其他需要说明的事项（选填）"
                :rows="3"
                size="large"
                show-count
                :maxlength="200"
              />
            </a-form-item>
          </div>
        </div>

        <!-- 评审意见显示 -->
        <div v-if="(isResubmit || isImprovement) && reviewComments" class="form-section">
          <div class="section-header">
            <h3>
              <ExclamationCircleOutlined />
              {{ isImprovement ? '整改要求' : '审核意见' }}
            </h3>
            <p>请仔细阅读以下{{ isImprovement ? '整改要求' : '审核意见' }}，并据此修改完善申请材料</p>
          </div>
          <div class="review-comments-content">
            <a-alert
              :message="isImprovement ? '验收会议整改要求' : '材料审核意见'"
              :type="isImprovement ? 'warning' : 'error'"
              show-icon
            >
              <template #description>
                <div class="comments-text">{{ reviewComments }}</div>
              </template>
            </a-alert>
          </div>
        </div>

        <!-- 材料上传 -->
        <div class="form-section">
          <div v-if="isResubmit || isImprovement" class="resubmit-notice">
            <a-alert
              :message="isImprovement ? '整改材料提交' : '重新提交提醒'"
              :description="isImprovement ? 
                '请根据验收会议的整改要求，上传相应的整改材料和说明文档。' : 
                '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
              :type="isImprovement ? 'warning' : 'info'"
              show-icon
              style="margin-bottom: 16px"
            />
          </div>
          
          <!-- 使用材料模板同步组件 -->
          <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="acceptance"
            :key="`material-sync-${Date.now()}`"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
          />
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <a-space>
            <!-- <a-button @click="handleSaveDraft">
              <SaveOutlined />
              保存草稿
            </a-button> -->
            <a-button type="primary" html-type="submit">
              <SendOutlined />
              提交申请
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 提交验收申请页面 - 申报单位角色
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
import dayjs from 'dayjs'
import { getAvailableProjectsForAcceptance } from '@/api/th_qd/acceptance/project'
import { 
  createProposalApplication,
  updateProposalApplication,
  saveProposalApplicationDraft,
  checkProjectAcceptanceStatus,
  getProposalMaterialPage,
  createProposalMaterial,
  updateProposalMaterial,
  deleteProposalMaterial
} from '@/api/th_qd/acceptance/acceptance'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'
import MaterialTemplateSync from '@/components/th_qd/MaterialTemplateSync.vue'

import { useUserStore } from '@/store/modules/user'//获取登录信息

const router = useRouter()
const formRef = ref()
const materialTemplateSyncRef = ref()

// 按钮加载状态
const savingDraft = ref(false)
const submitting = ref(false)

// 材料模板同步相关状态
const materialValidation = ref({
  allRequiredUploaded: false,
  uploadedCount: 0,
  totalCount: 0
})
const uploadedMaterials = ref([])

// 判断是否是重新提交模式
const isResubmit = computed(() => {
  return router.currentRoute.value.query.resubmit === 'true'
})

// 判断是否是整改材料提交模式
const isImprovement = computed(() => {
  return router.currentRoute.value.query.improvement === 'true'
})

/**
 * 页面标题
 * @type {ComputedRef<string>}
 */
const pageTitle = computed(() => {
  if (isImprovement.value) {
    return '提交整改材料'
  } else if (isResubmit.value) {
    return '重新提交验收申请'
  } else {
    return '提交验收申请'
  }
})

/**
 * 页面描述
 * @type {ComputedRef<string>}
 */
const pageDescription = computed(() => {
  if (isImprovement.value) {
    return '根据验收会议的整改要求，提交相应的整改材料和说明'
  } else if (isResubmit.value) {
    return '根据审核意见修改完善后重新提交验收申请'
  } else {
    return '填写项目验收申请信息并上传相关材料'
  }
})

// 表单数据
const formData = ref({
  projectId: undefined,
  expectedAcceptanceTime: undefined,
  acceptanceType: undefined,
  description: '',
  remarks: '',
  createTime: undefined
})

// 表单验证规则
const rules = {
  projectId: [{ required: true, message: '请选择项目' }],
  expectedAcceptanceTime: [{ required: true, message: '请选择预期验收时间' }],
  acceptanceType: [{ required: true, message: '请选择验收类型' }],
  description: [{ required: true, message: '请填写申请说明' }]
}

// 可选择的项目列表
const availableProjects = ref([])

// 项目状态映射 (使用approval中的ProjectStatus枚举)
const projectStatusMap = {
  0: '草稿',
  1: '材料审核中',
  2: '材料驳回',
  3: '会议待组织',
  4: '会议已安排',
  5: '会议进行中',
  6: '有条件通过',
  7: '整改中',
  8: '立项通过',
  9: '立项未通过'
}

// 获取项目状态颜色
const getProjectStatusColor = (status) => {
  const colorMap = {
    '草稿': 'default',
    '材料审核中': 'processing',
    '材料驳回': 'error',
    '会议待组织': 'warning',
    '会议已安排': 'processing',
    '会议进行中': 'processing',
    '有条件通过': 'warning',
    '整改中': 'warning',
    '立项通过': 'success',
    '立项未通过': 'error'
  }
  return colorMap[status] || 'default'
}

// 验收类型映射
const acceptanceTypeMap = {
  0: '结题验收',
  1: '阶段验收',
  2: '专项验收'
}

// 获取验收类型文字描述
const getAcceptanceTypeText = (type) => {
  return acceptanceTypeMap[type] || '未知类型'
}

// 获取可选项目列表
const loadAvailableProjects = async () => {
  try {
    console.log('开始加载项目列表...')
    
    const params = {
      pageNo: 1,
      pageSize: 100,
      applicant: useUserStore().getUser.nickname || '', // 获取当前登录用户的昵称，如果不存在则为空字符串
      // 暂时不限制项目状态，看看是否能获取到数据
      // projectStatus: [1, 2] // 只获取可申请开题的项目
    }
    
    console.log('请求参数:', params)
    
    const response = await getAvailableProjectsForAcceptance(params)
    
    console.log('API响应:', response)
    console.log('响应数据结构:', {
      hasList: !!response?.list,
      listLength: response?.list?.length || 0,
      total: response?.total || 0
    })
    
    if (response && response.list) {
      console.log('原始项目数据:', response.list)
      
      availableProjects.value = response.list.map(project => ({
        id: project.id,
        name: project.projectName,
        code: project.projectNo, // 使用projectNo作为项目编号
        status: projectStatusMap[project.status] || '未知',
        startDate: project.expectedProjectTime,
        endDate: project.expectedProjectTime, // 暂时使用预期时间
        leader: project.applicant,
        budget: project.budget
      }))
      
      console.log('转换后的项目数据:', availableProjects.value)
      console.log('项目数量:', availableProjects.value.length)
      
      // 显示成功消息
      message.success(`成功加载 ${response.total} 个项目`)
    } else {
      console.log('响应数据为空或格式不正确')
      console.log('response:', response)
      
      if (response && response.total === 0) {
        message.info('暂无可用项目')
      } else {
        message.warning('项目数据格式不正确')
      }
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    console.error('错误详情:', error.response || error.message)
    message.error(`获取项目列表失败: ${error.message || '未知错误'}`)
  }
}

// 选中的项目
const selectedProject = computed(() => {
  return availableProjects.value.find(p => p.id === formData.value.projectId)
})

// 必需材料配置
const requiredMaterials = ref([
  {
    key: 'acceptance_report',
    name: '项目验收报告',
    description: '详细的项目验收报告，包含项目完成情况、技术指标等',
    fileList: []
  },
  {
    key: 'summary_report',
    name: '项目总结报告',
    description: '项目实施过程总结，包含经验教训、改进建议等',
    fileList: []
  },
  {
    key: 'achievement_materials',
    name: '成果汇总材料',
    description: '项目产出的各类成果材料，如软件、报告、专利等',
    fileList: []
  },
  {
    key: 'financial_report',
    name: '财务决算报告',
    description: '项目资金使用情况的详细财务报告',
    fileList: []
  }
])

// 可选材料配置
const optionalMaterials = ref([
  {
    key: 'ip_list',
    name: '知识产权清单',
    description: '项目产生的专利、软著等知识产权清单',
    fileList: []
  },
  {
    key: 'test_report',
    name: '测试报告',
    description: '系统测试、性能测试等相关测试报告',
    fileList: []
  },
  {
    key: 'user_manual',
    name: '用户手册',
    description: '系统使用手册、操作指南等文档',
    fileList: []
  },
  {
    key: 'other_materials',
    name: '其他材料',
    description: '其他与项目验收相关的补充材料',
    fileList: []
  }
])

// 提交状态 (已在前面声明)

// 审核意见
const reviewComments = ref('')

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})



// 项目选择过滤
const filterOption = (input, option) => {
  const project = availableProjects.value.find(p => p.id === option.value)
  return project && (
    project.name.toLowerCase().includes(input.toLowerCase()) ||
    project.code.toLowerCase().includes(input.toLowerCase())
  )
}

// 项目选择变更处理
const handleProjectChange = async (projectId) => {
  if (!projectId) return
  
  console.log('Selected project:', projectId)
  
  // 暂时禁用项目状态检查，因为后端API不存在
  // TODO: 等后端提供项目状态检查API后再启用
  try {
    // 基本验证：检查项目是否存在
    const selectedProject = availableProjects.value.find(p => p.id === projectId)
    if (selectedProject) {
      message.success('项目选择成功，可以继续填写申请信息')
      
      // 可以在这里添加其他基本验证逻辑
      // 比如：检查项目状态是否为可申请状态
      if (selectedProject.status === '立项通过') {
        console.log('项目状态符合开题条件')
      } else {
        console.log('项目状态:', selectedProject.status)
      }
    } else {
      message.error('项目不存在，请重新选择')
      formData.value.projectId = undefined
    }
  } catch (error) {
    console.error('项目选择处理失败:', error)
    message.error('项目选择失败，请重试')
  }
}

// 日期禁用规则
const disabledDate = (current) => {
  // 不能选择今天之前的日期
  return current && current < dayjs().startOf('day')
}

// 事件处理方法
const goBack = () => {
  router.go(-1)
}



const handleMaterialUpload = (info, materialKey) => {
  // 找到对应的材料配置
  let material = requiredMaterials.value.find(m => m.key === materialKey)
  if (!material) {
    material = optionalMaterials.value.find(m => m.key === materialKey)
  }
  
  if (material) {
    material.fileList = info.fileList
  }
}

// 预览材料文件
const previewMaterial = (file) => {
  currentPreviewFile.value = {
    id: file.uid,
    name: file.name,
    type: file.type,
    size: file.size,
    url: file.url || URL.createObjectURL(file.originFileObj || file),
    uploadTime: new Date().toLocaleString()
  }
  
  previewVisible.value = true
}

// 下载材料文件
const downloadMaterial = (file) => {
  const link = document.createElement('a')
  link.href = file.url || URL.createObjectURL(file.originFileObj || file)
  link.download = file.name
  link.click()
  
  message.success(`正在下载：${file.name}`)
}

// 处理文件下载事件
const handleDownloadFile = (fileInfo) => {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  link.click()
  
  message.success(`正在下载：${fileInfo.name}`)
}

// 删除材料文件
const removeMaterial = (material, file) => {
  const index = material.fileList.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    material.fileList.splice(index, 1)
    message.success('文件删除成功')
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return ''
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

// 材料模板同步组件事件处理
const handleFilesChange = (event) => {
  const { configId, file, action } = event
  
  if (action === 'add') {
    uploadedMaterials.value.push({ configId, file })
  } else if (action === 'remove') {
    const index = uploadedMaterials.value.findIndex(item => item.configId === configId)
    if (index > -1) {
      uploadedMaterials.value.splice(index, 1)
    }
  }
}

const handleValidationChange = (validation) => {
  materialValidation.value = validation
}

const handleConfigUpdate = (configs) => {
  console.log('开题材料配置已更新:', configs)
}

const handleSaveDraft = async () => {
  try {
    savingDraft.value = true
    
    // 验证必填字段
    if (!formData.value.projectId) {
      message.error('请先选择项目')
      return
    }
    
    // 构建草稿数据 - 严格按照API文档的字段要求
    const draftData = {
      projectId: Number(formData.value.projectId), // 项目ID，确保是数字类型
      applicationNo: '', // 申请编号，草稿时为空字符串
      acceptanceType: Number(formData.value.acceptanceType), // 申请类型，确保是数字类型
      applicationStatus: 0, // 申请状态：0-草稿 (DRAFT)
      expectedAcceptanceTime: formData.value.expectedAcceptanceTime ? dayjs(formData.value.expectedAcceptanceTime).format('YYYY-MM-DD') : undefined,
      applicationDescription: formData.value.description || '',
      notes: formData.value.remarks || '',
      createTime: new Date().toISOString(), // 创建时间
      // 草稿也可以包含材料信息
      acceptanceMaterialDOList: uploadedMaterials.value.map(item => {
        // 安全地获取文件名和提取后缀
        const fileName = item.file?.name || item.file?.response?.name || item.file?.fileName || 'unknown'
        const fileSuffix = fileName.includes('.') ? fileName.includes('.') ? fileName.split('.').pop() : '' : ''
        
        return {
          projectId: Number(formData.value.projectId), // 项目ID，确保是数字类型
          materialType: Number(item.configId), // 材料类型ID，确保是数字
          materialName: item.config?.categoryName || '未知材料',
          fileUrl: item.file?.url || item.file?.response?.url || item.file?.fileUrl || '',
          fileSize: Number(item.file?.size || item.file?.fileSize || 0), // 文件大小，确保是数字
          fileSuffix: fileSuffix,
          isRequired: Boolean(item.config?.isRequired), // 是否必传，确保是布尔值
          sort: Number(item.config?.sort || 0) // 排序，确保是数字
        }
      })
    }
    
    console.log('保存草稿数据:', draftData)
    
    // 调用API保存草稿
    const response = await saveAcceptanceApplicationDraft(draftData)
    
    if (response.code === 200) {
    message.success('草稿保存成功')
      // 可以在这里保存草稿ID，用于后续更新
      const draftId = response.data
      console.log('草稿ID:', draftId)
    } else {
      message.warning(`草稿保存失败: ${response.msg}`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    message.error(`保存草稿失败: ${error.message || '未知错误'}`)
  } finally {
    savingDraft.value = false
  }
}

const handleSubmit = async (values) => {
  submitting.value = true
  
  try {
    // 验证必传材料是否已上传
    if (!materialValidation.value.allRequiredUploaded) {
      const validation = materialTemplateSyncRef.value?.validateRequiredFiles()
      if (validation && !validation.valid) {
        message.error(`请上传以下必传材料：${validation.missingFiles.join('、')}`)
        return
      }
    }
    
    // 获取所有上传的文件
    const allUploadedFiles = materialTemplateSyncRef.value?.getAllUploadedFiles() || []
    
    // 检查当前路由参数，判断是否为重新提交
    const route = router.currentRoute.value
    const isResubmit = route.query.resubmit === 'true'
    const isImprovement = route.query.improvement === 'true'
    const applicationId = route.query.applicationId
    
    console.log('提交模式判断:', { isResubmit, isImprovement, applicationId })
    
    // 构建基础数据
    const basePayload = {
      projectId: Number(values.projectId),
      applicationNo: isResubmit || isImprovement ? 
        `YS${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` : 
        `YS${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      acceptanceType: Number(values.acceptanceType),
      applicationStatus: isImprovement ? 8 : 1, // 整改中: 8, 材料审核中: 1
      expectedAcceptanceTime: values.expectedAcceptanceTime ? dayjs(values.expectedAcceptanceTime).format('YYYY-MM-DD') : undefined,
      applicationDescription: values.description || '',
      notes: values.remarks || '',
      createTime: new Date().toISOString()
    }
    
    console.log('基础数据:', basePayload)
    
    let finalApplicationId = applicationId
    
    // 根据模式决定是创建还是更新申请
    if (isResubmit || isImprovement) {
      // 重新提交或整改：更新现有申请
      console.log('更新模式：更新现有申请')
      const updateData = {
        ...basePayload,
        id: Number(applicationId)
      }
      
      console.log('更新申请数据:', updateData)
      const updateResponse = await updateProposalApplication(updateData)
      console.log('更新申请响应:', updateResponse)
      
      finalApplicationId = applicationId
    } else {
      // 新提交：创建新申请
      console.log('创建模式：创建新申请')
      const createData = {
        ...basePayload,
        id: 0
      }
      
      console.log('创建申请数据:', createData)
      const createResponse = await createProposalApplication(createData)
      console.log('创建申请响应:', createResponse)
      
      // 获取申请ID
      if (typeof createResponse === 'object' && createResponse.code === 0) {
        finalApplicationId = createResponse.data
      } else if (typeof createResponse === 'number') {
        finalApplicationId = createResponse
      } else {
        console.error('未知的响应格式:', createResponse)
        message.error('申请创建失败：响应格式错误')
        return
      }
    }
    
    console.log('最终申请ID:', finalApplicationId)
    
    // 处理材料：智能更新逻辑
    if (allUploadedFiles.length > 0) {
      console.log('开始处理材料...')
      
      if (isResubmit || isImprovement) {
        console.log('重新提交模式：获取现有材料进行对比')
        
        try {
          // 获取现有材料
          const existingMaterialsResponse = await getProposalMaterialPage({
            pageNo: '1',
            pageSize: '100',
            acceptanceApplicationId: Number(finalApplicationId)
          })
          
          console.log('现有材料响应:', existingMaterialsResponse)
          const existingMaterials = existingMaterialsResponse?.list || existingMaterialsResponse?.data?.list || []
          console.log('现有材料列表:', existingMaterials)
          
          // 构建新材料数据
          const newMaterialsData = allUploadedFiles
            .filter(item => item && item.file)
            .map((item, index) => {
              const fileName = item.file?.name || item.file?.response?.name || item.file?.fileName || 'unknown'
              const fileSuffix = fileName.includes('.') ? fileName.split('.').pop() : ''
              return {
                id: 0, // 新材料的ID设为0
                projectId: Number(values.projectId),
                acceptanceApplicationId: Number(finalApplicationId),
                materialType: Number(item.config?.materialType ?? 5),
                materialName: item.config?.categoryName || '未知材料',
                fileUrl: item.file?.url || item.file?.response?.url || item.file?.fileUrl || '',
                fileSize: Number(item.file?.size || item.file?.response?.size || item.file?.fileSize || 0),
                fileSuffix: fileSuffix,
                isRequired: Boolean(item.config?.isRequired),
                reviewStatus: 0,
                sort: Number(item.config?.sort ?? index)
              }
            })
          
          console.log('新材料数据:', newMaterialsData)
          
          // 智能更新：存在则更新，不存在则创建，多余的删除
          const materialResults = []
          
          for (const newMaterial of newMaterialsData) {
            // 查找是否有相同类型的现有材料
            const existingMaterial = existingMaterials.find(existing => 
              existing.materialType === newMaterial.materialType
            )
            
            if (existingMaterial) {
              // 更新现有材料
              console.log('更新材料:', existingMaterial.id, '->', newMaterial)
              const updateMaterialData = {
                ...newMaterial,
                id: existingMaterial.id
              }
              const updateResult = await updateProposalMaterial(updateMaterialData)
              materialResults.push(updateResult)
            } else {
              // 创建新材料
              console.log('创建新材料:', newMaterial)
              const createResult = await createProposalMaterial(newMaterial)
              materialResults.push(createResult)
            }
          }
          
          // 删除不再需要的材料
          const newMaterialTypes = newMaterialsData.map(m => m.materialType)
          const materialsToDelete = existingMaterials.filter(existing => 
            !newMaterialTypes.includes(existing.materialType)
          )
          
          for (const materialToDelete of materialsToDelete) {
            console.log('删除多余材料:', materialToDelete.id)
            await deleteProposalMaterial(materialToDelete.id)
          }
          
          console.log('材料处理结果:', materialResults)
          
        } catch (materialError) {
          console.error('获取现有材料失败，将全部创建新材料:', materialError)
          
          // 如果获取现有材料失败，则全部创建新材料
          const materialsData = allUploadedFiles
            .filter(item => item && item.file)
            .map((item, index) => {
              const fileName = item.file?.name || item.file?.response?.name || item.file?.fileName || 'unknown'
              const fileSuffix = fileName.includes('.') ? fileName.split('.').pop() : ''
              return {
                id: 0,
                projectId: Number(values.projectId),
                acceptanceApplicationId: Number(finalApplicationId),
                materialType: Number(item.config?.materialType ?? 5),
                materialName: item.config?.categoryName || '未知材料',
                fileUrl: item.file?.url || item.file?.response?.url || item.file?.fileUrl || '',
                fileSize: Number(item.file?.size || item.file?.response?.size || item.file?.fileSize || 0),
                fileSuffix: fileSuffix,
                isRequired: Boolean(item.config?.isRequired),
                reviewStatus: 0,
                sort: Number(item.config?.sort ?? index)
              }
            })
          
          const results = await Promise.all(
            materialsData.map(material => createProposalMaterial(material))
          )
          console.log('全部创建材料结果:', results)
        }
      } else {
        // 新提交：直接创建所有材料
        console.log('新提交模式：创建所有材料')
        const materialsData = allUploadedFiles
          .filter(item => item && item.file)
          .map((item, index) => {
            const fileName = item.file?.name || item.file?.response?.name || item.file?.fileName || 'unknown'
            const fileSuffix = fileName.includes('.') ? fileName.split('.').pop() : ''
            return {
              id: 0,
              projectId: Number(values.projectId),
              acceptanceApplicationId: Number(finalApplicationId),
              materialType: Number(item.config?.materialType ?? 5),
              materialName: item.config?.categoryName || '未知材料',
              fileUrl: item.file?.url || item.file?.response?.url || item.file?.fileUrl || '',
              fileSize: Number(item.file?.size || item.file?.response?.size || item.file?.fileSize || 0),
              fileSuffix: fileSuffix,
              isRequired: Boolean(item.config?.isRequired),
              reviewStatus: 0,
              sort: Number(item.config?.sort ?? index)
            }
          })
        
        const results = await Promise.all(
          materialsData.map(material => createProposalMaterial(material))
        )
        console.log('创建材料结果:', results)
      }
    }
    
    // 根据提交类型显示不同的成功消息
    if (isResubmit) {
      message.success('材料重新提交成功，状态已更新为材料审核中')
    } else if (isImprovement) {
      message.success('整改材料提交成功')
    } else {
      message.success('验收申请提交成功')
    }
    
    // 跳转到管理页面
    router.push('/th-qd-project/acceptance/applicant/manage')
    
  } catch (error) {
    console.error('提交失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    message.error(`提交失败: ${error.message || '未知错误'}`)
  } finally {
    submitting.value = false
  }
}

// 表单提交处理
const handleSubmitForm = () => {
  formRef.value?.validate().then((values) => {
    handleSubmit(values)
  }).catch((error) => {
    console.error('表单验证失败:', error)
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  formData.value = {
    projectId: undefined,
    expectedAcceptanceTime: undefined,
    acceptanceType: undefined,
    description: '',
    remarks: ''
  }
  message.success('表单已重置')
}

// 生命周期
onMounted(async () => {
  // 加载可选项目列表
  await loadAvailableProjects()
  
  const route = router.currentRoute.value
  
  // 检查是否是重新提交
  if (route.query.resubmit === 'true') {
    // 自动填充项目信息
    if (route.query.projectId) {
      // 根据项目ID查找对应的项目
      const projectId = parseInt(route.query.projectId)
      const project = availableProjects.value.find(p => p.id === projectId)
      if (project) {
        formData.value.projectId = projectId
      }
    }
    
    // 自动填充预期验收时间
    if (route.query.expectedTime) {
      console.log('接收到的预期验收时间参数:', route.query.expectedTime)
      formData.value.expectedAcceptanceTime = dayjs(route.query.expectedTime)
      console.log('转换后的预期验收时间:', formData.value.expectedAcceptanceTime)
    }
    
    // 自动填充申请说明
    if (route.query.description) {
      // formData.value.description = decodeURIComponent(route.query.description)
      formData.value.description = ''

    } else {
      // 如果是整改模式且没有提供description参数，则清空整改说明
      formData.value.description = ''
    }
    
    // 接收审核意见（优先使用rejectionReason，兼容reviewComments）
    if (route.query.rejectionReason) {
      reviewComments.value = decodeURIComponent(route.query.rejectionReason)
    } else if (route.query.reviewComments) {
      reviewComments.value = decodeURIComponent(route.query.reviewComments)
    }
    
    // 设置默认验收类型
    formData.value.acceptanceType = "2" // 默认验收类型
    
    // 显示重新提交提示
    message.info('已自动填充项目信息，请重新上传验收材料并完善申请信息')
  }
  
  // 检查是否是提交整改材料
  if (route.query.improvement === 'true') {
    // 自动填充项目信息
    if (route.query.projectId) {
      const projectId = parseInt(route.query.projectId)
      const project = availableProjects.value.find(p => p.id === projectId)
      if (project) {
        formData.value.projectId = projectId
      }
    }
    
    // 自动填充预期验收时间
    if (route.query.expectedTime) {
      console.log('接收到的预期验收时间参数:', route.query.expectedTime)
      formData.value.expectedAcceptanceTime = dayjs(route.query.expectedTime)
      console.log('转换后的预期验收时间:', formData.value.expectedAcceptanceTime)
    }
    
    // 如果是整改模式，直接清空整改说明
    if (route.query.improvement === 'true') {
      formData.value.description = ''
    } else if (route.query.description) {
      // 非整改模式下，如果有description参数则填充
      formData.value.description = decodeURIComponent(route.query.description)
    }
    
    // 接收整改要求
    if (route.query.improvementRequirements) {
      reviewComments.value = decodeURIComponent(route.query.improvementRequirements)
    }
    
    // 设置默认验收类型
    formData.value.acceptanceType = "2" // 默认验收类型
    
    // 显示整改材料提交提示
    message.info('已自动填充项目信息，请根据整改要求上传相关验收材料')
  }
  
  // 检查验收类型和备注说明参数
  if (route.query.notes) {
    // 如果存在acceptanceType参数，设置验收类型
    if (route.query.acceptanceType === '1') {
      formData.value.acceptanceType = "1"
      message.info('已自动填充阶段验收的备注说明')
    }
    // 从路由参数中获取备注说明并回显
    formData.value.remarks = decodeURIComponent(route.query.notes)
  }
})
</script>
<style scoped>
.submit-container {
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

/* 表单区域样式 */
.form-section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  color: #8c8c8c;
  margin: 0;
}

.section-content {
  margin-bottom: 16px;
}

/* 项目选择样式 */
.selected-project-info {
  margin-top: 16px;
}

.project-option {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-weight: 500;
}

.project-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 材料上传样式 */
.material-group {
  margin-bottom: 24px;
}

.material-group h4 {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 8px 0;
}

.material-tip {
  color: #8c8c8c;
  font-size: 13px;
  margin: 0 0 16px 0;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.material-desc {
  font-size: 13px;
  color: #8c8c8c;
}

.material-upload {
  min-width: 120px;
  display: flex;
  justify-content: flex-end;
}

/* 评审意见显示样式 */
.review-comments-content {
  margin-top: 16px;
}

.comments-text {
  white-space: pre-line;
  line-height: 1.6;
  color: #262626;
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px;
}

/* 重新提交提醒样式 */
.resubmit-notice {
  margin-top: 16px;
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .material-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .material-upload {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>