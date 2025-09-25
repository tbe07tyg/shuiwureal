# 项目立项模块 - 前后端联调指南

## 📋 概述

本模块提供完整的**项目立项**相关功能的前后端联调解决方案，涵盖项目申请、材料审核、会议管理、整改记录等全流程业务。

## 🏗️ 架构设计

```
src/api/th_qd/approval/
├── types.ts          # TypeScript类型定义
├── index.ts          # API服务封装
└── README.md         # 使用说明（本文件）

src/stores/modules/th_qd/
└── approval.ts       # Pinia状态管理Store
```

## 🚀 快速开始

### 1. 基础配置

确保您的项目已正确配置API基础设置：

```typescript
// 请求头由axios拦截器自动处理，无需手动配置
// - Authorization: 从登录token动态获取
// - tenant-id: 从用户租户信息动态获取
// 详见: src/config/axios/service.ts
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 项目列表 -->
    <el-table v-loading="projectLoading" :data="projectList">
      <el-table-column prop="projectName" label="项目名称" />
      <el-table-column prop="applicant" label="申请人" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getProjectStatusColor(row.status)">
            {{ getProjectStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="viewProject(row.id)">查看</el-button>
          <el-button @click="editProject(row)">编辑</el-button>
          <el-button type="danger" @click="deleteProject(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="searchParams.pageNo"
      v-model:page-size="searchParams.pageSize"
      :total="projectTotal"
      @current-change="fetchProjectList"
      @size-change="fetchProjectList"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useApprovalStore } from '@/stores/modules/th_qd/approval'

const {
  // 状态
  projectList,
  projectTotal,
  projectLoading,
  searchParams,
  
  // 计算属性
  getProjectStatusLabel,
  getProjectStatusColor,
  
  // 方法
  fetchProjectList,
  fetchProjectDetail,
  deleteProject
} = useApprovalStore()

// 页面加载时获取项目列表
onMounted(() => {
  fetchProjectList()
})

// 查看项目详情
const viewProject = async (id: number) => {
  await fetchProjectDetail(id)
  // 这里可以打开详情弹窗或跳转到详情页
}

// 编辑项目
const editProject = (project: any) => {
  // 这里可以打开编辑弹窗
}
</script>
```

## 🔄 API接口详解

### 项目管理接口

| 接口名称 | HTTP方法 | 路径 | 说明 |
|---------|---------|------|------|
| getTechnologicalProjectPage | GET | `/admin-api/technologicalproject/technological-project/page` | 获取项目分页列表 |
| getTechnologicalProject | GET | `/admin-api/technologicalproject/technological-project/get` | 获取项目详情 |
| createTechnologicalProject | POST | `/admin-api/technologicalproject/technological-project/create` | 创建项目 |
| updateTechnologicalProject | PUT | `/admin-api/technologicalproject/technological-project/update` | 更新项目 |
| deleteTechnologicalProject | DELETE | `/admin-api/technologicalproject/technological-project/delete` | 删除项目 |

### 业务流程接口

| 接口名称 | 说明 | 状态变更 |
|---------|------|---------|
| submitTechnologicalProject | 提交项目申请 | 草稿 → 材料审核中 |
| approveProjectMaterial | 审核通过材料 | 材料审核中 → 会议待组织 |
| rejectProjectMaterial | 驳回材料 | 材料审核中 → 材料驳回 |
| approveProject | 项目立项通过 | 会议进行中 → 立项通过 |
| rejectProject | 项目立项未通过 | 会议进行中 → 立项未通过 |

## 📊 数据结构

### 项目状态枚举

```typescript
export enum ProjectStatus {
  DRAFT = 0,                    // 草稿
  MATERIAL_REVIEWING = 1,       // 材料审核中
  MATERIAL_REJECTED = 2,        // 材料驳回
  MEETING_PENDING = 3,          // 会议待组织
  MEETING_SCHEDULED = 4,        // 会议已安排
  MEETING_IN_PROGRESS = 5,      // 会议进行中
  CONDITIONALLY_PASSED = 6,     // 有条件通过
  RECTIFYING = 7,               // 整改中
  PROJECT_APPROVED = 8,         // 立项通过
  PROJECT_REJECTED = 9          // 立项未通过
}
```

### 项目数据结构

```typescript
export interface TechnologicalProjectRespVO {
  id: number                    // 主键ID
  projectNo: string            // 项目编号
  projectName: string          // 立项名称
  yearly: number               // 年度
  applicant: string            // 申请人
  applicantUnit: string        // 申请单位
  projectCycle: number         // 项目周期(月)
  budget: number               // 预算(万元)
  status: ProjectStatus        // 项目状态
  // ... 其他字段
}
```

## 🧪 联调测试用例

### 1. 基础CRUD操作测试

```typescript
// 测试文件: tests/approval-api.test.ts
import { describe, it, expect } from 'vitest'
import { useApprovalStore } from '@/stores/modules/th_qd/approval'

describe('项目立项API联调测试', () => {
  const store = useApprovalStore()
  
  it('应该能够获取项目列表', async () => {
    await store.fetchProjectList({
      pageNo: 1,
      pageSize: 10
    })
    
    expect(store.projectList).toBeDefined()
    expect(store.projectTotal).toBeGreaterThanOrEqual(0)
  })
  
  it('应该能够创建新项目', async () => {
    const newProject = {
      projectNo: 'TEST001',
      projectName: '测试项目',
      yearly: 2024,
      applicant: '测试申请人',
      applicantUnit: '测试单位',
      projectCycle: 12,
      budget: 100,
      status: 0 // 草稿状态
    }
    
    const result = await store.createProject(newProject)
    expect(result).toBe(true)
  })
  
  it('应该能够更新项目状态', async () => {
    // 假设已有项目ID为1
    const result = await store.submitProject(1)
    expect(result).toBe(true)
  })
})
```

### 2. 错误处理测试

```typescript
// 测试网络错误
it('应该正确处理网络错误', async () => {
  // 模拟网络错误
  vi.mock('@/config/axios', () => ({
    default: {
      get: vi.fn().mockRejectedValue(new Error('Network Error'))
    }
  }))
  
  const result = await store.fetchProjectList()
  expect(result).toBe(false)
})

// 测试API错误响应
it('应该正确处理API错误响应', async () => {
  vi.mock('@/config/axios', () => ({
    default: {
      get: vi.fn().mockResolvedValue({
        data: { code: 500, msg: '服务器内部错误' }
      })
    }
  }))
  
  const result = await store.fetchProjectList()
  expect(result).toBe(false)
})
```

## 🔧 开发调试

### 1. 启用详细日志

在开发环境中，可以在浏览器控制台查看详细的API调用日志：

```javascript
// 在浏览器控制台执行
localStorage.setItem('DEBUG_API', 'true')
```

### 2. 测试API连通性

```typescript
// 快速测试API连通性
import { getTechnologicalProjectPage } from '@/api/th_qd/approval'

const testConnection = async () => {
  try {
    const result = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 1
    })
    console.log('API连接成功:', result.data)
  } catch (error) {
    console.error('API连接失败:', error)
  }
}

testConnection()
```

### 3. Mock数据支持

在开发阶段，可以使用Mock数据：

```typescript
// src/mock/approval.ts
export const mockProjectList = [
  {
    id: 1,
    projectNo: 'PROJ001',
    projectName: '水务科研管理系统',
    yearly: 2024,
    applicant: '张三',
    applicantUnit: '研发部',
    projectCycle: 12,
    budget: 100,
    status: 1,
    createTime: '2024-01-01 10:00:00'
  }
  // ... 更多Mock数据
]
```

## ⚠️ 常见问题

### 1. 认证Token过期

**问题**: API返回401未授权错误  
**解决**: 检查并更新Authorization header中的Token

```typescript
// 在axios拦截器中处理Token刷新
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 重新登录或刷新Token
      // ...
    }
    return Promise.reject(error)
  }
)
```

### 2. 跨域问题

**问题**: CORS跨域访问被阻止  
**解决**: 配置开发环境代理

```typescript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/admin-api': {
        target: 'http://2f913969b6.goho.co',
        changeOrigin: true
      }
    }
  }
}
```

### 3. 类型错误

**问题**: TypeScript类型不匹配  
**解决**: 确保类型定义与后端接口一致

```typescript
// 检查接口响应格式
interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}
```

## 🔗 相关文档

- [后端接口文档](./src/api/all_OpenAPI.json)
- [Vue3 Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html)
- [Pinia状态管理](https://pinia.vuejs.org/)
- [Element Plus组件库](https://element-plus.org/)

## 📝 更新日志

- **v1.0.0** (2024-01-01): 初始版本，支持项目立项基础功能
- **v1.1.0** (预计): 增加会议管理、整改记录等功能