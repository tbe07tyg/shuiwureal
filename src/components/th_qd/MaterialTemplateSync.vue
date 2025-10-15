<!--
  @component MaterialTemplateSync
  @description 材料模板同步组件，用于在业务页面中显示和使用配置好的材料模板
  @author 科研管理系统
  @version 1.0.0
  @date 2025-01-22
-->

<template>
  <div class="material-template-sync">
    <!-- 材料提交区域 -->
    <div class="material-submit-section">
      <div class="section-header">
        <h4>
          <FileTextOutlined />
          {{ businessTypeMap[businessType] || '材料' }}提交
        </h4>
        <div class="header-actions">
          <a-button 
            type="link" 
            size="small" 
            @click="refreshConfigs"
            :loading="loading"
          >
            <ReloadOutlined />
            刷新配置
          </a-button>
        </div>
      </div>

      <!-- 材料列表 -->
      <div class="material-list" v-if="materialConfigs.length > 0">
        <div 
          v-for="config in materialConfigs" 
          :key="config.id"
          class="material-item"
          :class="{ 'required': config.isRequired }"
        >
          <div class="material-info">
            <div class="material-title">
              <span class="category-name">
                {{ config.categoryName }}
                <a-tag v-if="config.isRequired" color="red" size="small">必传</a-tag>
                <a-tag v-else color="blue" size="small">选传</a-tag>
              </span>
              <a-tooltip v-if="config.description" :title="config.description">
                <InfoCircleOutlined class="info-icon" />
              </a-tooltip>
            </div>
            
            <div class="material-desc" v-if="config.description">
              {{ config.description }}
            </div>

            <!-- 模板下载 -->
            <div class="template-download" v-if="config.templateFileName">
              <a-button 
                type="link" 
                size="small" 
                @click="downloadTemplate(config)"
                class="template-link"
              >
                <DownloadOutlined />
                下载模板：{{ config.templateFileName }}
              </a-button>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div class="upload-area">
            <a-upload
              :name="`file_${config.id}`"
              :multiple="false"
              :show-upload-list="false"
              :before-upload="(file) => handleBeforeUpload(file, config)"
              class="material-upload"
            >
              <a-button 
                type="primary" 
                :size="config.isRequired ? 'default' : 'small'"
                :danger="config.isRequired && !getUploadedFile(config.id)"
              >
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>

            <!-- 新增：在线填报按钮 -->
            <!-- <a-button 
              v-if="shouldShowOnlineFill(config)"
              type="dashed" 
              :size="config.isRequired ? 'default' : 'small'"
              @click="openOnlineFillForm(config)"
              class="online-fill-btn"
            >
              <EditOutlined />
              在线填报
            </a-button> -->

            <!-- 已上传文件显示 -->
            <div class="uploaded-file" v-if="getUploadedFile(config.id)">
              <div class="file-info">
                <FileOutlined />
                <span class="file-name">{{ getUploadedFile(config.id).fileName }}</span>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(getUploadedFile(config.id).fileSize) }}</span>
                  <span v-if="getUploadedFile(config.id).uploaded" class="upload-status success">✓ 已上传</span>
                  <span v-else class="upload-status pending">⏳ 待上传</span>
                </div>
                <a-button 
                  type="link" 
                  size="small" 
                  danger
                  @click="removeUploadedFile(config.id)"
                  :title="getUploadedFile(config.id).uploaded ? '删除已上传文件' : '移除文件'"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <a-empty 
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无配置的材料类目"
        >
          <a-button type="primary" @click="goToConfigPage">
            前往配置
          </a-button>
        </a-empty>
      </div>

      <!-- 提交验证摘要 -->
      <div class="submit-summary" v-if="materialConfigs.length > 0">
        <a-alert
          :type="allRequiredUploaded ? 'success' : 'warning'"
          :message="getSubmitSummaryMessage()"
          show-icon
        />
      </div>
    </div>

    <!-- 在线填报弹窗 -->
    <OnlineApplicationForm
      v-if="currentOnlineFillConfig"
      v-model:visible="onlineFillVisible"
      :config-id="currentOnlineFillConfig.id"
      :template-data="currentOnlineFillConfig"
      :project-context="getProjectContext()"
      @success="handleOnlineFillSuccess"
      @cancel="handleOnlineFillCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message, Empty } from 'ant-design-vue'
import {
  FileTextOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useMaterialTemplateStore } from '@/store/modules/th_qd/materialTemplate'
import FileUploadService from '@/services/fileUploadService'
import { uploadTechnologicalFile } from '@/api/upload'
import { deleteTechnologicalProjectMaterial, updateTechnologicalProjectMaterial } from '@/api/th_qd/approval'
import OnlineApplicationForm from './OnlineApplicationForm.vue'

/**
 * 组件属性
 */
const props = defineProps({
  // 业务类型：apply, opening, midterm, acceptance
  businessType: {
    type: String,
    required: true,
    validator: (value) => ['apply', 'opening', 'midterm', 'acceptance'].includes(value)
  },
  // 是否自动加载配置
  autoLoad: {
    type: Boolean,
    default: true
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  // 项目数据（用于在线填报自动填充）
  projectData: {
    type: Object,
    default: () => ({})
  }
})

/**
 * 事件定义
 */
const emit = defineEmits([
  'files-change', // 文件变化事件
  'validation-change', // 验证状态变化事件
  'config-update', // 配置更新事件
  'upload-success', // 文件上传成功事件
  'upload-error', // 文件上传失败事件
  'upload-progress' // 文件上传进度事件
])

const router = useRouter()

// 初始化store
const materialTemplateStore = useMaterialTemplateStore()

// 响应式数据
const loading = ref(false)
const materialConfigs = ref([])
const uploadedFiles = ref(new Map()) // 存储已上传的文件 
// 待预加载的历史材料（在配置加载完成后应用）
const pendingPreloadFiles = ref(null)

// 在线填报相关状态
const onlineFillVisible = ref(false)
const currentOnlineFillConfig = ref(null)

// 获取业务类型映射
const { businessTypeMap } = materialTemplateStore

/**
 * 计算属性：检查是否所有必传材料都已上传
 */
const allRequiredUploaded = computed(() => {
  const requiredConfigs = materialConfigs.value.filter(config => config.isRequired)
  return requiredConfigs.every(config => uploadedFiles.value.has(config.id))
})

/**
 * 计算属性：获取提交摘要信息
 */
const getSubmitSummaryMessage = () => {
  const total = materialConfigs.value.length
  const required = materialConfigs.value.filter(config => config.isRequired).length
  const uploaded = uploadedFiles.value.size
  const requiredUploaded = materialConfigs.value
    .filter(config => config.isRequired)
    .filter(config => uploadedFiles.value.has(config.id)).length

  if (allRequiredUploaded.value) {
    return `已上传 ${uploaded}/${total} 个文件，所有必传材料已完成`
  } else {
    return `已上传 ${requiredUploaded}/${required} 个必传材料，还需上传 ${required - requiredUploaded} 个必传文件`
  }
}

/**
 * 获取已上传的文件
 */
const getUploadedFile = (configId) => {
  return uploadedFiles.value.get(configId)
}

/**
 * 刷新配置
 */
const refreshConfigs = async () => {
  await loadConfigs()
}

/**
 * 加载配置数据
 */
const loadConfigs = async () => {
  loading.value = true
  try {
    // 从状态管理中获取配置
    const configs = materialTemplateStore.getConfigsByBusinessType(props.businessType)
    materialConfigs.value = configs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    
    // 触发配置更新事件
    emit('config-update', configs)

    // 如果存在待预加载的历史文件，则在配置加载后应用
    if (pendingPreloadFiles.value && Array.isArray(pendingPreloadFiles.value)) {
      applyPreloadFiles(pendingPreloadFiles.value)
      pendingPreloadFiles.value = null
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    message.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理文件上传前的验证并执行上传
 */
const handleBeforeUpload = async (file, config) => {
  try {
    // 文件验证（使用FileUploadService的验证方法）
    const validation = FileUploadService.validateFile(file, {
      maxSize: 100, // 50MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/csv',
        'text/csv'
      ]
    })
    
    if (!validation.valid) {
      message.error(validation.error)
      emit('upload-error', {
        configId: config.id,
        error: new Error(validation.error),
        file: file
      })
      return false
    }

    // 触发上传开始进度
    emit('upload-progress', {
      configId: config.id,
      progress: 30,
      file: file
    })
    console.log(file)
    // ✅ 直接调用 uploadTechnologicalFile API
    // const response = await uploadTechnologicalFile(file, 'material-templates')
    const response = await uploadTechnologicalFile(file)

    // 触发上传进度
    emit('upload-progress', {
      configId: config.id,
      progress: 80,
      file: file
    })

    console.log(response)

    if (response) {
      // 触发完成进度
      emit('upload-progress', {
        configId: config.id,
        progress: 100,
        file: file
      })

      // ✅ 构建包含完整上传信息的文件对象
      const fileWithUrl = {
        ...file,
        url: response.fileUrl,           // uploadTechnologicalFile 返回的 URL
        uploaded: true,
        uploadTime: new Date().toISOString(),
        
        // ✅ 保存完整的上传响应数据
        uploadResponse: response,        // TechnologicalRequirementAttachmentReqVO
        fileName: response.fileName,
        fileSize: response.fileSize || file.size,
        fileType: response.fileType || file.type,
        fileMd5: response.fileMd5,
        uploader: response.uploader,
        description: response.description
      }
      
      uploadedFiles.value.set(config.id, fileWithUrl)
      // ✅ 触发上传成功事件，传递完整的响应数据
      emit('upload-success', {
        configId: config.id,
        file: fileWithUrl,
        url: response.fileUrl,
        uploadResponse: response       // ✅ 传递给父组件
      })
      
      // ✅ 触发文件变化事件，包含完整信息
      emit('files-change', {
        configId: config.id,
        file: fileWithUrl,
        action: 'uploaded',
        url: response.fileUrl,
        uploadResponse: response       // ✅ 传递给父组件
      })
      
      emit('validation-change', {
        allRequiredUploaded: allRequiredUploaded.value,
        uploadedCount: uploadedFiles.value.size,
        totalCount: materialConfigs.value.length
      })

      message.success(`文件 "${file.name}" 上传成功`)
      
    } else {
      throw new Error(response.msg || '上传失败')
    }
    
  } catch (error) {
    console.error('文件上传失败:', error)
    const errorMessage = error.message || '文件上传失败'
    
    // 触发上传失败事件
    emit('upload-error', {
      configId: config.id,
      error: error,
      file: file
    })
    
    message.error(`文件上传失败：${errorMessage}`)
  }
  
  // 阻止ant-design-vue的默认上传行为
  return false
}

/**
 * 移除已上传的文件
 */
const removeUploadedFile = async (configId) => {
  const file = uploadedFiles.value.get(configId)
  if (file) {
    try {
      if (file.materialRecordId) {
        await deleteTechnologicalProjectMaterial(file.materialRecordId)
      }
    } catch (e) {
      console.warn('删除材料记录失败:', e)
    }
    uploadedFiles.value.delete(configId)
    
    // 触发文件变化事件
    emit('files-change', {
      configId: configId,
      file: file,
      action: 'remove'
    })
    
    // 触发验证状态变化事件
    emit('validation-change', {
      allRequiredUploaded: allRequiredUploaded.value,
      uploadedCount: uploadedFiles.value.size,
      totalCount: materialConfigs.value.length
    })
    
    message.success('文件已移除')
  }
}

/**
 * 下载模板文件
 */
const downloadTemplate = (config) => {
  // 模拟下载模板文件
  message.info(`正在下载模板：${config.templateFileName}`)
  window.open(config.templateFilePath)
  // 实际应用中这里应该调用下载API
  // downloadTemplateAPI(config.templateFilePath)
}

/**
 * 前往配置页面
 */
const goToConfigPage = () => {
  router.push('/settings/material-template')
}

/**
 * 检查是否应该显示在线填报按钮
 */
const shouldShowOnlineFill = (config) => {
  if (!config) return false
  
  // 检查是否有模板文件 - 只要有模板文件就支持在线填报
  const hasTemplateFile = config.templateFilePath && config.templateFilePath.trim()
  
  return hasTemplateFile
}

/**
 * 打开在线填报表单
 */
const openOnlineFillForm = (config) => {
  currentOnlineFillConfig.value = config
  onlineFillVisible.value = true
}

/**
 * 处理在线填报成功
 */
const handleOnlineFillSuccess = (data) => {
  const { configId, file } = data
  
  // 构建文件信息
  const fileWithUrl = {
    ...file,
    uploaded: true,
    uploadTime: new Date().toISOString()
  }
  
  // 保存到已上传文件列表
  uploadedFiles.value.set(configId, fileWithUrl)
  
  // 触发文件变化事件
  emit('files-change', {
    configId: configId,
    file: fileWithUrl,
    action: 'uploaded',
    url: file.fileUrl,
    uploadResponse: file.uploadResponse
  })
  
  // 触发验证状态变化事件
  emit('validation-change', {
    allRequiredUploaded: allRequiredUploaded.value,
    uploadedCount: uploadedFiles.value.size,
    totalCount: materialConfigs.value.length
  })
  
  // 关闭在线填报弹窗
  onlineFillVisible.value = false
  currentOnlineFillConfig.value = null
  
  message.success(`在线填报完成，文件已上传`)
}

/**
 * 处理在线填报取消
 */
const handleOnlineFillCancel = () => {
  onlineFillVisible.value = false
  currentOnlineFillConfig.value = null
}

/**
 * 获取项目上下文信息（用于在线填报自动填充）
 */
const getProjectContext = () => {
  // 从父组件传递的表单数据中提取项目信息
  const data = props.projectData || {}
  
  return {
    projectName: data.projectName || '',
    applicant: data.applicant || '',
    department: data.department || '',
    year: data.year || new Date().getFullYear(),
    budget: data.budget || 0,
    duration: data.duration || 12,
    expectedDate: data.expectedDate ? (data.expectedDate.format ? data.expectedDate.format('YYYY-MM-DD') : data.expectedDate) : '',
    description: data.description || '',
    remarks: data.remarks || ''
  }
}

/**
 * 获取所有上传的文件
 */
const getAllUploadedFiles = () => {
  const files = []
  uploadedFiles.value.forEach((file, configId) => {
    const config = materialConfigs.value.find(c => c.id === configId)
    files.push({
      configId,
      config,
      file
    })
  })
  return files
}

/**
 * 验证所有必传文件是否已上传
 */
const validateRequiredFiles = () => {
  return {
    valid: allRequiredUploaded.value,
    missingFiles: materialConfigs.value
      .filter(config => config.isRequired && !uploadedFiles.value.has(config.id))
      .map(config => config.categoryName)
  }
}

/**
 * 清空所有上传的文件
 */
const clearAllFiles = () => {
  uploadedFiles.value.clear()
  emit('validation-change', {
    allRequiredUploaded: false,
    uploadedCount: 0,
    totalCount: materialConfigs.value.length
  })
  // message.success('已清空所有文件')
}

// 配置更新监听器
let unregisterListener = null

/**
 * 注册配置更新监听
 */
const registerConfigListener = () => {
  unregisterListener = materialTemplateStore.registerPageUpdateListener(
    props.businessType,
    (configs) => {
      materialConfigs.value = configs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      
      // 清理已删除配置对应的文件
      const configIds = new Set(configs.map(c => c.id))
      const filesToRemove = []
      uploadedFiles.value.forEach((file, configId) => {
        if (!configIds.has(configId)) {
          filesToRemove.push(configId)
        }
      })
      
      filesToRemove.forEach(configId => {
        uploadedFiles.value.delete(configId)
      })
      
      emit('config-update', configs)
      
      if (filesToRemove.length > 0) {
        emit('validation-change', {
          allRequiredUploaded: allRequiredUploaded.value,
          uploadedCount: uploadedFiles.value.size,
          totalCount: materialConfigs.value.length
        })
      }
    }
  )
}

// 生命周期钩子
onMounted(async () => {
  if (props.autoLoad) {
    // 初始化配置状态管理
    await materialTemplateStore.initConfigs()
    // 加载配置
    await loadConfigs()
  }
  
  // 注册配置更新监听
  registerConfigListener()
})

onUnmounted(() => {
  // 取消注册监听器
  if (unregisterListener) {
    unregisterListener()
  }
})

// 监听业务类型变化
watch(() => props.businessType, async () => {
  if (props.autoLoad) {
    await loadConfigs()
  }
}, { immediate: false })

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  return FileUploadService.formatFileSize(bytes)
}

// 暴露方法给父组件
defineExpose({
  refreshConfigs,
  getAllUploadedFiles,
  validateRequiredFiles,
  clearAllFiles,
  loadConfigs,
  formatFileSize,
  preloadFiles
})

/**
 * 预加载历史材料文件（用于“重新提交材料”场景回显）
 * files: Array<{ materialName, fileUrl, fileSize, fileSuffix?, materialType? }>
 */
function preloadFiles(files) {
  if (!files || !Array.isArray(files) || files.length === 0) return
  // 如果配置尚未加载完成，则暂存，待 loadConfigs 后再应用
  if (!materialConfigs.value || materialConfigs.value.length === 0) {
    pendingPreloadFiles.value = files
    return
  }
  applyPreloadFiles(files)
}

function applyPreloadFiles(files) {
  const configs = materialConfigs.value || []
  const used = new Set()

  const pickTarget = (f) => {
    // 1) 精确匹配 materialType 且未被占用
    if (f.materialType) {
      const exact = configs.find((c) => c.categoryName === f.materialType && !used.has(c.id))
      if (exact) return exact
    }
    // 2) 按 isRequired 匹配未占用类目（f.isRequired: 1=必传, 0=选传）
    const wantRequired = Number(f.isRequired) === 1
    const pool = configs.filter((c) => (!!c.isRequired) === wantRequired && !used.has(c.id))
    if (pool.length > 0) return pool[0]
    // 3) 任一未占用类目
    const anyEmpty = configs.find((c) => !used.has(c.id))
    if (anyEmpty) return anyEmpty
    // 4) 兜底：第一个
    return configs[0]
  }

  files.forEach((f) => {
    const target = pickTarget(f)
    if (!target) return

    const fileWithUrl = {
      fileName: f.materialName || f.fileName,
      fileSize: f.fileSize,
      url: f.fileUrl,
      uploaded: true,
      uploadTime: new Date().toISOString(),
      fileType: f.fileSuffix || '',
      materialRecordId: f.id,
      projectId: f.projectId,
      materialType: f.materialType || target.categoryName,
      materialName: f.materialName || f.fileName,
      sort: f.sort,
      isRequiredNum: typeof f.isRequired === 'number' ? f.isRequired : (target.isRequired ? 1 : 0),
      uploadResponse: {
        fileName: f.materialName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        fileType: f.fileSuffix || ''
      }
    }
    uploadedFiles.value.set(target.id, fileWithUrl)
    used.add(target.id)

    // 通知父组件状态变化
    emit('files-change', {
      configId: target.id,
      file: fileWithUrl,
      action: 'preload',
      url: f.fileUrl,
      uploadResponse: fileWithUrl.uploadResponse
    })
  })

  // 同步校验信息
  emit('validation-change', {
    allRequiredUploaded: allRequiredUploaded.value,
    uploadedCount: uploadedFiles.value.size,
    totalCount: materialConfigs.value.length
  })
}
</script>

<style scoped>
.material-template-sync {
  width: 100%;
}

.material-submit-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h4 {
  margin: 0;
  color: #262626;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
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
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
}

.material-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 2px 4px rgba(64, 169, 255, 0.1);
}

.material-item.required {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.material-item.required:hover {
  border-color: #ff7875;
}

.material-info {
  flex: 1;
  margin-right: 16px;
}

.material-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.category-name {
  font-weight: 500;
  color: #262626;
  font-size: 14px;
}

.info-icon {
  color: #8c8c8c;
  cursor: help;
}

.material-desc {
  color: #595959;
  font-size: 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.template-download {
  margin-bottom: 4px;
}

.template-link {
  padding: 0;
  height: auto;
  font-size: 12px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}

.online-fill-btn {
  margin-top: 8px;
  border-style: dashed;
  border-color: #40a9ff;
  color: #40a9ff;
  background: #f6ffed;
  transition: all 0.3s ease;
}

.online-fill-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #e6f7ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.uploaded-file {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
}

.file-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 8px;
  font-size: 11px;
}

.file-size {
  color: #8c8c8c;
  margin-bottom: 2px;
}

.upload-status {
  font-size: 10px;
  font-weight: 500;
}

.upload-status.success {
  color: #52c41a;
}

.upload-status.pending {
  color: #faad14;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.submit-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 在线填报按钮样式 */
.online-fill-btn {
  margin-top: 8px;
  border-style: dashed;
  border-color: #40a9ff;
  color: #40a9ff;
  background: #f6ffed;
  transition: all 0.3s ease;
}

.online-fill-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #e6f7ff;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .material-info {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .upload-area {
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style> 