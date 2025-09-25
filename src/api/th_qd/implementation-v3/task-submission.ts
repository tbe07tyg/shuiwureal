import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：项目实施v3 - 任务提交管理接口
 * 维护人：科研管理系统
 * 日期：2025-01-29
 * 说明：封装任务提交管理的完整接口，包括任务提交、审核等功能
 */

// ===== 类型定义 =====

export interface TaskSubmissionSaveReqVO {
  id?: number                    // 主键ID（更新时必填）
  taskId: number                // 任务ID（必填）
  submitterId: number           // 提交人ID（必填）
  submitterName: string         // 提交人姓名（必填）
  submissionType: number        // 提交类型（1-草稿, 2-正式提交）
  submissionContent?: string     // 提交内容
  submissionFiles?: string      // 提交文件（JSON字符串）
  submissionTime?: string       // 提交时间
  status?: number               // 状态（1-草稿, 2-已提交, 3-审核中, 4-审核通过, 5-审核不通过）
  reviewerId?: number           // 审核人ID
  reviewerName?: string         // 审核人姓名
  reviewTime?: string           // 审核时间
  reviewOpinion?: string        // 审核意见
  reviewResult?: number         // 审核结果（1-通过, 2-不通过）
  remark?: string               // 备注
}

export interface TaskSubmissionRespVO {
  id: number
  taskId: number
  submitterId: number
  submitterName: string
  submissionType: number
  submissionContent?: string
  submissionFiles?: string
  submissionTime?: string
  status: number
  reviewerId?: number
  reviewerName?: string
  reviewTime?: string
  reviewOpinion?: string
  reviewResult?: number
  remark?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
}

export interface TaskSubmissionPageReqVO {
  taskId?: string               // 任务ID
  submitterId?: string          // 提交人ID
  submitterName?: string        // 提交人姓名
  submissionType?: string       // 提交类型
  status?: string               // 状态
  reviewerId?: string           // 审核人ID
  reviewerName?: string         // 审核人姓名
  reviewResult?: string         // 审核结果
  submissionTimeStart?: string  // 提交时间开始
  submissionTimeEnd?: string    // 提交时间结束
  pageNo?: number               // 页码
  pageSize?: number             // 每页数量
}

// ===== 任务提交CRUD接口 =====

/**
 * 创建任务提交记录
 * POST /admin-api/technological/submission/create
 */
export const createTaskSubmission = async (data: TaskSubmissionSaveReqVO) => {
  const url = '/technological/submission/create'
  apiLog({ action: '创建任务提交记录', api: 'createTaskSubmission', method: 'POST', url, data })
  const res = await request.post({ url, data })
  apiLog({ action: '创建任务提交记录', api: 'createTaskSubmission', method: 'POST', url, data }, res)
  return res
}

/**
 * 更新任务提交记录
 * PUT /admin-api/technological/submission/update
 */
export const updateTaskSubmission = async (data: TaskSubmissionSaveReqVO) => {
  const url = '/technological/submission/update'
  apiLog({ action: '更新任务提交记录', api: 'updateTaskSubmission', method: 'PUT', url, data })
  const res = await request.put({ url, data })
  apiLog({ action: '更新任务提交记录', api: 'updateTaskSubmission', method: 'PUT', url, data }, res)
  return res
}

/**
 * 获得任务提交记录分页
 * GET /admin-api/technological/submission/page
 */
export const getTaskSubmissionPage = async (params: TaskSubmissionPageReqVO) => {
  const url = '/technological/submission/page'
  apiLog({ action: '获得任务提交记录分页', api: 'getTaskSubmissionPage', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得任务提交记录分页', api: 'getTaskSubmissionPage', method: 'GET', url, params }, res)
  return res
}

/**
 * 获得任务提交记录详情
 * GET /admin-api/technological/submission/get
 */
export const getTaskSubmission = async (id: number) => {
  const url = '/technological/submission/get'
  const params = { id }
  apiLog({ action: '获得任务提交记录详情', api: 'getTaskSubmission', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得任务提交记录详情', api: 'getTaskSubmission', method: 'GET', url, params }, res)
  return res
}

/**
 * 删除任务提交记录
 * DELETE /admin-api/technological/submission/delete
 */
export const deleteTaskSubmission = async (id: number) => {
  const url = '/technological/submission/delete'
  const params = { id }
  apiLog({ action: '删除任务提交记录', api: 'deleteTaskSubmission', method: 'DELETE', url, params })
  const res = await request.delete({ url, params })
  apiLog({ action: '删除任务提交记录', api: 'deleteTaskSubmission', method: 'DELETE', url, params }, res)
  return res
}

// ===== 任务提交查询接口 =====

/**
 * 根据任务ID获取提交记录列表
 * GET /admin-api/technological/submission/list-by-task
 */
export const getTaskSubmissionsByTask = async (taskId: number) => {
  const url = '/technological/submission/list-by-task'
  const params = { taskId }
  apiLog({ action: '根据任务ID获取提交记录列表', api: 'getTaskSubmissionsByTask', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '根据任务ID获取提交记录列表', api: 'getTaskSubmissionsByTask', method: 'GET', url, params }, res)
  return res
}

/**
 * 根据任务ID获取最新提交记录
 * GET /admin-api/technological/submission/get-latest-by-task
 */
export const getLatestTaskSubmissionByTask = async (taskId: number) => {
  const url = '/technological/submission/get-latest-by-task'
  const params = { taskId }
  apiLog({ action: '根据任务ID获取最新提交记录', api: 'getLatestTaskSubmissionByTask', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '根据任务ID获取最新提交记录', api: 'getLatestTaskSubmissionByTask', method: 'GET', url, params }, res)
  return res
}

// ===== 任务提交操作接口 =====

/**
 * 提交任务（从草稿状态变为已提交）
 * POST /admin-api/technological/submission/submit
 */
export const submitTask = async (data: {
  taskId: number
  submissionContent?: string
  submissionFiles?: string
  remark?: string
}) => {
  const url = '/technological/submission/submit'
  apiLog({ action: '提交任务', api: 'submitTask', method: 'POST', url, data })
  const res = await request.post({ url, data })
  apiLog({ action: '提交任务', api: 'submitTask', method: 'POST', url, data }, res)
  return res
}

/**
 * 审核任务提交
 * POST /admin-api/technological/submission/review
 */
export const reviewTaskSubmission = async (data: {
  submissionId: number
  reviewResult: number          // 审核结果（1-通过, 2-不通过）
  reviewOpinion?: string        // 审核意见
  remark?: string               // 备注
}) => {
  const url = '/technological/submission/review'
  apiLog({ action: '审核任务提交', api: 'reviewTaskSubmission', method: 'POST', url, data })
  const res = await request.post({ url, data })
  apiLog({ action: '审核任务提交', api: 'reviewTaskSubmission', method: 'POST', url, data }, res)
  return res
}

// ===== 工具函数 =====

/**
 * 将前端提交数据转换为后端请求格式
 */
export const transformSubmissionToBackend = (submission: any): TaskSubmissionSaveReqVO => {
  return {
    id: submission.id,
    taskId: Number(submission.taskId),
    submitterId: Number(submission.submitterId),
    submitterName: submission.submitterName,
    submissionType: submission.submissionType,
    submissionContent: submission.submissionContent,
    submissionFiles: submission.submissionFiles ? JSON.stringify(submission.submissionFiles) : undefined,
    submissionTime: submission.submissionTime,
    status: submission.status,
    reviewerId: submission.reviewerId ? Number(submission.reviewerId) : undefined,
    reviewerName: submission.reviewerName,
    reviewTime: submission.reviewTime,
    reviewOpinion: submission.reviewOpinion,
    reviewResult: submission.reviewResult,
    remark: submission.remark
  }
}

/**
 * 将后端响应数据转换为前端格式
 */
export const transformSubmissionFromBackend = (submission: TaskSubmissionRespVO): any => {
  return {
    id: submission.id.toString(),
    taskId: submission.taskId.toString(),
    submitterId: submission.submitterId.toString(),
    submitterName: submission.submitterName,
    submissionType: submission.submissionType,
    submissionContent: submission.submissionContent,
    submissionFiles: submission.submissionFiles ? JSON.parse(submission.submissionFiles) : [],
    submissionTime: submission.submissionTime,
    status: submission.status,
    reviewerId: submission.reviewerId?.toString(),
    reviewerName: submission.reviewerName,
    reviewTime: submission.reviewTime,
    reviewOpinion: submission.reviewOpinion,
    reviewResult: submission.reviewResult,
    remark: submission.remark,
    createTime: submission.createTime,
    updateTime: submission.updateTime,
    creator: submission.creator,
    updater: submission.updater
  }
}

/**
 * 获取提交状态文本
 */
export const getSubmissionStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: '草稿',
    2: '已提交',
    3: '审核中',
    4: '审核通过',
    5: '审核不通过'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取审核结果文本
 */
export const getReviewResultText = (result: number): string => {
  const resultMap: Record<number, string> = {
    1: '通过',
    2: '不通过'
  }
  return resultMap[result] || '未审核'
}
