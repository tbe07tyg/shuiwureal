# 验收模块 API 文档

## 概述

验收模块 (`@/api/th_qd/acceptance`) 提供项目验收相关的所有 API 接口，包括申请管理、材料管理、会议管理、结论管理等核心功能。

## 模块结构

```
src/api/th_qd/acceptance/
├── index.ts          # 统一导出入口
├── types.ts          # 类型定义
├── acceptance.ts     # 核心验收接口
├── management.ts     # 管理中心接口
├── project.ts        # 项目相关接口
├── conclusion.ts     # 结论管理接口
└── README.md         # 本文档
```

## 核心类型

### 验收申请类型
```typescript
enum AcceptanceApplicationType {
  INITIAL = 1,        // 初次申请
  RESUBMIT = 2,       // 重新提交
  IMPROVEMENT = 3     // 改进申请
}
```

### 验收状态
```typescript
enum AcceptanceStatus {
  DRAFT = 0,          // 草稿
  PENDING = 1,        // 待审核
  APPROVED = 2,       // 已通过
  REJECTED = 3,       // 已拒绝
  IMPROVEMENT = 4     // 需要改进
}
```

## 主要接口

### 1. 验收申请管理 (`acceptance.ts`)

#### 获取验收申请分页列表
```typescript
getAcceptanceApplicationPage(params: AcceptanceApplicationPageReqVO): Promise<AcceptancePageResponse<AcceptanceApplicationRespVO>>
```

#### 创建验收申请
```typescript
createAcceptanceApplication(data: AcceptanceApplicationSaveReqVO): Promise<AcceptanceApiResponse<number>>
```

#### 保存验收申请草稿
```typescript
saveAcceptanceApplicationDraft(data: AcceptanceApplicationSaveReqVO): Promise<AcceptanceApiResponse<number>>
```

#### 创建验收材料
```typescript
createAcceptanceMaterial(data: AcceptanceMaterialSaveReqVO): Promise<AcceptanceApiResponse<number>>
```

### 2. 项目管理 (`project.ts`)

#### 获取可选项目列表
```typescript
getAvailableProjectsForAcceptance(params: ProjectSearchParams): Promise<AcceptancePageResponse<ProjectBasicInfoRespVO>>
```

#### 获取项目详情
```typescript
getProjectDetailForAcceptance(projectId: number): Promise<AcceptanceApiResponse<ProjectDetailRespVO>>
```

#### 检查项目验收资格
```typescript
checkProjectAcceptanceEligibility(projectId: number): Promise<AcceptanceApiResponse<AcceptanceEligibilityInfo>>
```

### 3. 管理中心 (`management.ts`)

#### 获取验收申请分页（管理中心）
```typescript
getAcceptanceApplicationPage(params: AcceptanceApplicationPageReqVO): Promise<AcceptancePageResponse<AcceptanceApplicationRespVO>>
```

#### 获取验收材料分页
```typescript
getAcceptanceMaterialPage(params: AcceptanceMaterialPageReqVO): Promise<AcceptancePageResponse<AcceptanceMaterialRespVO>>
```

#### 获取验收材料审核分页
```typescript
getAcceptanceMaterialReviewPage(params: AcceptanceMaterialReviewPageReqVO): Promise<AcceptancePageResponse<AcceptanceMaterialReviewRespVO>>
```

### 4. 结论管理 (`conclusion.ts`)

#### 创建验收会议参与者
```typescript
createAcceptanceMeetingParticipant(data: AcceptanceMeetingParticipantSaveReqVO): Promise<AcceptanceApiResponse<number>>
```

#### 获取验收会议材料分页
```typescript
getAcceptanceMeetingMaterialPage(params: AcceptanceMeetingMaterialPageReqVO): Promise<AcceptancePageResponse<AcceptanceMeetingMaterialRespVO>>
```

#### 获取验收结论文件分页
```typescript
getAcceptanceConclusionFilePage(params: AcceptanceConclusionFilePageReqVO): Promise<AcceptancePageResponse<AcceptanceConclusionFileRespVO>>
```

## 使用示例

### 基本导入
```typescript
// 导入所有类型和接口
import { 
  AcceptanceApplicationType,
  AcceptanceStatus,
  getAcceptanceApplicationPage,
  createAcceptanceApplication,
  getAvailableProjectsForAcceptance
} from '@/api/th_qd/acceptance'

// 或者使用聚合对象
import { acceptanceSystemApi } from '@/api/th_qd/acceptance'
```

### 创建验收申请
```typescript
import { createAcceptanceApplication, AcceptanceApplicationType } from '@/api/th_qd/acceptance'

const applicationData = {
  projectId: 123,
  acceptanceType: AcceptanceApplicationType.INITIAL,
  expectedAcceptanceTime: '2024-12-31',
  applicationDescription: '项目验收申请',
  notes: '备注信息'
}

try {
  const result = await createAcceptanceApplication(applicationData)
  console.log('申请创建成功，ID:', result.data)
} catch (error) {
  console.error('创建申请失败:', error)
}
```

### 获取项目列表
```typescript
import { getAvailableProjectsForAcceptance } from '@/api/th_qd/acceptance'

const searchParams = {
  pageNo: 1,
  pageSize: 10,
  keyword: '项目名称',
  projectStatus: [8] // 可验收状态
}

const projects = await getAvailableProjectsForAcceptance(searchParams)
console.log('可选项目:', projects.data.list)
```

## 字段映射对照

### 开题 → 验收字段对照
| 开题字段 | 验收字段 | 说明 |
|---------|---------|------|
| `proposalApplicationId` | `acceptanceApplicationId` | 申请ID |
| `expectedProposalTime` | `expectedAcceptanceTime` | 预期时间 |
| `applicationType` | `acceptanceType` | 申请类型 |
| `applicationDescription` | `applicationDescription` | 申请描述 |
| `notes` | `notes` | 备注 |

### API 路径对照
| 开题路径 | 验收路径 | 说明 |
|---------|---------|------|
| `/technological/proposal-application-rewrite/` | `/technological/acceptance-application/` | 申请管理 |
| `/technological/proposal-material/` | `/technological/acceptance-material/` | 材料管理 |
| `/technological/proposal-meeting/` | `/technological/acceptance-meeting/` | 会议管理 |
| `/technological/proposal-conclusion/` | `/technological/acceptance-conclusion/` | 结论管理 |

## 注意事项

1. **类型安全**: 所有接口都使用 TypeScript 类型定义，确保类型安全
2. **错误处理**: 所有接口都返回统一的 `AcceptanceApiResponse` 格式
3. **分页参数**: 分页接口统一使用 `PageParam` 和 `PageResponse` 类型
4. **字段命名**: 严格按照后端 API 文档的字段命名规范
5. **路由配置**: 验收模块路由已正确配置，支持嵌套路由

## 更新日志

- **2025-01-22**: 初始版本，完成验收模块 API 对接
- **2025-01-22**: 修复路由配置问题
- **2025-01-22**: 完成字段映射和类型定义
