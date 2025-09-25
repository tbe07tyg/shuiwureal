# 通用文件上传模块

## 📋 概述

本模块为科研管理系统提供了完整的文件上传解决方案，包括API封装、Vue组件、类型定义和工具函数。

## 📁 文件结构

```
src/api/upload/
├── index.ts           # 主要API函数和工具类
├── types.ts           # TypeScript类型定义
└── README.md          # 说明文档

src/components/Upload/
└── TechnologicalUpload.vue  # 通用上传组件
```

## 🔧 核心功能

### 1. API功能
- ✅ 单文件上传
- ✅ 批量文件上传
- ✅ 带进度的文件上传
- ✅ 文件验证（大小、类型）
- ✅ 预设目录配置
- ✅ 工具函数（格式化、验证等）

### 2. Vue组件功能
- ✅ 拖拽上传
- ✅ 文件列表展示
- ✅ 上传进度显示
- ✅ 文件预览
- ✅ 批量操作
- ✅ 统计信息
- ✅ 错误处理

## 🚀 快速开始

### 基础API使用

```typescript
import { uploadTechnologicalFile, uploadProjectMaterials } from '@/api/upload'

// 单文件上传
const file = document.querySelector('input[type="file"]').files[0]
const response = await uploadTechnologicalFile(file, 'project/materials')

// 批量上传项目材料
const files = Array.from(document.querySelector('input[type="file"]').files)
const responses = await uploadProjectMaterials(files)
```

### 高级服务类使用

```typescript
import { TechnologicalUploadService, UploadPresets } from '@/api/upload'

// 创建专用的上传服务
const uploadService = new TechnologicalUploadService(UploadPresets.PROJECT_MATERIAL)

// 验证文件
const validation = uploadService.validateFile(file)
if (!validation.valid) {
  console.error(validation.error)
  return
}

// 创建文件项并上传
const fileItem = uploadService.createFileItem(file)
await uploadService.uploadFile(fileItem)
```

### Vue组件使用

```vue
<template>
  <TechnologicalUpload
    v-model:value="fileList"
    :options="uploadOptions"
    :dragger="true"
    :show-stats="true"
    @success="handleUploadSuccess"
    @error="handleUploadError"
  >
    <template #trigger>
      <a-button type="primary">
        <UploadOutlined />
        上传项目材料
      </a-button>
    </template>
  </TechnologicalUpload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadPresets } from '@/api/upload/types'
import TechnologicalUpload from '@/components/Upload/TechnologicalUpload.vue'

const fileList = ref([])
const uploadOptions = UploadPresets.PROJECT_MATERIAL

const handleUploadSuccess = (file) => {
  console.log('上传成功:', file)
}

const handleUploadError = (error, file) => {
  console.error('上传失败:', error, file)
}
</script>
```

## 📖 详细使用指南

### 预设配置

模块提供了多种预设配置，可直接使用：

```typescript
import { UploadPresets } from '@/api/upload/types'

// 项目材料上传（50MB限制，文档+压缩包）
const projectConfig = UploadPresets.PROJECT_MATERIAL

// 会议资料上传（100MB限制，所有类型）
const meetingConfig = UploadPresets.MEETING_MATERIAL

// 图片上传（10MB限制，仅图片）
const imageConfig = UploadPresets.IMAGE_UPLOAD

// 模板上传（20MB限制，仅文档）
const templateConfig = UploadPresets.TEMPLATE_UPLOAD
```

### 自定义配置

```typescript
const customOptions: UploadOptions = {
  directory: 'custom/folder',
  maxSize: 30, // 30MB
  allowedTypes: ['pdf', 'docx', 'jpg'],
  multiple: true,
  autoUpload: false
}
```

### 文件类型预设

```typescript
import { FileTypePresets } from '@/api/upload/types'

// 使用预设的文件类型
const documentTypes = FileTypePresets.DOCUMENT  // PDF, Word, Excel等
const imageTypes = FileTypePresets.IMAGE        // JPG, PNG, GIF等
const archiveTypes = FileTypePresets.ARCHIVE    // ZIP, RAR, 7Z等
const allTypes = FileTypePresets.ALL            // 所有类型
```

### 目录预设

```typescript
import { DirectoryPresets } from '@/api/upload/types'

// 使用预设的目录
const projectDir = DirectoryPresets.PROJECT_MATERIALS    // project/materials
const meetingDir = DirectoryPresets.MEETING_MATERIALS    // meeting/materials
const approvalDir = DirectoryPresets.APPROVAL_DOCUMENTS  // approval/documents
```

## 🔨 API 参考

### 核心API函数

#### `uploadTechnologicalFile(file, directory?)`
上传单个文件到科研系统。

**参数:**
- `file: File` - 要上传的文件
- `directory?: string` - 可选的目录路径

**返回:** `Promise<UploadResponse>`

#### `uploadTechnologicalFiles(files, directory?)`
批量上传文件。

**参数:**
- `files: File[]` - 文件数组
- `directory?: string` - 可选的目录路径

**返回:** `Promise<UploadResponse[]>`

#### `uploadTechnologicalFileWithProgress(file, directory?, onProgress?)`
带进度回调的文件上传。

**参数:**
- `file: File` - 要上传的文件
- `directory?: string` - 可选的目录路径
- `onProgress?: (progressEvent) => void` - 进度回调

**返回:** `Promise<UploadResponse>`

### TechnologicalUploadService类

专业的上传服务类，提供完整的文件上传解决方案。

#### 构造函数
```typescript
new TechnologicalUploadService(options?: UploadOptions)
```

#### 主要方法
- `validateFile(file)` - 验证文件
- `createFileItem(file)` - 创建文件项
- `uploadFile(fileItem)` - 上传单个文件
- `uploadFiles(fileItems)` - 批量上传文件

### 便捷方法

```typescript
// 快速上传不同类型的文件
uploadProjectMaterials(files)     // 项目材料
uploadMeetingMaterials(files)     // 会议资料
uploadApprovalDocuments(files)    // 审批文件
uploadTemplate(file)              // 模板文件
```

### 工具函数

```typescript
formatFileSize(bytes)           // 格式化文件大小
getFileExtension(filename)      // 获取文件扩展名
isImageFile(filename)          // 判断是否为图片
generateFileId()               // 生成唯一文件ID
```

## 🎨 组件属性

### TechnologicalUpload 组件

#### Props
```typescript
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
```

#### Events
- `@update:value` - 文件列表更新
- `@change` - 文件列表变化
- `@success` - 单个文件上传成功
- `@error` - 单个文件上传失败
- `@remove` - 文件被移除
- `@preview` - 文件被预览

#### Slots
- `#trigger` - 自定义上传触发器
- `#dragger` - 自定义拖拽区域

#### 暴露的方法
- `uploadAll()` - 上传所有待上传文件
- `clearAll()` - 清空文件列表
- `getSuccessFiles()` - 获取上传成功的文件
- `getFileUrls()` - 获取所有成功文件的URL

## 🎯 使用场景示例

### 项目材料提交页面

```vue
<template>
  <div class="project-submit">
    <h3>项目材料上传</h3>
    
    <TechnologicalUpload
      v-model:value="projectMaterials"
      :options="projectUploadOptions"
      :dragger="true"
      :show-stats="true"
      upload-button-text="上传项目材料"
      upload-hint="支持PDF、Word、Excel等文档格式，单个文件不超过50MB"
    />
    
    <div class="submit-actions">
      <a-button @click="handleBatchUpload">批量上传</a-button>
      <a-button type="primary" @click="handleSubmit">提交申请</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadPresets } from '@/api/upload/types'
import TechnologicalUpload from '@/components/Upload/TechnologicalUpload.vue'

const projectMaterials = ref([])
const projectUploadOptions = UploadPresets.PROJECT_MATERIAL

const uploadRef = ref()

const handleBatchUpload = () => {
  uploadRef.value?.uploadAll()
}

const handleSubmit = () => {
  const fileUrls = uploadRef.value?.getFileUrls() || []
  console.log('提交的文件URLs:', fileUrls)
  // 处理提交逻辑
}
</script>
```

### 会议资料管理

```vue
<template>
  <div class="meeting-materials">
    <h3>会议资料管理</h3>
    
    <TechnologicalUpload
      v-model:value="meetingFiles"
      :options="meetingUploadOptions"
      :show-file-list="true"
      :show-stats="true"
      @success="handleUploadSuccess"
    >
      <template #trigger>
        <a-button type="dashed" block>
          <CloudUploadOutlined />
          添加会议资料
        </a-button>
      </template>
    </TechnologicalUpload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadPresets } from '@/api/upload/types'

const meetingFiles = ref([])
const meetingUploadOptions = UploadPresets.MEETING_MATERIAL

const handleUploadSuccess = (file) => {
  message.success(`文件 ${file.name} 上传成功`)
  // 可以在这里更新会议记录
}
</script>
```

## 🚨 注意事项

### 1. 文件大小限制
- 默认最大文件大小为50MB
- 可通过配置调整，但需要确保服务器支持

### 2. 文件类型限制
- 默认支持所有类型文件
- 建议根据业务需求设置具体的文件类型限制

### 3. 目录管理
- 建议使用预设的目录结构
- 自定义目录时注意权限和路径规范

### 4. 错误处理
- 组件内置了基本的错误处理
- 建议在业务层面添加额外的错误处理逻辑

### 5. 性能考虑
- 大文件上传时注意进度显示
- 批量上传时建议控制并发数量

## 🔧 扩展开发

如需添加新功能或自定义，可以：

1. **扩展上传服务类**：继承`TechnologicalUploadService`
2. **自定义组件**：基于现有组件进行定制
3. **添加新的预设配置**：在`types.ts`中扩展预设

---

**版本:** 1.0.0  
**作者:** 科研管理系统开发团队  
**更新时间:** 2025-01-27
