# 材料模板 API 模块

## 概述

本模块提供材料模板管理的完整API接口和状态管理功能，支持项目立项、开题、中期、验收等不同阶段的材料模板配置。

## 目录结构

```
src/api/th_qd/material-template/
├── types.ts          # 类型定义
├── index.ts          # API接口
├── README.md         # 说明文档
└── ...
```

```
src/stores/modules/th_qd/
└── materialTemplate.ts  # Pinia状态管理
```

## 主要功能

### 1. 基础 CRUD 操作
- ✅ 分页查询材料模板
- ✅ 获取模板详情
- ✅ 创建新模板
- ✅ 更新模板信息
- ✅ 删除单个模板
- ✅ 批量删除模板
- ✅ 导出Excel

### 2. 业务逻辑功能
- ✅ 按使用源分组查询
- ✅ 获取统计信息
- ✅ 复制模板到其他使用源
- ✅ 批量更新排序
- ✅ 数据格式转换

### 3. 状态管理功能
- ✅ 全局状态缓存
- ✅ 分页管理
- ✅ 查询参数管理
- ✅ 加载状态管理
- ✅ 缓存时间控制

## 类型定义

### 核心枚举

```typescript
// 使用源枚举
export enum UseSource {
  APPROVAL = 0,    // 立项申请
  OPENING = 1,     // 项目开题  
  MIDTERM = 2,     // 项目中期
  ACCEPTANCE = 3   // 项目验收
}

// 是否必传枚举
export enum IsRequired {
  REQUIRED = 0,    // 必传
  OPTIONAL = 1     // 选传
}
```

### 主要接口

```typescript
// 模板响应数据
interface TechnologicalMaterialTemplateRespVO {
  id: number
  categoryName: string
  isRequired: IsRequired
  sort: number
  templateFilePath?: string
  descriptionAndExplanation?: string
  useSource: UseSource
  createTime: string
}

// 模板保存请求
interface TechnologicalMaterialTemplateSaveReqVO {
  id?: number
  categoryName: string
  isRequired: IsRequired
  sort: number
  templateFilePath?: string
  descriptionAndExplanation?: string
  useSource: UseSource
}

// 前端配置格式
interface MaterialTemplateConfig {
  id: number
  key: string
  name: string
  description: string
  isRequired: boolean
  sort: number
  templateUrl?: string
  useSource: UseSource
  fileList?: any[]
}
```

## API 接口使用

### 基础操作

```typescript
import {
  getMaterialTemplatePage,
  getMaterialTemplate,
  createMaterialTemplate,
  updateMaterialTemplate,
  deleteMaterialTemplate
} from '@/api/th_qd/maintenance/material-template'

// 获取分页列表
const response = await getMaterialTemplatePage({
  pageNo: 1,
  pageSize: 10,
  useSource: UseSource.APPROVAL
})

// 创建模板
const newTemplate = await createMaterialTemplate({
  categoryName: '项目申请书',
  isRequired: IsRequired.REQUIRED,
  sort: 1,
  useSource: UseSource.APPROVAL,
  descriptionAndExplanation: '详细的项目申请书'
})
```

### 业务功能

```typescript
import {
  getMaterialTemplatesByUseSource,
  getAllMaterialTemplatesGrouped,
  getMaterialTemplateStats,
  copyMaterialTemplateToUseSource
} from '@/api/th_qd/maintenance/material-template'

// 获取立项申请的材料模板
const approvalTemplates = await getMaterialTemplatesByUseSource(UseSource.APPROVAL)

// 获取所有分组模板
const groupedTemplates = await getAllMaterialTemplatesGrouped()

// 获取统计信息
const stats = await getMaterialTemplateStats()

// 复制模板到其他使用源
await copyMaterialTemplateToUseSource(templateId, UseSource.OPENING)
```

## 状态管理使用

### Store 初始化

```typescript
import { useMaterialTemplateStore } from '@/stores/modules/th_qd/materialTemplate'

const templateStore = useMaterialTemplateStore()
```

### 基础操作

```typescript
// 加载模板列表
await templateStore.loadTemplateList()

// 创建模板
const result = await templateStore.createTemplateAction({
  categoryName: '可行性报告',
  isRequired: IsRequired.REQUIRED,
  sort: 2,
  useSource: UseSource.APPROVAL
})

// 更新模板
await templateStore.updateTemplateAction({
  id: templateId,
  categoryName: '项目计划书（修订版）',
  // ... 其他字段
})

// 删除模板
await templateStore.deleteTemplateAction(templateId)
```

### 查询和过滤

```typescript
// 设置查询参数
templateStore.setQueryParams({
  categoryName: '申请书',
  useSource: UseSource.APPROVAL,
  isRequired: IsRequired.REQUIRED
})

// 重新加载
await templateStore.loadTemplateList()

// 获取特定使用源的模板
const approvalTemplates = await templateStore.getTemplatesByUseSource(UseSource.APPROVAL)
```

### 状态访问

```typescript
// 访问模板列表
const templates = templateStore.templateList

// 访问分组模板
const groupedTemplates = templateStore.groupedTemplates

// 访问统计信息
const stats = templateStore.stats

// 访问加载状态
const isLoading = templateStore.loading

// 访问分页信息
const pagination = templateStore.pagination
```

## 组件集成示例

### 模板列表组件

```vue
<template>
  <div class="material-template-list">
    <!-- 查询表单 -->
    <a-form layout="inline" :model="queryForm">
      <a-form-item label="类目名称">
        <a-input v-model:value="queryForm.categoryName" placeholder="请输入类目名称" />
      </a-form-item>
      <a-form-item label="使用源">
        <a-select v-model:value="queryForm.useSource" placeholder="请选择使用源">
          <a-select-option :value="UseSource.APPROVAL">立项申请</a-select-option>
          <a-select-option :value="UseSource.OPENING">项目开题</a-select-option>
          <a-select-option :value="UseSource.MIDTERM">项目中期</a-select-option>
          <a-select-option :value="UseSource.ACCEPTANCE">项目验收</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch">查询</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-form-item>
    </a-form>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="templateStore.templateList"
      :loading="templateStore.loading"
      :pagination="paginationConfig"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'useSource'">
          {{ templateStore.getUseSourceDisplayName(record.useSource) }}
        </template>
        <template v-if="column.key === 'isRequired'">
          {{ templateStore.getIsRequiredDisplayName(record.isRequired) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button type="link" danger @click="handleDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMaterialTemplateStore } from '@/stores/modules/th_qd/materialTemplate'
import { UseSource, IsRequired } from '@/api/th_qd/maintenance/material-template/types'

const templateStore = useMaterialTemplateStore()

const queryForm = ref({
  categoryName: '',
  useSource: undefined,
  isRequired: undefined
})

const columns = [
  { title: '类目名称', dataIndex: 'categoryName', key: 'categoryName' },
  { title: '使用源', dataIndex: 'useSource', key: 'useSource' },
  { title: '是否必传', dataIndex: 'isRequired', key: 'isRequired' },
  { title: '排序', dataIndex: 'sort', key: 'sort' },
  { title: '操作', key: 'action' }
]

const paginationConfig = computed(() => ({
  current: templateStore.pagination.current,
  pageSize: templateStore.pagination.pageSize,
  total: templateStore.pagination.total,
  showSizeChanger: true,
  showQuickJumper: true
}))

const handleSearch = async () => {
  templateStore.setQueryParams(queryForm.value)
  templateStore.setPagination({ current: 1 })
  await templateStore.loadTemplateList()
}

const handleReset = () => {
  queryForm.value = {
    categoryName: '',
    useSource: undefined,
    isRequired: undefined
  }
  templateStore.resetQueryParams()
  templateStore.setPagination({ current: 1 })
  templateStore.loadTemplateList()
}

const handleTableChange = (pagination: any) => {
  templateStore.setPagination({
    current: pagination.current,
    pageSize: pagination.pageSize
  })
  templateStore.loadTemplateList()
}

const handleEdit = (record: any) => {
  // 编辑逻辑
}

const handleDelete = async (id: number) => {
  const result = await templateStore.deleteTemplateAction(id)
  if (result.success) {
    // 删除成功
  }
}

onMounted(() => {
  templateStore.loadTemplateList()
})
</script>
```

### 模板选择组件

```vue
<template>
  <div class="material-template-selector">
    <div v-for="template in templates" :key="template.id" class="template-item">
      <div class="template-header">
        <span class="template-name">
          {{ template.name }}
          <span v-if="template.isRequired" class="required-mark">*</span>
        </span>
        <span class="template-desc">{{ template.description }}</span>
      </div>
      
      <a-upload
        v-model:file-list="template.fileList"
        :before-upload="beforeUpload"
        :custom-request="customRequest"
        multiple
      >
        <a-button>
          <UploadOutlined />
          选择文件
        </a-button>
      </a-upload>
      
      <a-button v-if="template.templateUrl" type="link" @click="downloadTemplate(template)">
        下载模板
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMaterialTemplateStore } from '@/stores/modules/th_qd/materialTemplate'
import { UseSource } from '@/api/th_qd/maintenance/material-template/types'
import { UploadOutlined } from '@ant-design/icons-vue'

interface Props {
  useSource: UseSource
  includeOptional?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  includeOptional: true
})

const templateStore = useMaterialTemplateStore()
const templates = ref([])

const loadTemplates = async () => {
  const templateConfigs = await templateStore.getTemplatesByUseSource(
    props.useSource, 
    props.includeOptional
  )
  templates.value = templateConfigs
}

const beforeUpload = (file: any) => {
  // 文件上传前验证
  return true
}

const customRequest = (option: any) => {
  // 自定义上传逻辑
}

const downloadTemplate = (template: any) => {
  if (template.templateUrl) {
    window.open(template.templateUrl, '_blank')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>
```

## 注意事项

1. **缓存管理**: Store 实现了5分钟的缓存机制，避免频繁请求API
2. **错误处理**: 所有API调用都包含错误处理和日志记录
3. **类型安全**: 完整的TypeScript类型定义，确保类型安全
4. **状态同步**: 增删改操作会自动更新相关状态数据
5. **分页处理**: 支持分页查询和状态管理
6. **排序功能**: 支持批量更新模板排序

## 扩展建议

1. **模板文件管理**: 可以扩展文件上传和管理功能
2. **版本控制**: 为模板添加版本管理功能
3. **权限控制**: 根据用户角色控制模板的增删改权限
4. **模板预览**: 添加模板文件的在线预览功能
5. **批量操作**: 扩展更多批量操作功能

## 更新日志

- v1.0.0: 初始版本，实现基础CRUD和业务功能
- 待续...