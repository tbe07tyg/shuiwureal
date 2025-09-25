import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：项目实施v3 - 任务统计与里程碑管理接口
 * 维护人：科研管理系统
 * 日期：2025-01-29
 * 说明：封装任务统计、里程碑管理等接口，提供项目进度监控数据
 */

// ===== 类型定义 =====

export interface MilestoneSaveReqVO {
  id?: number                    // 主键ID（更新时必填）
  projectId: number             // 项目ID（必填）
  milestoneName: string         // 里程碑名称（必填）
  milestoneDescription?: string  // 里程碑描述
  plannedDate?: string          // 计划完成日期
  actualDate?: string           // 实际完成日期
  milestoneType?: number        // 里程碑类型
  status?: number               // 状态（1-未开始, 2-进行中, 3-已完成, 4-已逾期）
  priority?: string             // 优先级
  criteria?: string             // 完成标准
  remark?: string               // 备注
}

export interface MilestoneRespVO {
  id: number
  projectId: number
  milestoneName: string
  milestoneDescription?: string
  plannedDate?: string
  actualDate?: string
  milestoneType?: number
  status: number
  priority?: string
  criteria?: string
  remark?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
}

export interface MilestonePageReqVO {
  projectId?: string            // 项目ID
  milestoneName?: string        // 里程碑名称
  milestoneType?: string        // 里程碑类型
  status?: string               // 状态
  priority?: string             // 优先级
  plannedDateStart?: string     // 计划完成日期开始
  plannedDateEnd?: string       // 计划完成日期结束
  pageNo?: number               // 页码
  pageSize?: number             // 每页数量
}

export interface TaskStatisticsRespVO {
  totalTasks: number            // 总任务数
  completedTasks: number        // 已完成任务数
  inProgressTasks: number       // 进行中任务数
  pendingTasks: number          // 待分配任务数
  overdueTasks: number          // 已逾期任务数
  completionRate: number        // 完成率（百分比）
  overdueRate: number           // 逾期率（百分比）
  totalEstimatedHours: number   // 总预估工时
  totalActualHours: number      // 总实际工时
  progressRate: number          // 进度率（百分比）
}

export interface MilestoneStatisticsRespVO {
  totalMilestones: number       // 总里程碑数
  completedMilestones: number   // 已完成里程碑数
  inProgressMilestones: number  // 进行中里程碑数
  pendingMilestones: number     // 未开始里程碑数
  overdueMilestones: number     // 已逾期里程碑数
  completionRate: number        // 完成率（百分比）
  overdueRate: number           // 逾期率（百分比）
}

export interface ProjectProgressRespVO {
  projectId: number
  projectName: string
  taskStatistics: TaskStatisticsRespVO
  milestoneStatistics: MilestoneStatisticsRespVO
  overallProgress: number       // 整体进度（百分比）
  riskLevel: string            // 风险等级（低、中、高）
  lastUpdateTime: string       // 最后更新时间
}

// ===== 里程碑管理接口 =====

/**
 * 创建里程碑
 * POST /admin-api/technological/milestone/create
 */
export const createMilestone = async (data: MilestoneSaveReqVO) => {
  const url = '/technological/milestone/create'
  apiLog({ action: '创建里程碑', api: 'createMilestone', method: 'POST', url, params: data })
  const res = await request.post({ url, data })
  apiLog({ action: '创建里程碑', api: 'createMilestone', method: 'POST', url, params: data }, res)
  return res
}

/**
 * 更新里程碑
 * PUT /admin-api/technological/milestone/update
 */
export const updateMilestone = async (data: MilestoneSaveReqVO) => {
  const url = '/technological/milestone/update'
  apiLog({ action: '更新里程碑', api: 'updateMilestone', method: 'PUT', url, params: data })
  const res = await request.put({ url, data })
  apiLog({ action: '更新里程碑', api: 'updateMilestone', method: 'PUT', url, params: data }, res)
  return res
}

/**
 * 获得里程碑分页
 * GET /admin-api/technological/milestone/page
 */
export const getMilestonePage = async (params: MilestonePageReqVO) => {
  const url = '/technological/milestone/page'
  apiLog({ action: '获得里程碑分页', api: 'getMilestonePage', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得里程碑分页', api: 'getMilestonePage', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得里程碑详情
 * GET /admin-api/technological/milestone/get
 */
export const getMilestone = async (id: number) => {
  const url = '/technological/milestone/get'
  const params = { id }
  apiLog({ action: '获得里程碑详情', api: 'getMilestone', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得里程碑详情', api: 'getMilestone', method: 'GET', url, params }, res)
  return res
}

/**
 * 删除里程碑
 * DELETE /admin-api/technological/milestone/delete
 */
export const deleteMilestone = async (id: number) => {
  const url = '/technological/milestone/delete'
  const params = { id }
  apiLog({ action: '删除里程碑', api: 'deleteMilestone', method: 'DELETE', url, params })
  const res = await request.delete({ url, params })
  apiLog({ action: '删除里程碑', api: 'deleteMilestone', method: 'DELETE', url, params }, res)
  return res
}

/**
 * 根据任务ID获取关联里程碑
 * GET /admin-api/technological/milestone/get-by-task
 */
export const getMilestoneByTask = async (taskId: number) => {
  const url = '/technological/milestone/get-by-task'
  const params = { taskId }
  apiLog({ action: '根据任务ID获取关联里程碑', api: 'getMilestoneByTask', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '根据任务ID获取关联里程碑', api: 'getMilestoneByTask', method: 'GET', url, params }, res)
  return res
}

// ===== 任务统计接口 =====

/**
 * 获得项目任务统计
 * GET /admin-api/technological/task/statistics
 */
export const getTaskStatistics = async (projectId: number) => {
  const url = '/technological/task/statistics'
  const params = { projectId }
  apiLog({ action: '获得项目任务统计', api: 'getTaskStatistics', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得项目任务统计', api: 'getTaskStatistics', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得项目里程碑统计
 * GET /admin-api/technological/milestone/statistics
 */
export const getMilestoneStatistics = async (projectId: number) => {
  const url = '/technological/milestone/statistics'
  const params = { projectId }
  apiLog({ action: '获得项目里程碑统计', api: 'getMilestoneStatistics', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得项目里程碑统计', api: 'getMilestoneStatistics', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得项目整体进度
 * GET /admin-api/technological/project/progress
 */
export const getProjectProgress = async (projectId: number) => {
  const url = '/technological/project/progress'
  const params = { projectId }
  apiLog({ action: '获得项目整体进度', api: 'getProjectProgress', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得项目整体进度', api: 'getProjectProgress', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得团队成员任务统计
 * 注意：后端暂无 member-statistics 接口，使用任务分配统计接口代替
 * GET /admin-api/technological/task-assignment/statistics
 */
export const getMemberTaskStatistics = async (memberId: number, projectId?: number) => {
  const url = '/technological/task-assignment/statistics'
  const params: any = {}
  if (projectId) params.projectId = projectId
  // 注意：任务分配统计接口可能不支持按成员过滤，先尝试项目级统计
  // memberId 参数保留以保持接口兼容性，但当前未使用
  console.log('📊 获取成员任务统计:', { memberId, projectId })
  
  apiLog({ action: '获得团队成员任务统计(使用分配统计接口)', api: 'getMemberTaskStatistics', method: 'GET', url, params })
  try {
    const res = await request.get({ url, params })
    apiLog({ action: '获得团队成员任务统计(使用分配统计接口)', api: 'getMemberTaskStatistics', method: 'GET', url, params }, res)
    return res
  } catch (error: any) {
    console.warn('⚠️ 任务分配统计接口调用失败，返回空结果:', error)
    const errorMsg = error?.message || String(error)
    apiLog({ action: '获得团队成员任务统计(使用分配统计接口)', api: 'getMemberTaskStatistics', method: 'GET', url, params, expect: `错误: ${errorMsg}` })
    // 返回空统计结果，避免阻塞页面
    return { data: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 } }
  }
}

// ===== 工具函数 =====

/**
 * 将前端里程碑数据转换为后端请求格式
 */
export const transformMilestoneToBackend = (milestone: any): MilestoneSaveReqVO => {
  return {
    id: milestone.id,
    projectId: Number(milestone.projectId),
    milestoneName: milestone.name || milestone.milestoneName,
    milestoneDescription: milestone.description || milestone.milestoneDescription,
    plannedDate: milestone.plannedDate,
    actualDate: milestone.actualDate,
    milestoneType: milestone.milestoneType,
    status: milestone.status,
    priority: milestone.priority,
    criteria: milestone.criteria,
    remark: milestone.remark
  }
}

/**
 * 将后端响应数据转换为前端格式
 */
export const transformMilestoneFromBackend = (milestone: MilestoneRespVO): any => {
  return {
    id: milestone.id.toString(),
    projectId: milestone.projectId.toString(),
    name: milestone.milestoneName,
    milestoneName: milestone.milestoneName,
    description: milestone.milestoneDescription,
    milestoneDescription: milestone.milestoneDescription,
    plannedDate: milestone.plannedDate,
    actualDate: milestone.actualDate,
    milestoneType: milestone.milestoneType,
    status: milestone.status,
    priority: milestone.priority,
    criteria: milestone.criteria,
    remark: milestone.remark,
    taskId: milestone.taskId, // 添加对taskId字段的处理
    createTime: milestone.createTime,
    updateTime: milestone.updateTime,
    creator: milestone.creator,
    updater: milestone.updater
  }
}

/**
 * 计算任务完成率
 */
export const calculateTaskCompletionRate = (statistics: TaskStatisticsRespVO): number => {
  if (statistics.totalTasks === 0) return 0
  return Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
}

/**
 * 计算里程碑完成率
 */
export const calculateMilestoneCompletionRate = (statistics: MilestoneStatisticsRespVO): number => {
  if (statistics.totalMilestones === 0) return 0
  return Math.round((statistics.completedMilestones / statistics.totalMilestones) * 100)
}

/**
 * 获取风险等级
 */
export const getRiskLevel = (overdueRate: number, completionRate: number): string => {
  if (overdueRate > 30 || completionRate < 50) return '高'
  if (overdueRate > 15 || completionRate < 70) return '中'
  return '低'
}
