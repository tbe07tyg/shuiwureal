// 统一类型定义（实施管理 v3）

// 任务实体（精简版，与页面当前使用的字段对齐）
export interface ImplV3Task {
  id: string
  name: string
  description?: string
  priority?: string
  startDate?: string
  endDate?: string
  dueDate?: string
  primaryMilestoneId?: string
}

// 团队成员统计响应（仅当前使用字段）
export interface TeamMemberStatisticsResp {
  totalMembers?: number
  totalCurrentTasks?: number
  totalCompletedTasks?: number
  idleMembers?: number
}


