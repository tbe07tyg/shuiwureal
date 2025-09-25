import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：项目实施v3 - 任务管理接口
 * 说明：封装任务创建、查询、更新、删除及基本数据映射工具
 */

// ===== 类型定义（按OpenAPI精简，仅当前页面所需字段） =====

export interface ProjectTaskSaveReqVO {
  id?: number
  projectId: number
  parentTaskId?: number
  taskTitle: string
  taskDescription?: string
  taskType?: number
  taskStatus?: number // 1待分配 2已分配 3进行中 4已完成 5已逾期
  priority?: string
  startDate?: string
  endDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  assigneeMemberId?: number
  assigneeName?: string
  collaboratorMemberIds?: string // JSON字符串
  milestoneId?: number
  tags?: string // JSON字符串
  remark?: string
  /** 提报模板配置（JSON字符串）。示例：{"templateId":1,"title":"...","sections":[]} */
  templateConfig?: string
  /** 计划开始日期 */
  plannedStartDate?: string
  /** 计划结束日期 */
  plannedEndDate?: string
  taskFilesDOList?: TaskFilesDOList[]
}




export interface TaskFilesDOList {
    createTime: string
    updateTime: string
    creator: string
    updater: string
    deleted: boolean
    id: number
    projectTaskId: number
    fileName: string
    fileUrl: string
    fileSize: number
    fileSuffix: string
    sort: number
}













export interface ProjectTaskRespVO {
  id: number
  projectId: number
  parentTaskId?: number
  taskTitle: string
  taskDescription?: string
  taskType?: number
  taskStatus: number
  priority?: string
  startDate?: string
  endDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  assigneeMemberId?: number
  assigneeName?: string
  collaboratorMemberIds?: string
  milestoneId?: number
  tags?: string
  remark?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
  /** 计划开始日期 */
  plannedStartDate?: string
  /** 计划结束日期 */
  plannedEndDate?: string
}

export interface TaskPageReqVO {
  projectId?: string
  parentTaskId?: string
  taskTitle?: string
  taskType?: string
  taskStatus?: string
  priority?: string
  startDate?: string
  endDate?: string
  pageNo?: number
  pageSize?: number
}

// ===== 接口封装 =====

/** 创建项目任务 POST /admin-api/technological/task/create */
export const createTask = async (data: ProjectTaskSaveReqVO) => {
  const url = '/technological/task/create'
  apiLog({ action: '创建项目任务', api: 'createTask', method: 'POST', url, params: data })
  const res = await request.post({ url, data })
  apiLog({ action: '创建项目任务', api: 'createTask', method: 'POST', url, params: data }, res)
  return res
}

/** 更新项目任务 PUT /admin-api/technological/task/update */
export const updateTask = async (data: ProjectTaskSaveReqVO) => {
  const url = '/technological/task/update'
  apiLog({ action: '更新项目任务', api: 'updateTask', method: 'PUT', url, params: data })
  const res = await request.put({ url, data })
  apiLog({ action: '更新项目任务', api: 'updateTask', method: 'PUT', url, params: data }, res)
  return res
}

/** 获得项目任务分页 GET /admin-api/technological/task/page */
export const getTaskPage = async (params: TaskPageReqVO) => {
  const url = '/technological/task/page'
  apiLog({ action: '获得项目任务分页', api: 'getTaskPage', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得项目任务分页', api: 'getTaskPage', method: 'GET', url, params }, res)
  return res
}

/** 获得项目任务详情 GET /admin-api/technological/task/get */
export const getTask = async (id: number) => {
  const url = '/technological/task/get'
  const params = { id }
  apiLog({ action: '获得项目任务详情', api: 'getTask', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获得项目任务详情', api: 'getTask', method: 'GET', url, params }, res)
  return res
}

/** 删除项目任务 DELETE /admin-api/technological/task/delete */
export const deleteTask = async (id: number) => {
  const url = '/technological/task/delete'
  // 使用 params 传递删除参数，确保后端能正确接收
  const params = { id }
  apiLog({ action: '删除项目任务', api: 'deleteTask', method: 'DELETE', url, params })
  const res = await request.delete({ url, params })
  apiLog({ action: '删除项目任务', api: 'deleteTask', method: 'DELETE', url, params }, res)
  return res
}

// ===== 工具：前后端数据映射 =====

export const transformTaskToBackend = (task: any): ProjectTaskSaveReqVO => {
  // 处理 undefined 值，将其转换为 null
  const processValue = (value: any) => {
    return value !== undefined ? value : null;
  };

  // 处理附件列表
  const processTaskFiles = (files: any[] | undefined) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return [];
    }
    
    return files.map(file => ({
      fileName: file.fileName || file.name || '',
      fileUrl: file.fileUrl || '',
      fileSize: file.fileSize || file.size || 0,
      fileSuffix: file.fileSuffix || (file.fileName || file.name || '').split('.').pop() || '',
      sort: file.sort || 0
    }));
  };

  return {
    id: task.id ? Number(task.id) : null,
    projectId: Number(task.projectId),
    parentTaskId: task.parentTaskId ? Number(task.parentTaskId) : null,
    taskTitle: task.name || task.taskTitle,
    taskDescription: processValue(task.description),
    taskType: processValue(task.taskType),
    taskStatus: processValue(task.taskStatus),
    priority: processValue(task.priority),
    startDate: processValue(task.startDate),
    endDate: processValue(task.endDate),
    dueDate: processValue(task.dueDate),
    estimatedHours: processValue(task.estimatedHours),
    actualHours: processValue(task.actualHours),
    assigneeMemberId: task.assigneeMemberId ? Number(task.assigneeMemberId) : null,
    assigneeName: processValue(task.assigneeName),
    collaboratorMemberIds: task.collaboratorMemberIds ? JSON.stringify(task.collaboratorMemberIds) : null,
    milestoneId: task.milestoneId ? Number(task.milestoneId) : null,
    tags: task.tags ? JSON.stringify(task.tags) : null,
    remark: processValue(task.remark),
    // 若上层已构造好 templateConfig 字符串，则直接传递
    templateConfig: typeof task.templateConfig === 'string' ? task.templateConfig : null,
    // 添加后端需要的额外字段
    plannedStartDate: processValue(task.startDate),
    plannedEndDate: processValue(task.endDate),
    // 添加附件列表
    taskFilesDOList: processTaskFiles(task.taskFilesDOList)
  }
}

export const transformTaskFromBackend = (task: any): any => {
  // 确保能处理后端返回的额外字段
  const backendTask = task as any;
  
  // 处理附件列表
  const processTaskFiles = (files: any[] | undefined) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return [];
    }
    
    return files.map((file, index) => ({
      uid: file.uid || `file-${index}-${Date.now()}`,
      fileName: file.fileName || '',
      fileUrl: file.fileUrl || '',
      fileSize: file.fileSize || 0,
      fileSuffix: file.fileSuffix || '',
      sort: file.sort || index
    }));
  };

  return {
    id: String(task.id),
    projectId: String(task.projectId),
    parentTaskId: task.parentTaskId != null ? String(task.parentTaskId) : undefined,
    name: task.taskTitle,
    taskTitle: task.taskTitle,
    description: task.taskDescription,
    taskType: task.taskType,
    taskStatus: task.taskStatus,
    priority: task.priority,
    // 优先使用 plannedStartDate 和 plannedEndDate，如果没有则使用 startDate 和 endDate
    startDate: backendTask.plannedStartDate || task.startDate,
    endDate: backendTask.plannedEndDate || task.endDate,
    dueDate: task.dueDate,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    assigneeMemberId: task.assigneeMemberId != null ? String(task.assigneeMemberId) : undefined,
    assigneeName: task.assigneeName,
    collaboratorMemberIds: task.collaboratorMemberIds ? JSON.parse(task.collaboratorMemberIds) : [],
    milestoneId: task.milestoneId != null ? String(task.milestoneId) : undefined,
    tags: task.tags ? JSON.parse(task.tags) : [],
    remark: task.remark,
    createTime: task.createTime,
    updateTime: task.updateTime,
    creator: task.creator,
    updater: task.updater,
    // 添加附件列表
    taskFilesDOList: processTaskFiles(task.taskFilesDOList),
    // 兼容attachFiles字段
    attachFiles: processTaskFiles(task.taskFilesDOList)
  }
}

// ===== 任务分配操作接口 =====

/**
 * 取消任务分配
 * POST /admin-api/technological/task/unassign
 */
export const unassign = async (params: { taskId: number }) => {
  const url = '/technological/task/unassign'
  apiLog({ action: '取消任务分配', api: 'unassign', method: 'POST', url, params })
  const res = await request.post({ url, params })
  apiLog({ action: '取消任务分配', api: 'unassign', method: 'POST', url, params }, res)
  return res
}
