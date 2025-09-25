# 提报模板 API 使用说明

## 概述

本模块提供了完整的提报模板管理功能，包括模板的创建、查询、修改、删除等操作，以及与前端现有代码的兼容性支持。

## 文件结构

```
src/api/th_qd/maintenance/report-template/
├── types.ts          # 类型定义文件
├── index.ts          # 主要API接口文件
└── README.md         # 使用说明文档
```

## 核心功能模块

### 1. 基础 CRUD 操作
- 创建、查询、修改、删除提报模板
- 支持分页查询和条件筛选
- 支持Excel导出

### 2. 模板状态管理
- 启用/禁用模板
- 设置默认模板
- 模板排序管理

### 3. 业务逻辑功能
- 根据项目获取模板列表
- 获取模板统计信息
- 数据格式转换

### 4. 前端兼容性
- 与现有前端代码的数据格式转换
- 支持现有的模板配置结构

## API 接口列表

### 基础操作

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getReportTemplatePage` | GET | `/technological/template/page` | 分页查询提报模板 |
| `getReportTemplate` | GET | `/technological/template/get` | 获取提报模板详情 |
| `getReportTemplateList` | GET | `/technological/template/list` | 获取提报模板列表 |
| `createReportTemplate` | POST | `/technological/template/create` | 创建提报模板 |
| `updateReportTemplate` | PUT | `/technological/template/update` | 更新提报模板 |
| `deleteReportTemplate` | DELETE | `/technological/template/delete` | 删除提报模板 |
| `exportReportTemplateExcel` | GET | `/technological/template/export-excel` | 导出Excel |

### 业务功能

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getDefaultReportTemplate` | GET | `/technological/template/default` | 获取默认模板 |
| `setDefaultReportTemplate` | POST | `/technological/template/set-default` | 设置默认模板 |
| `enableReportTemplate` | PUT | `/technological/template/enable` | 启用模板 |
| `disableReportTemplate` | PUT | `/technological/template/disable` | 禁用模板 |
| `getReportTemplateStatistics` | GET | `/technological/template/statistics` | 获取模板统计 |
| `getReportTemplateListByProject` | GET | `/technological/template/list-by-project` | 根据项目获取模板 |

## 使用示例

### 1. 基础查询操作

```typescript
import { 
  getReportTemplateList, 
  getReportTemplate,
  TemplateStatus 
} from '@/api/th_qd/maintenance/report-template'

// 获取所有启用的模板
const getEnabledTemplates = async () => {
  const response = await getReportTemplateList({
    templateStatus: TemplateStatus.ENABLED
  })
  
  if (response.code === 0) {
    return response.data
  }
  return []
}

// 获取模板详情
const getTemplateDetail = async (id: number) => {
  const response = await getReportTemplate(id)
  return response.data
}
```

### 2. 创建和更新模板

```typescript
import { 
  createReportTemplate, 
  updateReportTemplate,
  convertToCreateRequest,
  convertToUpdateRequest
} from '@/api/th_qd/maintenance/report-template'

// 创建新模板
const createNewTemplate = async () => {
  const templateData = {
    templateCode: 'TASK_REPORT_001',
    templateName: '任务汇报模板',
    templateConfig: {
      title: '任务汇报',
      sections: [
        { title: '工作内容', required: true },
        { title: '遇到问题', required: false },
        { title: '下步计划', required: true }
      ],
      requireAttachment: false
    },
    requireAttachment: false,
    templateType: 'task'
  }
  
  const response = await createReportTemplate(templateData)
  return response.data // 返回新创建的模板ID
}

// 更新模板
const updateTemplate = async (id: number) => {
  const updateData = {
    id,
    templateName: '更新后的模板名称',
    templateConfig: {
      title: '更新后的标题',
      sections: [
        { title: '新的分段', required: true }
      ]
    }
  }
  
  const response = await updateReportTemplate(updateData)
  return response.code === 0
}
```

### 3. 前端兼容性使用

```typescript
import { 
  getEnabledTemplatesForFrontend,
  convertToFrontendConfig,
  convertToCreateRequest
} from '@/api/th_qd/maintenance/report-template'

// 获取前端格式的模板列表（兼容现有代码）
const getFrontendTemplates = async () => {
  const templates = await getEnabledTemplatesForFrontend()
  return templates
}

// 将现有前端配置保存到后端
const saveFrontendConfigToBackend = async (frontendConfig) => {
  const apiData = convertToCreateRequest(frontendConfig)
  const response = await createReportTemplate(apiData)
  return response.code === 0
}
```

### 4. 模板管理功能

```typescript
import { 
  setDefaultReportTemplate,
  enableReportTemplate,
  disableReportTemplate,
  getReportTemplateStatistics
} from '@/api/th_qd/maintenance/report-template'

// 设置默认模板
const setAsDefault = async (templateId: number) => {
  const response = await setDefaultReportTemplate(templateId)
  return response.code === 0
}

// 启用/禁用模板
const toggleTemplateStatus = async (templateId: number, enable: boolean) => {
  const response = enable 
    ? await enableReportTemplate(templateId)
    : await disableReportTemplate(templateId)
  return response.code === 0
}

// 获取统计信息
const getStats = async () => {
  const response = await getReportTemplateStatistics()
  return response.data
}
```

## 数据结构说明

### 模板配置结构

```typescript
interface TemplateConfig {
  title?: string                    // 模板标题
  sections: TemplateSection[]       // 模板分段
  requireAttachment?: boolean       // 是否需要附件
}

interface TemplateSection {
  title: string                     // 分段标题
  required: boolean                 // 是否必填
}
```

### 前端兼容格式

```typescript
interface FrontendTemplateConfig {
  id: string | number               // 模板ID
  name: string                      // 模板名称
  title?: string                    // 模板标题
  sections: TemplateSection[]       // 分段配置
  requireAttachment: boolean        // 是否需要附件
  templateType?: string             // 模板类型
  isDefault?: boolean               // 是否为默认模板
  order?: number                    // 排序
}
```

## 错误处理

所有API调用都会自动记录日志，包括请求参数和响应结果。建议在使用时进行适当的错误处理：

```typescript
try {
  const response = await getReportTemplateList()
  if (response.code === 0) {
    // 处理成功响应
    return response.data
  } else {
    // 处理业务错误
    console.warn('获取模板列表失败:', response.msg)
    return []
  }
} catch (error) {
  // 处理网络错误等异常
  console.error('API调用异常:', error)
  return []
}
```

## 与现有代码的集成

### 替换本地存储

原有代码使用 `usePlanningStore()` 进行本地存储，现在可以逐步替换为API调用：

```typescript
// 原有代码
const planning = usePlanningStore()
const templates = planning.listReportTemplates

// 新的API调用
const templates = await getEnabledTemplatesForFrontend()
```

### 数据同步

可以实现双向同步，既支持API数据，也保留本地备份：

```typescript
// 从API加载并同步到本地
const syncTemplatesFromAPI = async () => {
  const apiTemplates = await getEnabledTemplatesForFrontend()
  // 同步到本地store
  planning.setReportTemplates(apiTemplates)
  return apiTemplates
}
```

## 注意事项

1. **权限控制**: 确保用户有相应的模板管理权限
2. **数据验证**: 创建和更新模板时进行必要的数据验证
3. **缓存策略**: 对于不经常变化的模板数据可以适当缓存
4. **错误处理**: 所有API调用都应该包含适当的错误处理
5. **日志记录**: 系统会自动记录API调用日志，便于调试和监控

## 迁移指南

从本地存储迁移到API的建议步骤：

1. **并行运行**: 先保持现有本地存储功能，同时集成API
2. **数据同步**: 实现本地数据向API的一次性迁移
3. **逐步替换**: 逐个页面替换为API调用
4. **测试验证**: 确保所有功能正常工作后移除本地存储代码

这样可以确保平滑过渡，避免影响现有功能。

## 概述

本模块提供了完整的提报模板管理功能，包括模板的创建、查询、修改、删除等操作，以及与前端现有代码的兼容性支持。

## 文件结构

```
src/api/th_qd/maintenance/report-template/
├── types.ts          # 类型定义文件
├── index.ts          # 主要API接口文件
└── README.md         # 使用说明文档
```

## 核心功能模块

### 1. 基础 CRUD 操作
- 创建、查询、修改、删除提报模板
- 支持分页查询和条件筛选
- 支持Excel导出

### 2. 模板状态管理
- 启用/禁用模板
- 设置默认模板
- 模板排序管理

### 3. 业务逻辑功能
- 根据项目获取模板列表
- 获取模板统计信息
- 数据格式转换

### 4. 前端兼容性
- 与现有前端代码的数据格式转换
- 支持现有的模板配置结构

## API 接口列表

### 基础操作

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getReportTemplatePage` | GET | `/technological/template/page` | 分页查询提报模板 |
| `getReportTemplate` | GET | `/technological/template/get` | 获取提报模板详情 |
| `getReportTemplateList` | GET | `/technological/template/list` | 获取提报模板列表 |
| `createReportTemplate` | POST | `/technological/template/create` | 创建提报模板 |
| `updateReportTemplate` | PUT | `/technological/template/update` | 更新提报模板 |
| `deleteReportTemplate` | DELETE | `/technological/template/delete` | 删除提报模板 |
| `exportReportTemplateExcel` | GET | `/technological/template/export-excel` | 导出Excel |

### 业务功能

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getDefaultReportTemplate` | GET | `/technological/template/default` | 获取默认模板 |
| `setDefaultReportTemplate` | POST | `/technological/template/set-default` | 设置默认模板 |
| `enableReportTemplate` | PUT | `/technological/template/enable` | 启用模板 |
| `disableReportTemplate` | PUT | `/technological/template/disable` | 禁用模板 |
| `getReportTemplateStatistics` | GET | `/technological/template/statistics` | 获取模板统计 |
| `getReportTemplateListByProject` | GET | `/technological/template/list-by-project` | 根据项目获取模板 |

## 使用示例

### 1. 基础查询操作

```typescript
import { 
  getReportTemplateList, 
  getReportTemplate,
  TemplateStatus 
} from '@/api/th_qd/maintenance/report-template'

// 获取所有启用的模板
const getEnabledTemplates = async () => {
  const response = await getReportTemplateList({
    templateStatus: TemplateStatus.ENABLED
  })
  
  if (response.code === 0) {
    return response.data
  }
  return []
}

// 获取模板详情
const getTemplateDetail = async (id: number) => {
  const response = await getReportTemplate(id)
  return response.data
}
```

### 2. 创建和更新模板

```typescript
import { 
  createReportTemplate, 
  updateReportTemplate,
  convertToCreateRequest,
  convertToUpdateRequest
} from '@/api/th_qd/maintenance/report-template'

// 创建新模板
const createNewTemplate = async () => {
  const templateData = {
    templateCode: 'TASK_REPORT_001',
    templateName: '任务汇报模板',
    templateConfig: {
      title: '任务汇报',
      sections: [
        { title: '工作内容', required: true },
        { title: '遇到问题', required: false },
        { title: '下步计划', required: true }
      ],
      requireAttachment: false
    },
    requireAttachment: false,
    templateType: 'task'
  }
  
  const response = await createReportTemplate(templateData)
  return response.data // 返回新创建的模板ID
}

// 更新模板
const updateTemplate = async (id: number) => {
  const updateData = {
    id,
    templateName: '更新后的模板名称',
    templateConfig: {
      title: '更新后的标题',
      sections: [
        { title: '新的分段', required: true }
      ]
    }
  }
  
  const response = await updateReportTemplate(updateData)
  return response.code === 0
}
```

### 3. 前端兼容性使用

```typescript
import { 
  getEnabledTemplatesForFrontend,
  convertToFrontendConfig,
  convertToCreateRequest
} from '@/api/th_qd/maintenance/report-template'

// 获取前端格式的模板列表（兼容现有代码）
const getFrontendTemplates = async () => {
  const templates = await getEnabledTemplatesForFrontend()
  return templates
}

// 将现有前端配置保存到后端
const saveFrontendConfigToBackend = async (frontendConfig) => {
  const apiData = convertToCreateRequest(frontendConfig)
  const response = await createReportTemplate(apiData)
  return response.code === 0
}
```

### 4. 模板管理功能

```typescript
import { 
  setDefaultReportTemplate,
  enableReportTemplate,
  disableReportTemplate,
  getReportTemplateStatistics
} from '@/api/th_qd/maintenance/report-template'

// 设置默认模板
const setAsDefault = async (templateId: number) => {
  const response = await setDefaultReportTemplate(templateId)
  return response.code === 0
}

// 启用/禁用模板
const toggleTemplateStatus = async (templateId: number, enable: boolean) => {
  const response = enable 
    ? await enableReportTemplate(templateId)
    : await disableReportTemplate(templateId)
  return response.code === 0
}

// 获取统计信息
const getStats = async () => {
  const response = await getReportTemplateStatistics()
  return response.data
}
```

## 数据结构说明

### 模板配置结构

```typescript
interface TemplateConfig {
  title?: string                    // 模板标题
  sections: TemplateSection[]       // 模板分段
  requireAttachment?: boolean       // 是否需要附件
}

interface TemplateSection {
  title: string                     // 分段标题
  required: boolean                 // 是否必填
}
```

### 前端兼容格式

```typescript
interface FrontendTemplateConfig {
  id: string | number               // 模板ID
  name: string                      // 模板名称
  title?: string                    // 模板标题
  sections: TemplateSection[]       // 分段配置
  requireAttachment: boolean        // 是否需要附件
  templateType?: string             // 模板类型
  isDefault?: boolean               // 是否为默认模板
  order?: number                    // 排序
}
```

## 错误处理

所有API调用都会自动记录日志，包括请求参数和响应结果。建议在使用时进行适当的错误处理：

```typescript
try {
  const response = await getReportTemplateList()
  if (response.code === 0) {
    // 处理成功响应
    return response.data
  } else {
    // 处理业务错误
    console.warn('获取模板列表失败:', response.msg)
    return []
  }
} catch (error) {
  // 处理网络错误等异常
  console.error('API调用异常:', error)
  return []
}
```

## 与现有代码的集成

### 替换本地存储

原有代码使用 `usePlanningStore()` 进行本地存储，现在可以逐步替换为API调用：

```typescript
// 原有代码
const planning = usePlanningStore()
const templates = planning.listReportTemplates

// 新的API调用
const templates = await getEnabledTemplatesForFrontend()
```

### 数据同步

可以实现双向同步，既支持API数据，也保留本地备份：

```typescript
// 从API加载并同步到本地
const syncTemplatesFromAPI = async () => {
  const apiTemplates = await getEnabledTemplatesForFrontend()
  // 同步到本地store
  planning.setReportTemplates(apiTemplates)
  return apiTemplates
}
```

## 注意事项

1. **权限控制**: 确保用户有相应的模板管理权限
2. **数据验证**: 创建和更新模板时进行必要的数据验证
3. **缓存策略**: 对于不经常变化的模板数据可以适当缓存
4. **错误处理**: 所有API调用都应该包含适当的错误处理
5. **日志记录**: 系统会自动记录API调用日志，便于调试和监控

## 迁移指南

从本地存储迁移到API的建议步骤：

1. **并行运行**: 先保持现有本地存储功能，同时集成API
2. **数据同步**: 实现本地数据向API的一次性迁移
3. **逐步替换**: 逐个页面替换为API调用
4. **测试验证**: 确保所有功能正常工作后移除本地存储代码

这样可以确保平滑过渡，避免影响现有功能。
