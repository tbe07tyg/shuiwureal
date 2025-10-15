<!--
 * @file 提交立项申请页面 - 申报单位角色
 * @description 申报单位提交新的项目立项申请
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
        <!-- <a-button type="dashed" @click="openNewOnlineForm" style="margin-right: 8px;">
          <ExperimentOutlined />
          体验新版在线填报
        </a-button>
        <a-button type="dashed" @click="openBudgetOnline" style="margin-right: 8px;">
          <MoneyCollectOutlined />
          体验经费预算在线填报
        </a-button> -->
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


        <!-- 申请信息 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <FileTextOutlined />
              申请信息
            </h3>
            <p>填写立项申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-form-item
              label="立项名称"
              name="projectName"
              :rules="[{ required: true, message: '请输入立项名称' }]"
            >
              <a-input
                v-model:value="formData.projectName"
                placeholder="请输入立项名称"
                size="large"
              />
            </a-form-item>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="年度"
                  name="year"
                  :rules="[{ required: true, message: '请选择年度' }]"
                >
                  <a-select
                    v-model:value="formData.year"
                    placeholder="请选择年度"
                    size="large"
                    allow-clear
                  >
                    <a-select-option v-for="year in yearOptions" :key="year" :value="year">
                      {{ year }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="申请人"
                  name="applicant"
                  :rules="[{ required: true, message: '请输入申请人姓名' }]"
                >
                  <a-input
                    v-model:value="formData.applicant"
                    placeholder="请输入申请人姓名"
                    size="large"
                    disabled
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="申请单位"
                  name="department"
                  :rules="[{ required: true, message: '请输入申请单位' }]"
                >
                  <a-input
                    v-model:value="formData.department"
                    placeholder="请输入申请单位"
                    size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="项目周期(月)"
                  name="duration"
                  :rules="[{ required: true, message: '请输入项目周期' }]"
                >
                  <a-input-number
                    v-model:value="formData.duration"
                    placeholder="请输入项目周期"
                    size="large"
                    :min="1"
                    :max="60"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预算(万元)"
                  name="budget"
                  :rules="[{ required: true, message: '请输入项目预算' }]"
                >
                  <a-input-number
                    v-model:value="formData.budget"
                    placeholder="请输入项目预算"
                    size="large"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预期立项时间"
                  name="expectedDate"
                  :rules="[{ required: true, message: '请选择预期立项时间' }]"
                >
                  <a-date-picker
                    v-model:value="formData.expectedDate"
                    placeholder="请选择预期立项时间"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                  />
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
                :placeholder="isImprovement ? '请详细说明针对整改要求的整改措施和完成情况' : '请详细说明项目完成情况、主要成果及立项准备情况'"
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
              :message="isImprovement ? '立项会议整改要求' : '材料审核意见'"
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
                '请根据立项会议的整改要求，上传相应的整改材料和说明文档。' : 
                '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
              :type="isImprovement ? 'warning' : 'info'"
              show-icon
              style="margin-bottom: 16px"
            />
          </div>
  
          <!-- 使用材料模板同步组件 -->
          <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="apply"
            :project-data="formData"
            :key="`material-sync-${Date.now()}`"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
            @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError"
            @upload-progress="handleUploadProgress"
          />

        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <a-space>
            <!-- <a-button @click="handleSaveDraft">
              <SaveOutlined />
              保存草稿
            </a-button> -->
            <a-button type="primary" html-type="submit" @click="CreateProject" :loading="submitting">
              <SendOutlined />
              提交申请
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>

  <!-- 在线填报弹窗 -->
  <!-- <a-modal
    v-model:open="onlineFormModalVisible"
    title="在线填报"
    width="80%"
    :footer="null"
    @cancel="handleOnlineFormModalCancel"
  >
    <div class="online-form-modal-content">
      <p>请选择您要进行的在线填报类型：</p>
      <div class="online-form-options">
        <a-card hoverable class="form-option-card" @click="openNewOnlineForm">
          <template #cover>
            <div class="card-cover">
              <ExperimentOutlined style="font-size: 48px; color: #1890ff;" />
            </div>
          </template>
          <a-card-meta title="新版在线填报" description="使用新版在线填报系统提交项目申请" />
        </a-card>
        <a-card hoverable class="form-option-card" @click="openBudgetOnline">
          <template #cover>
            <div class="card-cover">
              <MoneyCollectOutlined style="font-size: 48px; color: #52c41a;" />
            </div>
          </template>
          <a-card-meta title="经费预算在线填报" description="使用在线系统填写项目经费预算" />
        </a-card>
      </div>
    </div>
  </a-modal> -->
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import FilePreview from '@/components/th_qd/FilePreview.vue'
import MaterialTemplateSync from '@/components/th_qd/MaterialTemplateSync.vue'
import { 
  createTechnologicalProject, 
  updateTechnologicalProject,
  createTechnologicalProjectMaterial 
} from '@/api/th_qd/approval'
import { getTechnologicalProjectMaterialPage } from '@/api/th_qd/approval'
import { ProjectStatus } from '@/api/th_qd/approval/types'
// import type { TechnologicalProjectMaterialSaveReqVO } from '@/api/th_qd/approval/types'
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
const router = useRouter()
const formRef = ref()
const materialTemplateSyncRef = ref()

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
    return '重新提交立项申请'
  } else {
    return '提交立项申请'
  }
})

/**
 * 页面描述
 * @type {ComputedRef<string>}
 */
const pageDescription = computed(() => {
  if (isImprovement.value) {
    return '根据立项会议的整改要求，提交相应的整改材料和说明'
  } else if (isResubmit.value) {
    return '根据审核意见修改完善后重新提交立项申请'
  } else {
    return '填写项目立项申请信息并上传相关材料'
  }
})

// 年份选项数据
const currentYear = new Date().getFullYear()
const yearOptions = ref(Array.from({ length: 10 }, (_, i) => currentYear - 5 + i))

// 表单数据
const formData = ref({
  year: currentYear,
  projectName: '',
  applicant: useUserStore().getUser.nickname || '系统',
  department: '',
  duration: '',
  budget: '',
  expectedDate: '',
  description: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  year: [{ required: true, message: '请选择年度' }],
  projectName: [{ required: true, message: '请输入立项名称' }],
  applicant: [{ required: true, message: '请输入申请人姓名' }],
  department: [{ required: true, message: '请输入申请单位' }],
  duration: [{ required: true, message: '请输入项目周期' }],
  budget: [{ required: true, message: '请输入项目预算' }],
  expectedDate: [{ required: true, message: '请选择预期立项时间' }],
  description: [{ required: true, message: '请填写申请说明' }]
}



// 必需材料配置
const requiredMaterials = ref([])

// 可选材料配置
const optionalMaterials = ref([])

// 提交状态
const submitting = ref(false)

// 审核意见
const reviewComments = ref('')

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})

// 在线填报弹窗显示状态
const onlineFormModalVisible = ref(false)
const onlineFormFrame = ref(null)

// 经费预算在线填报弹窗显示状态
const budgetFormModalVisible = ref(false)
const budgetFormFrame = ref(null)

// 显示在线填报弹窗
const showOnlineFormModal = () => {
  onlineFormModalVisible.value = true
}

// 处理在线填报弹窗取消
const handleOnlineFormModalCancel = () => {
  onlineFormModalVisible.value = false
}

// 显示经费预算在线填报弹窗
const showBudgetFormModal = () => {
  budgetFormModalVisible.value = true
}

// 处理经费预算在线填报弹窗取消
const handleBudgetFormModalCancel = () => {
  budgetFormModalVisible.value = false
}

// 处理在线表单加载完成
const handleOnlineFormLoad = () => {
  // 可以在这里添加一些加载完成后的操作
  console.log('在线填报表单已加载完成')
  
  // 尝试向iframe传递初始数据
  if (onlineFormFrame.value && formData.value.projectName) {
    try {
      const iframeWindow = onlineFormFrame.value.contentWindow
      if (iframeWindow && iframeWindow.postMessage) {
        iframeWindow.postMessage({
          type: 'INIT_FORM_DATA',
          data: {
            projectName: formData.value.projectName,
            department: formData.value.department,
            budget: formData.value.budget
          }
        }, '*')
      }
    } catch (error) {
      console.error('无法向iframe传递数据:', error)
    }
  }
}

// 处理经费预算表单加载完成
const handleBudgetFormLoad = () => {
  // 可以在这里添加一些加载完成后的操作
  console.log('经费预算表单已加载完成')
  
  // 尝试向iframe传递初始数据
  if (budgetFormFrame.value && formData.value.projectName) {
    try {
      const iframeWindow = budgetFormFrame.value.contentWindow
      if (iframeWindow && iframeWindow.postMessage) {
        iframeWindow.postMessage({
          type: 'INIT_FORM_DATA',
          data: {
            projectName: formData.value.projectName,
            budget: formData.value.budget
          }
        }, '*')
      }
    } catch (error) {
      console.error('无法向iframe传递数据:', error)
    }
  }
}

const CreateProject = async () => {
  if (submitting.value) return false

  try {
    submitting.value = true
    
    // 1. 表单验证
    await formRef.value.validate()
  } catch (error) {
    message.error('请完善表单信息')
    submitting.value = false
    return false
  }

  // 2. 验证必传材料是否已上传
  const validation = materialTemplateSyncRef.value?.validateRequiredFiles()
  if (!validation || !validation.valid) {
    message.error(`请上传必需材料：${validation?.missingFiles?.join('、') || '未知材料'}`)
    submitting.value = false
    return false
  }

  // 3. 获取已上传的文件
  const uploadedFiles = materialTemplateSyncRef.value?.getAllUploadedFiles() || []
  console.log('📁 已上传的文件:', uploadedFiles)

  // 检查当前路由参数，判断是否为重新提交
  const route = router.currentRoute.value
  const isResubmit = route.query.resubmit === 'true'
  const isImprovement = route.query.improvement === 'true'
  const projectId = route.query.projectId ? parseInt(route.query.projectId) : null
  
  console.log('🔍 CreateProject执行模式:', {
    isResubmit,
    isImprovement,
    projectId,
    mode: isResubmit || isImprovement ? 'UPDATE' : 'CREATE',
    uploadedFilesCount: uploadedFiles.length
  })

  const projectData = {
    projectName: formData.value.projectName,
    projectNo: route.query.projectNo,
    yearly: parseInt(formData.value.year),
    applicant: formData.value.applicant,
    applicantUnit: formData.value.department,
    projectCycle: formData.value.duration,
    budget: parseFloat(formData.value.budget), // 确保预算为数字类型
    expectedProjectTime: formData.value.expectedDate?.format ? formData.value.expectedDate.format('YYYY-MM-DD') : formData.value.expectedDate,
    applicationDescription: formData.value.description,
    remark: formData.value.remarks,
    status: isResubmit ? ProjectStatus.MATERIAL_REVIEWING : (isImprovement ? ProjectStatus.RECTIFYING : ProjectStatus.MATERIAL_REVIEWING), // 材料审核中/整改中
    materialReviewResult: 0 // 待处理
  }

  try {
    let response
    let finalProjectId

    if ((isResubmit || isImprovement) && projectId) {
      // 重新提交或整改：更新现有项目
      console.log('🔄 更新现有项目，ID:', projectId)
      projectData.id = projectId
      response = await updateTechnologicalProject(projectData)
      console.log('✅ 更新项目成功:', response)
      finalProjectId = projectId
    } else {
      // 新建项目：创建新项目
      console.log('➕ 创建新项目')
      projectData.projectNo = `PROJ_${Date.now()}`
      projectData.status = isResubmit ? ProjectStatus.MATERIAL_REVIEWING : (isImprovement ? ProjectStatus.RECTIFYING : ProjectStatus.MATERIAL_REVIEWING)
      response = await createTechnologicalProject(projectData)
      console.log('✅ 创建项目成功:', response)
      console.log(response)
      // 获取创建的项目ID
      finalProjectId = response
      if (!finalProjectId) {
        throw new Error('创建项目成功但未返回项目ID')
      }
    }

    // 4. 绑定申请材料到项目
    if (uploadedFiles.length > 0) {
      console.log(`📤 开始绑定 ${uploadedFiles.length} 个材料到项目 ${finalProjectId}`)
      
      const materialPromises = uploadedFiles.map(async (fileData) => {
        const { configId, config, file } = fileData
        const fileSuffix = getFileExtFromUrl(file.fileUrl || file.url)
        // 构造材料数据
        const materialData = {
          projectId: finalProjectId,
          materialType: config.categoryType,
          materialName: config.categoryName || file.fileName || file.name,
          // templateFileName: config.templateFileName,
          fileUrl: file.fileUrl || file.url,
          fileSize: file.fileSize || 0,
          fileSuffix: fileSuffix,
          isRequired: config.isRequired ? 1 : 0,
          reviewStatus: 0, // 待处理
          sort: config.sortOrder || 1
        }
        console.log('📄 绑定材料:', materialData)
        console.log('📄 绑定材料:', {
          configId,
          materialName: materialData.materialName,
          fileUrl: materialData.fileUrl,
          fileSize:file.fileSize,
          isRequired: materialData.isRequired
        })

        return createTechnologicalProjectMaterial(materialData)
      })

      // 并发执行所有材料绑定
      const materialResults = await Promise.allSettled(materialPromises)
      
      // 检查绑定结果
      const successCount = materialResults.filter(result => result.status === 'fulfilled').length
      const failCount = materialResults.filter(result => result.status === 'rejected').length
      
      console.log(`📊 材料绑定结果: 成功 ${successCount}，失败 ${failCount}`)
      
      if (failCount > 0) {
        console.warn('⚠️ 部分材料绑定失败:', materialResults.filter(r => r.status === 'rejected'))
        message.warning(`项目创建成功，但有 ${failCount} 个材料绑定失败`)
      } else {
        console.log('✅ 所有材料绑定成功')
      }
    }

    // 5. 显示成功消息
    if (isResubmit) {
      message.success('材料重新提交成功，状态已更新为材料审核中')
    } else if (isImprovement) {
      message.success('整改材料提交成功')
    } else {
      // message.success(`立项申请提交成功${uploadedFiles.length > 0 ? `，已绑定 ${uploadedFiles.length} 个材料` : ''}`)
    }

    // 6. 清空表单和材料
    formRef.value.resetFields()
    materialTemplateSyncRef.value?.clearAllFiles()
    
    // 7. 返回管理页面
    setTimeout(() => {
      goBack()
    }, 1500)

    return response

  } catch (error) {
    const operation = (isResubmit || isImprovement) ? '更新' : '创建'
    console.error(`❌ ${operation}项目失败:`, error)
    message.error(`${operation}项目失败: ${error.message}`)
    return false
  } finally {
    submitting.value = false
  }
}

function getFileExtFromUrl(url) {
	// 添加参数检查，防止undefined
	if (!url || typeof url !== 'string') {
		console.warn('getFileExtFromUrl: 无效的URL参数', url);
		return '';
	}
	
	try {
		const pathname = new URL(url).pathname; // 更稳健的解析
		const filename = pathname.split('/').pop() || '';
		const match = filename.match(/\.([^.\/?#]+)$/);
		return match ? match[1].toLowerCase() : '';
	} catch (e) {
		console.warn('getFileExtFromUrl: URL解析失败，使用备用方法', e);
		// 兜底：非标准 URL 字符串
		try {
			const clean = url.split(/[?#]/)[0];
			const filename = clean.split('/').pop() || '';
			const idx = filename.lastIndexOf('.');
			return idx > -1 ? filename.slice(idx + 1).toLowerCase() : '';
		} catch (err) {
			console.error('getFileExtFromUrl: 备用方法也失败', err);
			return '';
		}
	}
}

// 日期禁用规则
const disabledDate = (current) => {
  // 不能选择今天之前的日期
  return current && current < dayjs().startOf('day')
}

// 事件处理方法
const goBack = () => {
  router.push('/th-qd-project/approval/approval/applicant/manage')

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

const handleSaveDraft = async () => {
  try {
    // 保存草稿逻辑
    message.success('草稿保存成功')
  } catch (error) {
    message.error('草稿保存失败')
  }
}

const handleSubmit = async (values) => {
  try {
    submitting.value = true
    
    // 检查必需材料是否已上传
    const missingMaterials = requiredMaterials.value.filter(m => m.fileList.length === 0)
    if (missingMaterials.length > 0) {
      message.error(`请上传必需材料：${missingMaterials.map(m => m.name).join('、')}`)
      return
    }
    
    // 检查当前路由参数，判断是否为重新提交
    const route = router.currentRoute.value
    const isResubmit = route.query.resubmit === 'true'
    const isImprovement = route.query.improvement === 'true'
    
    // 构建提交数据
    const submitData = {
      ...values,
      materials: {
        required: requiredMaterials.value.reduce((acc, m) => {
          acc[m.key] = m.fileList
          return acc
        }, {}),
        optional: optionalMaterials.value.reduce((acc, m) => {
          acc[m.key] = m.fileList
          return acc
        }, {})
      },
      // 如果是重新提交材料，需要更新状态为材料审核中
      statusUpdate: isResubmit ? {
        from: 'material_rejected',
        to: 'material_reviewing',
        reason: '用户重新提交材料，状态自动变更为材料审核中'
      } : null,
      // 标记提交类型
      submitType: isResubmit ? 'resubmit' : (isImprovement ? 'improvement' : 'normal'),
      // 项目ID（重新提交时需要）
      projectId: route.query.projectId ? parseInt(route.query.projectId) : values.projectId
    }
    
    // console.log('Submit data:', submitData)
    // console.log('Submit type:', submitData.submitType)
    // if (submitData.statusUpdate) {
    //   console.log('Status will be updated:', submitData.statusUpdate)
    // }
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 根据提交类型显示不同的成功消息
    if (isResubmit) {
      message.success('材料重新提交成功，状态已更新为材料审核中')
    } else if (isImprovement) {
      message.success('整改材料提交成功')
    } else {
      message.success('立项申请提交成功')
    }
    
    goBack()
    
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理材料文件变化
 */
const handleFilesChange = (data) => {
  const { configId, file, action, url, uploadResponse } = data
  console.log('📁 材料文件变化:', {
    configId,
    action,
    fileName: file.name,
    fileUrl: url,
    uploadResponse
  })
  
  if (action === 'uploaded') {
    // 文件上传成功，保存完整的文件信息
    const fileData = {
      configId,
      file,
      url,
      uploadResponse,
      uploadTime: new Date().toISOString()
    }
    uploadedMaterials.value.push(fileData)
    
    console.log('✅ 文件上传成功:', {
      fileName: uploadResponse?.fileName || file.name,
      fileUrl: uploadResponse?.fileUrl || url,
      fileSize: uploadResponse?.fileSize || file.size
    })
    
  } else if (action === 'add') {
    uploadedMaterials.value.push({ configId, file })
  } else if (action === 'remove') {
    const index = uploadedMaterials.value.findIndex(item => item.configId === configId)
    if (index > -1) {
      uploadedMaterials.value.splice(index, 1)
    }
  }
}

/**
 * 处理验证状态变化
 */
const handleValidationChange = (validation) => {
  materialValidation.value = validation
}

/**
 * 处理配置更新
 */
const handleConfigUpdate = (configs) => {
  console.log('立项材料配置已更新:', configs)
}

/**
 * 处理文件上传成功
 */
const handleUploadSuccess = (data) => {
  const { configId, file, url, uploadResponse } = data
  console.log('🎉 文件上传成功:', {
    configId,
    fileName: uploadResponse?.fileName || file.name,
    fileUrl: uploadResponse?.fileUrl || url,
    fileSize: uploadResponse?.fileSize || file.size
  })
  
  // 可以在这里添加额外的成功处理逻辑
  // 比如更新UI状态、发送统计信息等
}

/**
 * 处理文件上传失败
 */
const handleUploadError = (data) => {
  const { configId, error, file } = data
  console.error('❌ 文件上传失败:', {
    configId,
    fileName: file.name,
    error: error.message
  })
  
  message.error(`文件 "${file.name}" 上传失败`)
}

/**
 * 处理文件上传进度
 */
const handleUploadProgress = (data) => {
  const { configId, progress, file } = data
  console.log(`📊 ${file.name} 上传进度: ${progress}%`)
  
  // 可以在这里更新进度条显示
}

/**
 * 从路由参数填充表单数据
 */
const fillFormDataFromRoute = (route) => {
  console.log('📥 从路由参数填充表单数据:', route.query)
  
  // 填充基本项目信息
  if (route.query.projectName) {
    formData.value.projectName = decodeURIComponent(route.query.projectName)
  }
  if (route.query.year) {
    formData.value.year = route.query.year
  }
  if (route.query.applicant) {
    formData.value.applicant = decodeURIComponent(route.query.applicant)
  }
  if (route.query.department) {
    formData.value.department = decodeURIComponent(route.query.department)
  }
  if (route.query.duration) {
    formData.value.duration = parseInt(route.query.duration) || undefined
  }
  if (route.query.budget) {
    formData.value.budget = parseFloat(route.query.budget) || undefined
  }
  if (route.query.expectedDate || route.query.expectedTime) {
    const dateValue = route.query.expectedDate || route.query.expectedTime
    formData.value.expectedDate = dayjs(dateValue)
  }
  if (route.query.description) {
    formData.value.description = decodeURIComponent(route.query.description)
  }
  
  // 如果是整改模式，清空整改说明字段
  if (route.query.improvement === 'true') {
    formData.value.description = ''
  }
  if (route.query.remarks) {
    formData.value.remarks = decodeURIComponent(route.query.remarks)
  } else if (route.query.remark) {
    formData.value.remarks = decodeURIComponent(route.query.remark)
  }
  
  console.log('✅ 表单数据填充完成:', formData.value)
}

// 生命周期
onMounted(() => {
  const route = router.currentRoute.value
  
  // 检查是否是重新提交
  if (route.query.resubmit === 'true') {
    console.log('🔄 检测到重新提交模式')
    
    // 填充基本表单数据
    fillFormDataFromRoute(route)
    
    // 接收审核意见（优先使用rejectionReason，兼容reviewComments）
    if (route.query.rejectionReason) {
      reviewComments.value = decodeURIComponent(route.query.rejectionReason)
    } else if (route.query.reviewComments) {
      reviewComments.value = decodeURIComponent(route.query.reviewComments)
    }
    
    // 显示重新提交提示
    message.info('请重新上传立项材料并完善申请信息')
  }
  
  // 检查是否是提交整改材料
  if (route.query.improvement === 'true') {
    console.log('🔧 检测到整改材料提交模式')
    
    // 填充基本表单数据
    fillFormDataFromRoute(route)
    
    // 接收整改要求
    if (route.query.improvementRequirements) {
      reviewComments.value = decodeURIComponent(route.query.improvementRequirements)
    }
    
    // 显示整改材料提交提示
    message.info('请根据整改要求上传相关材料')
  }
  
  // 强制刷新响应式数据
  nextTick(() => {
    console.log('🔄 强制刷新表单渲染')
  })

  // 预加载历史材料（用于材料驳回后的重新提交场景）
  if (route.query.materials) {
    try {
      const decoded = decodeURIComponent(String(route.query.materials))
      const historyMaterials = JSON.parse(decoded)
      nextTick(() => {
        materialTemplateSyncRef.value?.preloadFiles(historyMaterials)
      })
    } catch (e) {
      console.warn('历史材料预加载失败:', e)
    }
  }

  // 若未携带 materials 参数，则按 projectId 回源拉取上一轮材料并回显
  const needPreloadFromApi = (!route.query.materials) && (route.query.resubmit === 'true' || route.query.improvement === 'true')
  const projectId = route.query.projectId ? parseInt(String(route.query.projectId)) : null
  if (needPreloadFromApi && projectId) {
    ;(async () => {
      try {
        const res = await getTechnologicalProjectMaterialPage({ pageNo: 1, pageSize: 100, projectId })
        const list = (res.list || [])
        const files = list.map((m) => ({
          materialName: m.materialName || m.name,
          fileUrl: m.fileUrl || m.url,
          fileSize: m.fileSize || m.size,
          fileSuffix: m.fileSuffix,
          materialType: m.materialType
        }))
        nextTick(() => materialTemplateSyncRef.value?.preloadFiles(list))
      } catch (e) {
        console.warn('按项目ID回源加载历史材料失败:', e)
      }
    })()
  }
  

  })

// 打开新版在线填报页面
const openNewOnlineForm = () => {
  // 关闭弹窗
  onlineFormModalVisible.value = false
  // 跳转到在线填报页面
  router.push('/th-qd-project/approval/online-form-new')
}

// 打开经费预算在线填报页面
const openBudgetOnline = () => {
  // 关闭弹窗
  onlineFormModalVisible.value = false
  // 跳转到经费预算在线填报页面
  router.push('/th-qd-project/approval/online-budget')
}
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

/* 在线填报弹窗样式 */
.online-form-modal-content {
  padding: 16px 0;
}

.online-form-options {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  justify-content: center;
}

.form-option-card {
  width: 300px;
  cursor: pointer;
  transition: all 0.3s;
}

.form-option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-cover {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}
</style> 