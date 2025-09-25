<!--
* @file 科研附件通用上传组件
* @description 封装了科研管理系统专用的文件上传功能
* @author 科研管理系统
* @version 1.0.0
* @date 2025-01-27
-->
<template>
  <div class="technological-upload">
    <!-- 上传区域 -->
    <a-upload
      v-model:file-list="fileList"
      :before-upload="handleBeforeUpload"
      :custom-request="handleCustomRequest"
      :on-remove="handleRemove"
      :multiple="options.multiple"
      :accept="acceptTypes"
      :disabled="disabled"
      class="upload-area"
    >
      <div v-if="!hideUploadButton" class="upload-trigger">
        <slot name="trigger">
          <a-button :loading="uploading" :disabled="disabled">
            <UploadOutlined />
            {{ uploadButtonText }}
          </a-button>
        </slot>
      </div>
      
      <!-- 拖拽上传区域 -->
      <div v-if="dragger && !hideUploadButton" class="upload-dragger">
        <slot name="dragger">
          <div class="dragger-content">
            <CloudUploadOutlined class="dragger-icon" />
            <p class="dragger-text">点击或拖拽文件到这里上传</p>
            <p class="dragger-hint">{{ uploadHint }}</p>
          </div>
        </slot>
      </div>
    </a-upload>
    
    <!-- 文件列表 -->
    <div v-if="showFileList && fileList.length > 0" class="file-list">
      <div
        v-for="file in fileList"
        :key="file.uid"
        class="file-item"
        :class="{ 'file-item-error': file.status === 'error' }"
      >
        <!-- 文件图标 -->
        <div class="file-icon">
          <FileOutlined v-if="!isImageFile(file.name)" />
          <img 
            v-else-if="file.url" 
            :src="file.url" 
            class="file-thumbnail"
            @error="handleImageError"
          />
          <FileImageOutlined v-else />
        </div>
        
        <!-- 文件信息 -->
        <div class="file-info">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.size || 0) }}</span>
            <span v-if="file.status === 'uploading'" class="file-progress">
              {{ file.percent || 0 }}%
            </span>
            <span 
              v-else-if="file.status" 
              class="file-status"
              :class="`status-${file.status}`"
            >
              {{ getStatusText(file.status) }}
            </span>
          </div>
          
          <!-- 上传进度条 -->
          <a-progress
            v-if="file.status === 'uploading'"
            :percent="file.percent || 0"
            :show-info="false"
            size="small"
            class="file-progress-bar"
          />
          
          <!-- 错误信息 -->
          <div v-if="file.status === 'error' && file.error" class="file-error">
            {{ file.error }}
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="file-actions">
          <!-- 预览按钮 -->
          <a-button
            v-if="file.url && canPreview(file)"
            type="link"
            size="small"
            @click="handlePreview(file)"
          >
            <EyeOutlined />
          </a-button>
          
          <!-- 下载按钮 -->
          <a-button
            v-if="file.url"
            type="link"
            size="small"
            @click="handleDownload(file)"
          >
            <DownloadOutlined />
          </a-button>
          
          <!-- 删除按钮 -->
          <a-button
            type="link"
            size="small"
            danger
            @click="handleRemoveFile(file)"
            :disabled="file.status === 'uploading'"
          >
            <DeleteOutlined />
          </a-button>
        </div>
      </div>
    </div>
    
    <!-- 上传统计 -->
    <div v-if="showStats && fileList.length > 0" class="upload-stats">
      <div class="stats-item">
        <span class="stats-label">总数:</span>
        <span class="stats-value">{{ fileList.length }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">成功:</span>
        <span class="stats-value success">{{ successCount }}</span>
      </div>
      <div v-if="errorCount > 0" class="stats-item">
        <span class="stats-label">失败:</span>
        <span class="stats-value error">{{ errorCount }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">总大小:</span>
        <span class="stats-value">{{ totalSize }}</span>
      </div>
    </div>
    
    <!-- 文件预览模态框 -->
    <a-modal
      v-model:open="previewVisible"
      title="文件预览"
      :footer="null"
      width="80%"
      class="preview-modal"
    >
      <div v-if="previewFile" class="preview-content">
        <!-- 图片预览 -->
        <img
          v-if="isImageFile(previewFile.name)"
          :src="previewFile.url"
          class="preview-image"
          alt="预览图片"
        />
        
        <!-- 其他文件类型提示 -->
        <div v-else class="preview-placeholder">
          <FileOutlined style="font-size: 48px; color: #ccc;" />
          <p>该文件类型不支持预览</p>
          <a-button type="primary" @click="handleDownload(previewFile)">
            <DownloadOutlined />
            下载文件
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  CloudUploadOutlined,
  FileOutlined,
  FileImageOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { 
  TechnologicalUploadService,
  formatFileSize,
  isImageFile
} from '@/api/upload'
import type { 
  UploadOptions, 
  UploadFileItem 
} from '@/api/upload/types'

// 组件属性
interface Props {
  options?: UploadOptions           // 上传配置
  value?: UploadFileItem[]          // v-model 绑定的文件列表
  disabled?: boolean                // 是否禁用
  dragger?: boolean                 // 是否启用拖拽上传
  showFileList?: boolean            // 是否显示文件列表
  showStats?: boolean               // 是否显示统计信息
  hideUploadButton?: boolean        // 是否隐藏上传按钮
  uploadButtonText?: string         // 上传按钮文本
  uploadHint?: string               // 上传提示文本
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  value: () => ([]),
  disabled: false,
  dragger: false,
  showFileList: true,
  showStats: false,
  hideUploadButton: false,
  uploadButtonText: '选择文件',
  uploadHint: '支持单个或批量上传'
})

// 事件定义
const emit = defineEmits<{
  'update:value': [files: UploadFileItem[]]
  'change': [files: UploadFileItem[]]
  'success': [file: UploadFileItem]
  'error': [error: Error, file: UploadFileItem]
  'remove': [file: UploadFileItem]
  'preview': [file: UploadFileItem]
}>()

// 响应式数据
const fileList = ref<UploadFileItem[]>([...props.value])
const uploading = ref(false)
const previewVisible = ref(false)
const previewFile = ref<UploadFileItem | null>(null)

// 上传服务实例
const uploadService = new TechnologicalUploadService(props.options)

// 计算属性
const acceptTypes = computed(() => {
  const allowedTypes = props.options.allowedTypes
  if (!allowedTypes || allowedTypes.includes('*')) {
    return undefined
  }
  return allowedTypes.map(type => `.${type}`).join(',')
})

const successCount = computed(() => {
  return fileList.value.filter(file => file.status === 'success').length
})

const errorCount = computed(() => {
  return fileList.value.filter(file => file.status === 'error').length
})

const totalSize = computed(() => {
  const total = fileList.value.reduce((sum, file) => sum + (file.size || 0), 0)
  return formatFileSize(total)
})

// 监听器
watch(() => props.value, (newValue) => {
  fileList.value = [...newValue]
}, { deep: true })

watch(fileList, (newFileList) => {
  emit('update:value', newFileList)
  emit('change', newFileList)
}, { deep: true })

// 方法
const handleBeforeUpload = (file: File): boolean => {
  const validation = uploadService.validateFile(file)
  if (!validation.valid) {
    message.error(validation.error)
    return false
  }
  
  const fileItem = uploadService.createFileItem(file)
  fileList.value.push(fileItem)
  
  if (!props.options.autoUpload) {
    return false // 阻止自动上传
  }
  
  return false // 总是阻止默认上传，使用自定义上传
}

const handleCustomRequest = async (options: any) => {
  const { file } = options
  const fileItem = fileList.value.find(item => item.file === file)
  
  if (!fileItem) {
    console.error('找不到对应的文件项')
    return
  }
  
  try {
    uploading.value = true
    await uploadService.uploadFile(fileItem)
    emit('success', fileItem)
    message.success(`文件 ${fileItem.name} 上传成功`)
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('上传失败')
    emit('error', errorObj, fileItem)
    message.error(`文件 ${fileItem.name} 上传失败: ${errorObj.message}`)
  } finally {
    uploading.value = false
  }
}

const handleRemove = (file: any) => {
  handleRemoveFile(file)
}

const handleRemoveFile = (file: UploadFileItem) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emit('remove', file)
  }
}

const handlePreview = (file: UploadFileItem) => {
  previewFile.value = file
  previewVisible.value = true
  emit('preview', file)
}

const handleDownload = (file: UploadFileItem) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const handleImageError = (event: Event) => {
  console.error('图片加载失败:', event)
}

const canPreview = (file: UploadFileItem): boolean => {
  return isImageFile(file.name) && !!file.url
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待上传',
    uploading: '上传中',
    success: '成功',
    error: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 暴露的方法
const uploadAll = async (): Promise<void> => {
  const pendingFiles = fileList.value.filter(file => file.status === 'pending')
  if (pendingFiles.length === 0) {
    message.info('没有待上传的文件')
    return
  }
  
  try {
    uploading.value = true
    await uploadService.uploadFiles(pendingFiles)
    message.success('批量上传完成')
  } catch (error) {
    message.error('批量上传失败')
  } finally {
    uploading.value = false
  }
}

const clearAll = (): void => {
  fileList.value = []
  message.info('已清空文件列表')
}

const getSuccessFiles = (): UploadFileItem[] => {
  return fileList.value.filter(file => file.status === 'success')
}

const getFileUrls = (): string[] => {
  return getSuccessFiles().map(file => file.response?.fileUrl || file.url || '').filter(Boolean)
}

// 暴露给父组件的方法
defineExpose({
  uploadAll,
  clearAll,
  getSuccessFiles,
  getFileUrls,
  fileList
})
</script>

<style scoped>
.technological-upload {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.upload-trigger {
  display: inline-block;
}

.upload-dragger {
  width: 100%;
  min-height: 180px;
  padding: 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-dragger:hover {
  border-color: #1890ff;
}

.dragger-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.dragger-icon {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
}

.dragger-text {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
}

.dragger-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.file-list {
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #fff;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.file-item-error {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.file-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #1890ff;
}

.file-thumbnail {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.file-size {
  color: #595959;
}

.file-progress {
  color: #1890ff;
}

.file-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.status-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-error {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.status-uploading {
  background-color: #e6f7ff;
  color: #1890ff;
}

.file-progress-bar {
  margin-top: 4px;
}

.file-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}

.upload-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-label {
  color: #8c8c8c;
}

.stats-value {
  color: #262626;
  font-weight: 500;
}

.stats-value.success {
  color: #52c41a;
}

.stats-value.error {
  color: #ff4d4f;
}

.preview-modal .preview-content {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.preview-placeholder p {
  margin: 16px 0 24px 0;
  font-size: 16px;
}
</style>
