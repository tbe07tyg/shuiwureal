# 项目开题系统 API 使用说明

## 概述

本项目开题系统API模块提供了完整的开题申请管理功能，包括申请创建、材料管理、会议组织、结论管理等。

## 文件结构

```
src/api/th_qd/opening/
├── types.ts          # 类型定义文件
├── opening.ts        # 主要API接口文件
├── project.ts        # 项目选择相关API
└── README.md         # 使用说明文档
```

## 核心功能模块

### 1. 项目开题申请管理
- 创建、查询、修改、删除开题申请
- 支持分页查询和条件筛选
- 支持Excel导出

### 2. 开题材料管理
- 材料上传、查询、修改、删除
- 材料审核状态管理
- 支持必传和可选材料

### 3. 开题会议管理
- 会议创建、安排、管理
- 会议参与人管理
- 会议材料管理

### 4. 开题结论管理
- 开题结论录入和查询
- 整改要求管理
- 结论文件管理

### 5. 项目选择功能
- 可选项目列表查询
- 项目详情获取
- 项目开题资格检查

## API 接口列表

### 项目开题申请相关

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getProposalApplicationPage` | GET | `/technological/proposal-application-rewrite/page` | 分页查询开题申请 |
| `getProposalApplication` | GET | `/technological/proposal-application-rewrite/get` | 获取开题申请详情 |
| `createProposalApplication` | POST | `/technological/proposal-application-rewrite/create` | 创建开题申请 (严格按照API文档) |
| `updateProposalApplication` | PUT | `/technological/proposal-application-rewrite/update` | 更新开题申请 |
| `deleteProposalApplication` | DELETE | `/technological/proposal-application-rewrite/delete` | 删除开题申请 |
| `saveProposalApplicationDraft` | POST | `/technological/proposal-application-rewrite/create` | 保存开题申请草稿 (通过applicationStatus: 0) |
| `submitProposalApplication` | PUT | `/technological/proposal-application-rewrite/submit` | 提交开题申请 |
| `withdrawProposalApplication` | PUT | `/technological/proposal-application-rewrite/withdraw` | 撤回开题申请 |
| `checkProjectOpeningStatus` | GET | `/technological/proposal-application-rewrite/check-project-status` | 检查项目开题状态 |
| `getMyProposalApplications` | GET | `/technological/proposal-application-rewrite/my-applications` | 获取用户的开题申请列表 |

### 项目选择相关

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getAvailableProjectsForOpening` | GET | `/technologicalproject/technological-project/page` | 获取可选项目列表 |
| `getProjectDetailForOpening` | GET | `/technologicalproject/technological-project/get` | 获取项目详情 |
| `searchProjectsForOpening` | GET | `/technologicalproject/technological-project/page` | 搜索项目 |
| `checkProjectOpeningEligibility` | GET | `/technologicalproject/technological-project/check-opening-eligibility` | 检查项目开题资格 |

### 开题材料管理相关

| 接口名称 | 方法 | 路径 | 说明 |
|----------|------|------|------|
| `getProposalMaterialPage` | GET | `/technological/proposal-material-rewrite/page` | 分页查询开题材料 |
| `getProposalMaterial` | GET | `/technological/proposal-material-rewrite/get` | 获取开题材料详情 |
| `createProposalMaterial` | POST | `/technological/proposal-material-rewrite/create` | 创建开题材料 |
| `updateProposalMaterial` | PUT | `/technological/proposal-material-rewrite/update` | 更新开题材料 |
| `deleteProposalMaterial` | DELETE | `/technological/proposal-material-rewrite/delete` | 删除开题材料 |
| `uploadProposalMaterialFile` | POST | `/technological/proposal-material-rewrite/upload-file` | 上传开题材料文件 |
| `getProposalApplicationMaterials` | GET | `/technological/proposal-material-rewrite/list-by-application` | 获取开题申请的材料列表 |
| `validateProposalMaterials` | GET | `/technological/proposal-material-rewrite/validate-materials` | 验证开题材料完整性 |

## 使用示例

### 1. 获取可选项目列表

```typescript
import { getAvailableProjectsForOpening } from '@/api/th_qd/opening/project'

// 获取可申请开题的项目列表
const loadAvailableProjects = async () => {
  try {
    const response = await getAvailableProjectsForOpening({
      pageNo: 1,
      pageSize: 100,
      projectStatus: [1, 2], // 实施中、即将结束
      keyword: '智慧城市' // 可选关键词搜索
    })
    
    if (response.data && response.data.list) {
      // 处理项目列表数据
      console.log('可选项目:', response.data.list)
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}
```

### 2. 创建开题申请

```typescript
import { createProposalApplication } from '@/api/th_qd/opening/opening'
import type { ProposalApplicationSaveReqVO } from '@/api/th_qd/opening/types'

const submitOpeningApplication = async (formData: any) => {
  try {
    const applicationData: ProposalApplicationSaveReqVO = {
      id: 0, // 新增时设为0，后端会自动生成
      projectId: Number(formData.projectId), // 确保是数字类型
      applicationNo: `KT${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`, // 生成申请编号
      applicationType: Number(formData.applicationType), // 1-初步开题, 2-正式开题, 3-专项开题
      applicationStatus: 1, // 1-材料审核中
      expectedProposalTime: formData.expectedProposalTime.format('YYYY-MM-DD'),
      applicationDescription: formData.applicationDescription,
      notes: formData.notes
    }
    
    const response = await createProposalApplication(applicationData)
    
    if (response.code === 0) { // 注意：后端返回code是0表示成功
      message.success('开题申请提交成功')
      // 跳转到申请管理页面
      router.push('/th-qd-project/implementation/opening/applicant/manage')
    }
  } catch (error) {
    console.error('提交开题申请失败:', error)
    message.error('提交失败，请重试')
  }
}
```

### 3. 保存开题申请草稿

```typescript
import { saveProposalApplicationDraft } from '@/api/th_qd/opening/opening'

const saveDraft = async (formData: any) => {
  try {
    const draftData: ProposalApplicationSaveReqVO = {
      projectId: Number(formData.projectId),
      applicationType: Number(formData.applicationType),
      applicationStatus: 0, // 0-草稿状态
      expectedProposalTime: formData.expectedProposalTime.format('YYYY-MM-DD'),
      applicationDescription: formData.applicationDescription,
      notes: formData.notes
    }
    
    const response = await saveProposalApplicationDraft(draftData)
    
    if (response.code === 200) {
      message.success('草稿保存成功')
      console.log('草稿ID:', response.data)
      // 可以保存草稿ID用于后续编辑
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    message.error('保存失败，请重试')
  }
}
```

### 3. 查询开题申请列表

```typescript
import { getProposalApplicationPage } from '@/api/th_qd/opening/opening'
import type { ProposalApplicationPageReqVO } from '@/api/th_qd/opening/types'

const loadOpeningApplications = async (filters: any) => {
  try {
    const params: ProposalApplicationPageReqVO = {
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 10,
      applicationStatus: filters.status ? 
        (filters.status === 'material_reviewing' ? 1 :
         filters.status === 'meeting_pending' ? 2 :
         filters.status === 'meeting_scheduled' ? 3 :
         filters.status === 'opening_passed' ? 4 :
         filters.status === 'opening_conditional' ? 5 : 6) : undefined,
      keyword: filters.keyword
    }
    
    const response = await getProposalApplicationPage(params)
    
    if (response.data) {
      // 处理分页数据
      const { list, total } = response.data
      console.log('开题申请列表:', list)
      console.log('总数:', total)
    }
  } catch (error) {
    console.error('获取开题申请列表失败:', error)
  }
}
```

## 状态值映射

### 开题申请状态

| 前端状态值 | API状态值 | 说明 |
|------------|-----------|------|
| `material_reviewing` | `1` | 材料审核中 |
| `meeting_pending` | `2` | 会议待组织 |
| `meeting_scheduled` | `3` | 会议已安排 |
| `opening_passed` | `4` | 开题通过 |
| `opening_conditional` | `5` | 有条件通过 |
| `opening_failed` | `6` | 开题未通过 |

### 开题申请类型

| 前端类型值 | API类型值 | 说明 |
|------------|-----------|------|
| `preliminary` | `1` | 初步开题 |
| `formal` | `2` | 正式开题 |
| `special` | `3` | 专项开题 |

### 会议类型

| 前端类型值 | API类型值 | 说明 |
|------------|-----------|------|
| `offline` | `0` | 现场会议 |
| `online` | `1` | 线上会议 |
| `hybrid` | `2` | 混合会议 |

## API 请求参数和响应说明

### 开题申请创建/保存接口

#### `createProposalApplication` - 创建开题申请
- **请求方法**: POST
- **请求路径**: `/technological/proposal-application-rewrite/create`
- **请求参数**:
  ```typescript
  interface ProposalApplicationSaveReqVO {
    projectId: number                    // 项目ID (必填)
    applicationType: number              // 开题类型 (必填): 1-初步开题, 2-正式开题, 3-专项开题
    applicationStatus?: number           // 申请状态 (可选): 1-材料审核中, 2-会议待组织, 3-会议已安排, 4-开题通过, 5-有条件通过, 6-开题未通过
    expectedProposalTime?: string        // 预期开题时间 (可选): YYYY-MM-DD格式
    applicationDescription?: string      // 申请说明 (可选): 开题申请的具体描述
    notes?: string                       // 备注 (可选): 其他补充说明
    proposalMaterialRewriteDOList?: ProposalMaterialRewriteDO[] // 开题申请材料列表 (可选)
  }
  ```
- **响应数据**:
  ```typescript
  interface OpeningApiResponse<number> {
    code: number                         // 响应状态码: 200-成功
    data: number                         // 响应数据: 申请ID
    msg: string                          // 响应消息
  }
  ```

#### `saveProposalApplicationDraft` - 保存开题申请草稿
- **请求方法**: POST
- **请求路径**: `/technological/proposal-application-rewrite/create`
- **请求参数**: 同 `createProposalApplication`，但设置 `applicationStatus: 0`
- **响应数据**: 同 `createProposalApplication`

## 注意事项

1. **权限控制**: 确保用户只能访问有权限的数据
2. **状态同步**: 前后端状态值需要保持一致
3. **错误处理**: 所有API调用都应该包含适当的错误处理
4. **数据验证**: 提交数据前进行必要的验证
5. **缓存策略**: 对于不经常变化的数据可以适当缓存

## ⚠️ 已知问题

### 项目状态检查API
- **接口**: `checkProjectOpeningStatus`
- **状态**: 后端API未实现，返回404错误
- **临时方案**: 前端暂时禁用状态检查，允许用户选择项目
- **建议**: 后端需要实现项目开题资格检查接口

### 建议的后端API路径
```
GET /technological/proposal-application-rewrite/check-project-eligibility
参数: projectId (项目ID)
返回: {
  hasApplication: boolean,    // 是否已有申请
  canSubmit: boolean,         // 是否可以提交
  reason?: string,            // 不能提交的原因
  existingApplicationId?: number,  // 现有申请ID
  existingApplicationStatus?: number  // 现有申请状态
}
```

## 常见问题

### Q: 如何判断项目是否可以申请开题？
A: 使用 `checkProjectOpeningEligibility` 接口检查项目的开题资格。

### Q: 如何处理材料上传？
A: 先调用材料上传接口获取文件URL，然后调用 `createProposalMaterial` 创建材料记录。

### Q: 如何获取项目的开题历史？
A: 使用 `getProjectOpeningHistory` 接口查询项目的开题申请历史。

### Q: 状态值不匹配怎么办？
A: 参考状态值映射表，在前端进行相应的转换。

## 更新日志

- **v1.0.0**: 初始版本，包含基础的开题申请管理功能
- **v1.1.0**: 新增项目选择相关API
- **v1.2.0**: 完善材料管理和会议管理功能
