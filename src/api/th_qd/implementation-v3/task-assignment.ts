import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：项目实施v3 - 任务分配管理接口
 * 维护人：科研管理系统
 * 日期：2025-01-29
 * 说明：封装任务分配管理的完整接口，包括分配记录CRUD、通知发送等功能
 */

// ===== 类型定义 =====

export interface TaskAssignmentSaveReqVO {
  id?: number                    // 主键ID（更新时必填）
  taskId: number                // 任务ID（必填）
  assigneeMemberId: number      // 负责人成员ID（必填）
  assigneeName: string          // 负责人姓名（必填）
  collaboratorMemberIds?: string // 协作人员ID列表（JSON字符串）
  assignNotes?: string          // 分配备注
  assignTime?: string           // 分配时间
  assignerId?: number           // 分配人ID
  assignerName?: string         // 分配人姓名
  status?: number               // 分配状态（1-已分配, 2-已接受, 3-已拒绝）
  acceptTime?: string           // 接受时间
  rejectReason?: string         // 拒绝原因
}

export interface TaskAssignmentRespVO {
  id: number
  taskId: number
  assigneeMemberId: number
  assigneeName: string
  collaboratorMemberIds?: string
  assignNotes?: string
  assignTime?: string
  assignerId?: number
  assignerName?: string
  status: number
  acceptTime?: string
  rejectReason?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
}

export interface TaskAssignmentPageReqVO {
  taskId?: string               // 任务ID
  assigneeMemberId?: string     // 负责人成员ID
  assigneeName?: string         // 负责人姓名
  assignerId?: string           // 分配人ID
  assignerName?: string         // 分配人姓名
  status?: string               // 分配状态
  assignTimeStart?: string      // 分配时间开始
  assignTimeEnd?: string        // 分配时间结束
  pageNo?: number               // 页码
  pageSize?: number             // 每页数量
}

// ===== 任务分配记录CRUD接口 =====

/**
 * 创建任务分配记录
 * POST /admin-api/technological/task-assignment/create
 */
export const createTaskAssignment = async (data: TaskAssignmentSaveReqVO) => {
  const url = '/technological/task-assignment/create'
  apiLog({ action: '创建任务分配记录', api: 'createTaskAssignment', method: 'POST', url, params: data })
  const res = await request.post({ url, data })
  apiLog({ action: '创建任务分配记录', api: 'createTaskAssignment', method: 'POST', url, params: data }, res)
  return res
}

/**
 * 更新任务分配记录
 * PUT /admin-api/technological/task-assignment/update
 */
export const updateTaskAssignment = async (data: TaskAssignmentSaveReqVO) => {
  const url = '/technological/task-assignment/update'
  apiLog({ action: '更新任务分配记录', api: 'updateTaskAssignment', method: 'PUT', url, params: data })
  const res = await request.put({ url, data })
  apiLog({ action: '更新任务分配记录', api: 'updateTaskAssignment', method: 'PUT', url, params: data }, res)
  return res
}

/**
 * 获得任务分配记录分页
 * GET /admin-api/technological/task-assignment/page
 */
export const getTaskAssignmentPage = async (params: TaskAssignmentPageReqVO) => {
  const url = '/technological/task-assignment/page'
  apiLog({ action: '获得任务分配记录分页', api: 'getTaskAssignmentPage', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得任务分配记录分页', api: 'getTaskAssignmentPage', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得任务分配记录详情
 * GET /admin-api/technological/task-assignment/get
 */
export const getTaskAssignment = async (id: number) => {
  const url = '/technological/task-assignment/get'
  const params = { id }
  apiLog({ action: '获得任务分配记录详情', api: 'getTaskAssignment', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得任务分配记录详情', api: 'getTaskAssignment', method: 'GET', url, params }, res)
  return res
}

/**
 * 删除任务分配记录
 * DELETE /admin-api/technological/task-assignment/delete
 */
export const deleteTaskAssignment = async (id: number) => {
  const url = '/technological/task-assignment/delete'
  const params = { id }
  apiLog({ action: '删除任务分配记录', api: 'deleteTaskAssignment', method: 'DELETE', url, params })
  const res = await request.delete({ url, params })
  apiLog({ action: '删除任务分配记录', api: 'deleteTaskAssignment', method: 'DELETE', url, params }, res)
  return res
}

// ===== 任务分配查询接口 =====

/**
 * 根据任务ID获取分配记录
 * GET /admin-api/technological/task-assignment/get-by-task
 */
export const getTaskAssignmentsByTask = async (taskId: number) => {
  const url = '/technological/task-assignment/get-by-task'
  const params = { taskId }
  apiLog({ action: '根据任务ID获取分配记录', api: 'getTaskAssignmentsByTask', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '根据任务ID获取分配记录', api: 'getTaskAssignmentsByTask', method: 'GET', url, params }, res)
  return res
}

// ===== 任务分配操作接口 =====

/**
 * 批量分配任务
 * POST /admin-api/technological/task-assignment/batch-assign
 */
export const batchAssignTaskAssignments = async (data: {
  assignItems: Array<{
    taskId: number
    assigneeMemberId: number
    assigneeName: string
    collaboratorMemberIds?: string
    assignNotes?: string
  }>
  batchNotes?: string
}) => {
  const url = '/technological/task-assignment/batch-assign'
  apiLog({ action: '批量分配任务', api: 'batchAssignTaskAssignments', method: 'POST', url, params: data })
  const res = await request.post({ url, data })
  apiLog({ action: '批量分配任务', api: 'batchAssignTaskAssignments', method: 'POST', url, params: data }, res)
  return res
}

/**
 * 发送分配通知
 * POST /admin-api/technological/task-assignment/send-notification
 */
export const sendAssignmentNotification = async (assignmentIds: number[]) => {
  const url = '/technological/task-assignment/send-notification'
  const params = { assignmentIds }
  apiLog({ action: '发送分配通知', api: 'sendAssignmentNotification', method: 'POST', url, params })
  const res = await request.post({ url, params })
  apiLog({ action: '发送分配通知', api: 'sendAssignmentNotification', method: 'POST', url, params }, res)
  return res
}

// ===== 工具函数 =====

/**
 * 将前端分配数据转换为后端请求格式
 */
export const transformAssignmentToBackend = (assignment: any): TaskAssignmentSaveReqVO => {
  return {
    id: assignment.id,
    taskId: Number(assignment.taskId),
    assigneeMemberId: Number(assignment.assigneeMemberId),
    assigneeName: assignment.assigneeName,
    collaboratorMemberIds: assignment.collaboratorMemberIds ? JSON.stringify(assignment.collaboratorMemberIds) : undefined,
    assignNotes: assignment.assignNotes,
    assignTime: assignment.assignTime,
    assignerId: assignment.assignerId ? Number(assignment.assignerId) : undefined,
    assignerName: assignment.assignerName,
    status: assignment.status,
    acceptTime: assignment.acceptTime,
    rejectReason: assignment.rejectReason
  }
}

/**
 * 将后端响应数据转换为前端格式
 */
export const transformAssignmentFromBackend = (assignment: TaskAssignmentRespVO): any => {
  return {
    id: assignment.id.toString(),
    taskId: assignment.taskId.toString(),
    assigneeMemberId: assignment.assigneeMemberId.toString(),
    assigneeName: assignment.assigneeName,
    collaboratorMemberIds: assignment.collaboratorMemberIds ? JSON.parse(assignment.collaboratorMemberIds) : [],
    assignNotes: assignment.assignNotes,
    assignTime: assignment.assignTime,
    assignerId: assignment.assignerId?.toString(),
    assignerName: assignment.assignerName,
    status: assignment.status,
    acceptTime: assignment.acceptTime,
    rejectReason: assignment.rejectReason,
    createTime: assignment.createTime,
    updateTime: assignment.updateTime,
    creator: assignment.creator,
    updater: assignment.updater
  }
}

// 兼容导出：页面按 batchAssignTasks 名称引用此函数
export { batchAssignTaskAssignments as batchAssignTasks }
