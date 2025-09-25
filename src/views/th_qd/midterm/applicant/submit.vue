<!--
 * @file 提交中期申请页面 - 申报单位角色
 * @description 申报单位提交新的项目中期申请
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
            <p>选择需要申请中期检查的项目</p>
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
                  {{ selectedProject.startDate }}
                </a-descriptions-item>
                <a-descriptions-item label="计划结束时间">
                  {{ selectedProject.endDate }}
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
            <p>填写中期申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预期中期时间"
                  name="expectedDate"
                  :rules="[{ required: true, message: '请选择预期验收时间' }]"
                >
                  <a-date-picker
                    v-model:value="formData.expectedDate"
                    placeholder="请选择预期验收时间"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="中期类型"
                  name="acceptanceType"
                  :rules="[{ required: true, message: '请选择验收类型' }]"
                >
                  <a-select
                    v-model:value="formData.acceptanceType"
                    placeholder="请选择验收类型"
                    size="large"
                  >
                    <a-select-option :value="1">常规中期</a-select-option>
                    <a-select-option :value="2">专项中期</a-select-option>
                    <a-select-option :value="3">延期中期</a-select-option>
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
                placeholder="请详细说明项目进展情况、阶段性成果及中期检查准备情况"
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
              :message="isImprovement ? '中期会议整改要求' : '材料审核意见'"
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
                '请根据中期会议的整改要求，上传相应的整改材料和说明文档。' : 
                '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
              :type="isImprovement ? 'warning' : 'info'"
              show-icon
              style="margin-bottom: 16px"
            />
          </div>
          
          <!-- 使用材料模板同步组件 -->
          <!-- <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="midterm"
            :key="`material-sync-${Date.now()}`"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
          />
        </div> -->
              <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="midterm"
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
 * 
 * 
 * 
 */





















import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import  FilePreview from '@/components/th_qd/FilePreview.vue';
import  MaterialTemplateSync from '@/components/th_qd/MaterialTemplateSync.vue';
import { useUserStore } from '@/store/modules/user'//获取登录用户信息
import { getTechnologicalProject, getTechnologicalProjectPage } from '@/api/th_qd/approval/index';
import { thQdMidAdd ,thQdMidUpdate ,thQdMidMaterialAdd, thQdMidMaterialPage} from '@/api/th_qd/mid/add/index';
import { uploadTechnologicalFile } from '@/api/upload/index';
import { any } from 'vue-types';


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

// 必需材料配置
const requiredMaterials = ref([
  { key: 'report', name: '中期检查报告', fileList: [] },
  { key: 'progress', name: '项目进展报告', fileList: [] }
])

// 可选材料配置
const optionalMaterials = ref([
  { key: 'certificate', name: '获奖证书', fileList: [] },
  { key: 'patent', name: '相关专利', fileList: [] }
])

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
    return '重新提交中期申请'
  } else {
    return '提交中期申请'
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
  expectedDate: undefined,
  acceptanceType: undefined,
  description: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  projectId: [{ required: true, message: '请选择项目' }],
  expectedDate: [{ required: true, message: '请选择预期验收时间' }],
  acceptanceType: [{ required: true, message: '请选择验收类型' }],
  description: [{ required: true, message: '请填写申请说明' }]
}

// 可选择的项目列表
const availableProjects = ref([])

// 选中的项目信息
const selectedProject = computed(() => {
  console.log('selectedProject计算属性被调用，当前projectId:', formData.value.projectId)
  console.log('可用项目列表:', availableProjects.value)
  if (!formData.value.projectId) {
    console.log('未选择项目，返回null')
    return null
  }
  const project = availableProjects.value.find(p => p.id === formData.value.projectId)
  console.log('找到的项目:', project)
  return project
})

// 获取项目列表
const fetchProjects = async () => {
  try {
    const params = {
      pageNo: 1,
      pageSize: 100,
      status: 8, // 只获取立项通过的项目
      applicant: useUserStore().getUser.nickname
    }
    const response = await getTechnologicalProjectPage(params)
    
    // 打印完整响应数据以便调试
    console.log('API完整响应:', JSON.stringify(response, null, 2))
    
    // 检查响应数据是否存在
    if (!response) {
      console.error('API返回数据为空')
      message.error('获取项目列表失败：未收到响应')
      return
    }
    
    // 获取项目列表
    let projectList = []
    
    // 根据控制台日志，API直接返回list和total字段
    if (Array.isArray(response.list)) {
      // API直接返回list数组
      projectList = response.list
    } else if (response.data && Array.isArray(response.data.list)) {
      // 标准格式：response.data.list是数组
      projectList = response.data.list
    } else if (response.code === 0 && response.data && Array.isArray(response.data.list)) {
      // 您提供的格式：response中有code字段，data中有list数组
      projectList = response.data.list
    } else {
      console.error('无法解析项目列表:', response)
      message.error('获取项目列表失败：无法解析数据')
      return
    }
    
    console.log('解析到的项目列表:', projectList)
    
    // 转换API返回的数据格式为前端需要的格式
    const formattedProjects = projectList.map(item => {
      // 处理日期格式
      let startDate = ''
      if (item.createTime) {
        try {
          // 如果是时间戳格式
          startDate = new Date(item.createTime).toISOString().split('T')[0]
        } catch (e) {
          console.error('日期格式化错误:', e)
        }
      }
      
      let endDate = ''
      if (item.expectedProjectTime) {
        try {
          // 如果是数组格式 [2025, 8, 15]
          if (Array.isArray(item.expectedProjectTime)) {
            const [year, month, day] = item.expectedProjectTime
            endDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          } else {
            // 如果是字符串格式
            endDate = new Date(item.expectedProjectTime).toISOString().split('T')[0]
          }
        } catch (e) {
          console.error('日期格式化错误:', e)
        }
      }
      
      return {
        id: item.id,
        name: item.projectName,
        code: item.projectNo,
        status: item.status === 8 ? '立项通过' : '其他状态',
        startDate,
        endDate,
        leader: item.applicant,
        budget: item.budget
      }
    })
    
    availableProjects.value = formattedProjects
    // console.log('格式化后的项目列表:', formattedProjects)
    // console.log('availableProjects.value:', availableProjects.value)
  } catch (error) {
    // console.error('获取项目列表失败:', error)
    // message.error('获取项目列表失败')
  }
}



// 提交状态
const submitting = ref(false)

// 审核意见
const reviewComments = ref('')

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})

// 项目状态颜色
const getProjectStatusColor = (status) => {
  const colorMap = {
    '立项通过': 'blue',
    '实施中': 'blue',
    '即将结束': 'orange',
    '已完成': 'green',
    '暂停': 'red'
  }
  return colorMap[status] || 'default'
}

// 项目选择过滤
const filterOption = (input, option) => {
  const project = availableProjects.value.find(p => p.id === option.value)
  return project && (
    project.name.toLowerCase().includes(input.toLowerCase()) ||
    project.code.toLowerCase().includes(input.toLowerCase())
  )
}

// 日期禁用规则
const disabledDate = (current) => {
  // 不能选择今天之前的日期
  return current && current < dayjs().startOf('day')
}

// 事件处理方法
const goBack = () => {
  router.push({ path: '/th-qd-project/implementation/midterm/midterm/applicant/manage' })
}

const handleProjectChange = (projectId) => {
  // 项目变更时的处理逻辑
  console.log('Selected project:', projectId)
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

// 转换文件对象格式，使其与API期望的格式一致
const normalizeFileObject = (file) => {
  if (!file) return null
  
  // 如果已经是期望的格式，直接返回
  if (file.fileUrl !== undefined) {
    return file
  }
  
  // 否则转换格式
  return {
    fileId: file.fileId || file.uid || null,
    requirementId: file.requirementId || null,
    requirementCode: file.requirementCode || null,
    fileName: file.fileName || file.name || '',
    fileSize: file.fileSize || file.size || 0,
    fileType: file.fileType || file.type || '',
    fileUrl: file.fileUrl || file.url || '',
    uploadTime: file.uploadTime || new Date().getTime()
  }
}

// 获取材料类型ID
const getMaterialType = (key) => {
  const typeMap = {
    'report': 1,     // 中期报告
    'progress': 2,   // 技术方案
    'certificate': 3, // 实施计划
    'patent': 4      // 调研报告
  }
  return typeMap[key] || 5 // 默认为其他类型
}

// 获取文件后缀名
const getFileExtension = (fileName) => {
  if (!fileName) return ''
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return fileName.substring(lastDotIndex + 1).toLowerCase()
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
    
    // 必需材料检查
    // const missingMaterials = requiredMaterials.value.filter(m => m.fileList.length === 0)
    // if (missingMaterials.length > 0) {
    //   message.error(`请上传必需材料：${missingMaterials.map(m => m.name).join('、')}`)
    //   return
    // }
    
    // 检查当前路由参数，判断是否为重新提交
    const route = router.currentRoute.value
    const isResubmit = route.query.resubmit === 'true'
    const isImprovement = route.query.improvement === 'true'
    
    // 获取项目名称
    let projectName = ''
    try {
      const projectId = route.query.projectId ? parseInt(route.query.projectId) : values.projectId
      if (projectId && !isNaN(projectId)) {
        const projectResponse = await getTechnologicalProject(projectId)
        projectName = projectResponse.projectName || ''
      }
    } catch (error) {
      console.error('获取项目名称失败:', error)
      projectName = ''
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
    const midtermMaterialDOList = []
    // 4. 绑定申请材料到项目
    if (uploadedFiles.length > 0) {
      console.log(`📤 开始绑定 ${uploadedFiles.length} 个材料到项目 ${route.query.projectId ? parseInt(route.query.projectId) : values.projectId}`)
      
      const materialPromises = uploadedFiles.map((fileData) => {
        const { configId, config, file } = fileData
        
        // 构造材料数据
        const materialData = {
          projectId: route.query.projectId ? parseInt(route.query.projectId) : values.projectId,
          materialType: 2,
          materialName: file.name || config.categoryName ,
          fileUrl: file.url,
          fileSize: file.fileSize || 0,
          fileSuffix: getFileExtension(file.name || file.fileName),
          isRequired: config.isRequired ? 1 : 0,
          reviewStatus: 0, // 待处理
          sort: config.sortOrder || 1
        }
        console.log('📄 绑定材料:', materialData)
        console.log('📄 绑定材料1:', {
          configId,
          fileSize: materialData.fileSize,
          materialName: materialData.materialName,
          fileUrl: materialData.fileUrl,
          isRequired: materialData.isRequired
        })
        return materialData
      })
      midtermMaterialDOList.push(...materialPromises)

    
    }
    console.log('📄 绑定材料:', midtermMaterialDOList)
    const currentTime = new Date().getTime()
    // 构建提交数据
    const submitData = {
      applicationNo: `PROJ_${currentTime}`, 
      applicationType: values.acceptanceType || 1, // 1:常规中期,2:专项中期,3:延期中期
      applicationStatus: values.applicationStatus || 1, // 1:材料审核中,2:会议待组织,3:会议已安排,4:检查通过,5:有条件通过,6:检查未通过
      expectedMidtermTime: values.expectedDate || '', // 使用表单中的expectedDate
      applicationDescription: values.description || '', // 使用表单中的description
      notes: values.remarks || '', // 使用表单中的remarks
      projectName: projectName, // 添加项目名称
      
      // 项目ID
      projectId: route.query.projectId ? parseInt(route.query.projectId) : values.projectId,
      
      // 注意：材料数据不再包含在申请提交数据中，而是单独提交
      
      // 如果是重新提交材料，需要更新状态为材料审核中
      statusUpdate: isResubmit ? {
        from: 'material_rejected',
        to: 'material_reviewing',
        reason: '用户重新提交材料，状态自动变更为材料审核中'
      } : null,
      
      // 标记提交类型
      submitType: isResubmit ? 'resubmit' : (isImprovement ? 'improvement' : 'normal'),
      midtermMaterialDOList: midtermMaterialDOList
    }
    
    console.log('Submit data:', submitData)
    console.log('Submit type:', submitData.submitType)
    if (submitData.statusUpdate) {
      console.log('Status will be updated:', submitData.statusUpdate)
    }
    

const updateData = {
      id: route.query.id ? parseInt(route.query.id) : null,
      applicationStatus: isResubmit ? 1 : (isImprovement ? 8 : 1),
      statusUpdate: isResubmit ? {
        from: 'material_rejected',
        to: 'material_reviewing',
        reason: '用户重新提交材料，状态自动变更为材料审核中'
      } : null,
      
      // 标记提交类型
      submitType: isResubmit ? 'resubmit' : (isImprovement ? 'improvement' : 'normal'),
      midtermMaterialDOList: midtermMaterialDOList
    }
    console.log('Update data:', updateData)
    console.log('Update type:', updateData.submitType)







    let response
    let finalProjectId

    if ((isResubmit || isImprovement) && route.query.id && updateData.id) {
      // 重新提交或整改：更新现有项目
      console.log('🔄 更新现有项目，ID:', updateData.id)
      // projectData.id = updateData.id
      response = await thQdMidUpdate(updateData)
      console.log('✅ 更新项目成功:', response)
      finalProjectId = updateData.id
    } else {
      // 新建项目：创建新项目
      console.log('➕ 创建新项目')
      response = await thQdMidAdd(submitData)
      console.log('✅ 创建项目成功:', response)
      console.log(response)
      // 获取创建的项目ID
      finalProjectId = response
      if (!finalProjectId) {
        throw new Error('创建项目成功但未返回项目ID')
      }
    }











    // // 调用API提交申请数据
    // const response = await thQdMidAdd(submitData)
    // console.log('申请API响应:', response)
    
    // 获取材料数据
    let materialList = []
    try {
      const materialResponse = await thQdMidMaterialPage({
        pageNo: 1,
        pageSize: 100
      })
      console.log('获取到的材料数据:', materialResponse)
      
      // 从响应中提取材料列表
      if (materialResponse && materialResponse.data && materialResponse.data.list) {
        materialList = materialResponse.data.list
      }
    } catch (error) {
      console.error('获取材料数据失败:', error)
      // 不抛出错误，继续执行，因为材料数据可能不是必需的
    }
    
    // 根据提交类型显示不同的成功消息
    if (isResubmit) {
      message.success('材料重新提交成功，状态已更新为材料审核中')
    } else if (isImprovement) {
      message.success('整改材料提交成功')
    } else {
      message.success('中期申请提交成功')
    }
    
    router.push('/th-qd-project/implementation/midterm/midterm/applicant/manage')
    
  } catch (error) {
    console.log(error)
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理材料文件变化
 */
const handleFilesChange = (data) => {
  const { configId, file, action } = data
  if (action === 'add') {
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
  console.log('中期材料配置已更新:', configs)
}

// 生命周期
onMounted(async () => {
  // 获取项目列表
  await fetchProjects()
  
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
      try {
        // 如果是字符串形式的数组，如"[2025,8,31]"
        if (typeof route.query.expectedTime === 'string' && route.query.expectedTime.startsWith('[')) {
          const timeArray = JSON.parse(route.query.expectedTime);
          if (Array.isArray(timeArray) && timeArray.length >= 3) {
            const [year, month, day] = timeArray;
            formData.value.expectedDate = dayjs(`${year}-${month}-${day}`);
          }
        } else {
          // 尝试直接解析
          formData.value.expectedDate = dayjs(route.query.expectedTime);
        }
      } catch (e) {
        console.error('解析预期时间失败:', e);
        // 如果解析失败，使用当前日期
        formData.value.expectedDate = dayjs();
      }
    }
    
    // 自动填充申请说明 - 整改模式下设置为空
    formData.value.description = '' 
    
    // 自动填充备注说明
    if (route.query.notes) {
      formData.value.remarks = decodeURIComponent(route.query.notes)
    }
    
    // 接收审核意见（优先使用rejectionReason，兼容reviewComments）
    if (route.query.rejectionReason) {
      reviewComments.value = decodeURIComponent(route.query.rejectionReason)
    } else if (route.query.reviewComments) {
      reviewComments.value = decodeURIComponent(route.query.reviewComments)
    }
    
    // 设置验收类型
    if (route.query.applicationType) {
      formData.value.acceptanceType = parseInt(route.query.applicationType);
    } else {
      // 默认设置为常规中期
      formData.value.acceptanceType = 1;
    }
    
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
      try {
        // 如果是字符串形式的数组，如"[2025,8,31]"
        if (typeof route.query.expectedTime === 'string' && route.query.expectedTime.startsWith('[')) {
          const timeArray = JSON.parse(route.query.expectedTime);
          if (Array.isArray(timeArray) && timeArray.length >= 3) {
            const [year, month, day] = timeArray;
            formData.value.expectedDate = dayjs(`${year}-${month}-${day}`);
          }
        } else {
          // 尝试直接解析
          formData.value.expectedDate = dayjs(route.query.expectedTime);
        }
      } catch (e) {
        console.error('解析预期时间失败:', e);
        // 如果解析失败，使用当前日期
        formData.value.expectedDate = dayjs();
      }
    }
    
    // 自动填充申请说明 - 整改模式下设置为空
    formData.value.description = '' 
    
    // 自动填充备注说明
    if (route.query.notes) {
      formData.value.remarks = decodeURIComponent(route.query.notes)
    }
    
    // 接收整改要求
    if (route.query.improvementRequirements) {
      reviewComments.value = decodeURIComponent(route.query.improvementRequirements)
    }
    
    // 设置验收类型
    if (route.query.applicationType) {
      formData.value.acceptanceType = parseInt(route.query.applicationType);
    } else {
      // 默认设置为常规中期
      formData.value.acceptanceType = 1;
    }
    
    // 显示整改材料提交提示
    message.info('已自动填充项目信息，请根据整改要求上传相关材料')
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