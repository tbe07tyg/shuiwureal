import request from '@/config/axios'

// ========== 时间格式工具函数 ==========

/**
 * 将Date对象转换为时间戳（毫秒）
 * 用于createTime, updateTime等需要完整时间的字段
 * 后端期望格式: 1758159102000
 */
export const formatDateTimeForAPI = (date: Date | string | number): number => {
  if (typeof date === 'number') return date
  if (typeof date === 'string') return new Date(date).getTime()
  return date.getTime()
}

/**
 * 将Date对象转换为时间戳（毫秒）
 * 用于dateOfUse等日期字段（后端实际也是用时间戳）
 * 后端期望格式: 1758159102000
 */
export const formatDateForAPI = (date: Date | string | number): number => {
  if (typeof date === 'number') return date
  if (typeof date === 'string') return new Date(date).getTime()
  return date.getTime()
}

/**
 * 将时间戳转换为YYYY-MM-DD格式（用于显示）
 */
export const formatDateForDisplay = (timestamp: number | string): string => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  return date.toISOString().split('T')[0]
}

/**
 * 将时间戳转换为完整的日期时间字符串（用于显示）
 */
export const formatDateTimeForDisplay = (timestamp: number | string): string => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  return date.toLocaleString('zh-CN')
}

// ========== 经费执行进度主表相关接口 ==========

/**
 * 经费执行进度主表数据结构
 */
export interface FundExecutionProgressSaveReqVO {
  id?: number                    // id
  projectId?: number             // 项目ID
  implementation?: number        // 已执行/已使用
  implementationRate?: number    // 执行率
  status?: number               // 状态(0.正常 1.预警)
  remaining?: number            // 剩余
  totalBudget?: number          // 预算总额
  fundExecutionProgressDetailsList?: FundExecutionProgressDetailsDO[]  // 科目执行明细
}

export interface FundExecutionProgressRespVO {
  id: number                    // id
  projectId: number             // 项目ID
  implementation: number        // 已执行/已使用
  implementationRate: number    // 执行率
  status: number               // 状态(0.正常 1.预警)
  remaining: number            // 剩余
  totalBudget: number          // 预算总额
  fundExecutionProgressDetailsList: FundExecutionProgressDetailsDO[]  // 科目执行明细
  createTime: number           // 创建时间 (时间戳毫秒，如: 1758159102000)
  updateTime: number           // 最后更新时间 (时间戳毫秒，如: 1758159102000)
  creator: string              // 创建者
  updater: string              // 更新者
}

export interface FundExecutionProgressPageReqVO {
  pageNo: number               // 页码，从 1 开始
  pageSize: number             // 每页条数，最大值为 100
  projectId?: number           // 项目ID
  status?: number              // 状态(0.正常 1.预警)
  createTime?: number[]        // 创建时间范围 [开始时间戳, 结束时间戳] (毫秒)
}

/**
 * 创建经费执行进度
 */
export const createFundExecutionProgress = (data: FundExecutionProgressSaveReqVO) => {
  return request.post({
    url: '/technological/fund-execution-progress/create',
    data
  })
}

/**
 * 更新经费执行进度
 */
export const updateFundExecutionProgress = (data: FundExecutionProgressSaveReqVO) => {
  return request.put({
    url: '/technological/fund-execution-progress/update',
    data
  })
}

/**
 * 获得经费执行进度
 */
export const getFundExecutionProgress = (id: number) => {
  return request.get<FundExecutionProgressRespVO>({
    url: '/technological/fund-execution-progress/get',
    params: { id }
  })
}

/**
 * 获得经费执行进度分页
 */
export const getFundExecutionProgressPage = (params: FundExecutionProgressPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress/page',
    params
  })
}

/**
 * 删除经费执行进度
 */
export const deleteFundExecutionProgress = (id: number) => {
  return request.delete({
    url: '/technological/fund-execution-progress/delete',
    params: { id }
  })
}

/**
 * 批量删除经费执行进度
 */
export const deleteFundExecutionProgressList = (ids: number[]) => {
  return request.delete({
    url: '/technological/fund-execution-progress/delete-list',
    data: ids
  })
}

/**
 * 导出经费执行进度Excel
 */
export const exportFundExecutionProgressExcel = (params: FundExecutionProgressPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress/export-excel',
    params,
    responseType: 'blob'
  })
}


// ========== 经费执行进度明细相关接口 ==========

/**
 * 经费执行进度明细数据结构
 */
export interface FundExecutionProgressDetailsDO {
  id?: number                   // id
  executionProgressId?: number  // 执行经费ID
  dateOfUse?: number           // 使用日期 (时间戳毫秒，如: 1758159102000)
  budgetSubjects?: number      // 预算科目（0.设备费 1.材料费 2.人员费 3.其他费用）
  amountUsed?: number          // 使用金额
  purposeDescription?: string  // 用途说明
  fillSubmitName?: string      // 填报人员姓名
  fundExecutionProgressDetailsFilesDOList?: FundExecutionProgressDetailsFilesDO[]  // 资金填报明细文件列表
  createTime?: number          // 创建时间 (时间戳毫秒，如: 1758159102000)
  updateTime?: number          // 最后更新时间 (时间戳毫秒，如: 1758159102000)
  creator?: string             // 创建者
  updater?: string             // 更新者
}

export interface FundExecutionProgressDetailsSaveReqVO {
  id?: number                   // id
  executionProgressId?: number  // 执行经费ID
  dateOfUse?: string           // 使用日期
  budgetSubjects?: number      // 预算科目（0.设备费 1.材料费 2.人员费 3.其他费用）
  amountUsed?: number          // 使用金额
  purposeDescription?: string  // 用途说明
  fundExecutionProgressDetailsFilesDOList?: FundExecutionProgressDetailsFilesDO[]  // 资金填报明细文件列表
}

export interface FundExecutionProgressDetailsPageReqVO {
  pageNo: number               // 页码，从 1 开始
  pageSize: number             // 每页条数，最大值为 100
  executionProgressId?: number // 执行经费ID
  budgetSubjects?: number      // 预算科目
  dateOfUse?: number[]         // 使用日期范围 (时间戳毫秒)
  createTime?: number[]        // 创建时间范围 (时间戳毫秒)
}

/**
 * 创建经费执行进度明细
 */
export const createFundExecutionProgressDetails = (data: FundExecutionProgressDetailsSaveReqVO) => {
  return request.post({
    url: '/technological/fund-execution-progress-details/create',
    data
  })
}

/**
 * 更新经费执行进度明细
 */
export const updateFundExecutionProgressDetails = (data: FundExecutionProgressDetailsSaveReqVO) => {
  return request.put({
    url: '/technological/fund-execution-progress-details/update',
    data
  })
}

/**
 * 获得经费执行进度明细
 */
export const getFundExecutionProgressDetails = (id: number) => {
  return request.get<FundExecutionProgressDetailsDO>({
    url: '/technological/fund-execution-progress-details/get',
    params: { id }
  })
}

/**
 * 获得经费执行进度明细分页
 */
export const getFundExecutionProgressDetailsPage = (params: FundExecutionProgressDetailsPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress-details/page',
    params
  })
}

/**
 * 删除经费执行进度明细
 */
export const deleteFundExecutionProgressDetails = (id: number) => {
  return request.delete({
    url: '/technological/fund-execution-progress-details/delete',
    params: { id }
  })
}

/**
 * 批量删除经费执行进度明细
 */
export const deleteFundExecutionProgressDetailsList = (ids: number[]) => {
  return request.delete({
    url: '/technological/fund-execution-progress-details/delete-list',
    data: ids
  })
}

/**
 * 导出经费执行进度明细Excel
 */
export const exportFundExecutionProgressDetailsExcel = (params: FundExecutionProgressDetailsPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress-details/export-excel',
    params,
    responseType: 'blob'
  })
}

// ========== 资金填报明细文件相关接口 ==========

/**
 * 资金填报明细文件数据结构
 */
export interface FundExecutionProgressDetailsFilesDO {
  id?: number          // id
  detailsId?: number   // 资金填报明细ID
  fileName?: string    // 文件名称
  fileUrl?: string     // 文件URL
  fileSize?: number    // 文件大小
  uploadTime?: number  // 上传时间 (时间戳毫秒)
  createTime?: number  // 创建时间 (时间戳毫秒)
  updateTime?: number  // 最后更新时间 (时间戳毫秒)
  creator?: string     // 创建者
  updater?: string     // 更新者
}

export interface FundExecutionProgressDetailsFilesSaveReqVO {
  id?: number          // id
  detailsId?: number   // 资金填报明细ID
  fileName?: string    // 文件名称
  fileUrl?: string     // 文件URL
  fileSize?: number    // 文件大小
  uploadTime?: string  // 上传时间
}

export interface FundExecutionProgressDetailsFilesPageReqVO {
  pageNo: number       // 页码，从 1 开始
  pageSize: number     // 每页条数，最大值为 100
  detailsId?: number   // 资金填报明细ID
  fileName?: string    // 文件名称
  createTime?: number[] // 创建时间范围 (时间戳毫秒)
}

/**
 * 创建资金填报明细文件
 */
export const createFundExecutionProgressDetailsFiles = (data: FundExecutionProgressDetailsFilesSaveReqVO) => {
  return request.post({
    url: '/technological/fund-execution-progress-details-files/create',
    data
  })
}

/**
 * 更新资金填报明细文件
 */
export const updateFundExecutionProgressDetailsFiles = (data: FundExecutionProgressDetailsFilesSaveReqVO) => {
  return request.put({
    url: '/technological/fund-execution-progress-details-files/update',
    data
  })
}

/**
 * 获得资金填报明细文件分页
 */
export const getFundExecutionProgressDetailsFilesPage = (params: FundExecutionProgressDetailsFilesPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress-details-files/page',
    params
  })
}

/**
 * 获得资金填报明细文件详情
 */
export const getFundExecutionProgressDetailsFiles = (id: number) => {
  return request.get<FundExecutionProgressDetailsFilesDO>({
    url: '/technological/fund-execution-progress-details-files/get',
    params: { id }
  })
}

/**
 * 删除资金填报明细文件
 */
export const deleteFundExecutionProgressDetailsFiles = (id: number) => {
  return request.delete({
    url: '/technological/fund-execution-progress-details-files/delete',
    params: { id }
  })
}

/**
 * 批量删除资金填报明细文件
 */
export const deleteFundExecutionProgressDetailsFilesList = (ids: number[]) => {
  return request.delete({
    url: '/technological/fund-execution-progress-details-files/delete-list',
    data: ids
  })
}

/**
 * 导出资金填报明细文件Excel
 */
export const exportFundExecutionProgressDetailsFilesExcel = (params: FundExecutionProgressDetailsFilesPageReqVO) => {
  return request.get({
    url: '/technological/fund-execution-progress-details-files/export-excel',
    params,
    responseType: 'blob'
  })
}

// ========== 业务逻辑封装接口 ==========

/**
 * 根据项目ID获取经费执行进度
 */
export const getFundExecutionProgressByProject = (projectId: number) => {
  return getFundExecutionProgressPage({
    pageNo: 1,
    pageSize: 100,
    projectId
  })
}

/**
 * 根据执行进度ID获取明细列表
 */
export const getFundExecutionDetailsByProgressId = (executionProgressId: number) => {
  return getFundExecutionProgressDetailsPage({
    pageNo: 1,
    pageSize: 100,
    executionProgressId
  })
}

/**
 * 根据明细ID获取文件列表
 */
export const getFundExecutionFilesByDetailsId = (detailsId: number) => {
  return getFundExecutionProgressDetailsFilesPage({
    pageNo: 1,
    pageSize: 100,
    detailsId
  })
}

// ========== 统计查询相关接口 ==========

/**
 * 统计查询请求参数
 */
export interface FundExecutionProgressStatisticalQueryReqVO {
  projectId?: number          // 项目ID（可选，不传则查询全部）
  yearly?: number            // 年份（可选）
  startTime?: number         // 开始时间戳（可选）
  endTime?: number           // 结束时间戳（可选）
}

/**
 * 统计查询响应数据
 */
export interface FundExecutionProgressStatisticalQueryRespVO {
  projectId?: number         // 项目ID
  projectName?: string       // 项目名称
  totalBudget?: number       // 总预算
  totalExecuted?: number     // 总执行金额
  executionRate?: number     // 执行率
  categoryStats?: {          // 科目统计
    [key: string]: {
      budgetAmount: number   // 预算金额
      executedAmount: number // 执行金额
      executionRate: number  // 执行率
    }
  }
  monthlyStats?: {           // 月度统计
    [key: string]: {
      month: string         // 月份
      executedAmount: number // 执行金额
    }
  }
  recordCount?: number       // 记录数量
  fileCount?: number         // 文件数量
}

/**
 * 统计查询API
 * GET /admin-api/technological/fund-execution-progress/statisticalQuery
 */
export const getFundExecutionProgressStatisticalQuery = (params?: FundExecutionProgressStatisticalQueryReqVO) => {
  return request.get<FundExecutionProgressStatisticalQueryRespVO[]>({
    url: '/technological/fund-execution-progress/statisticalQuery',
    params
  })
}

/**
 * 预算科目枚举
 */
export const BUDGET_SUBJECTS = {
  EQUIPMENT: 0,    // 设备费
  MATERIALS: 1,    // 材料费
  PERSONNEL: 2,    // 人员费
  OTHER: 3        // 其他费用
} as const

/**
 * 执行状态枚举
 */
export const EXECUTION_STATUS = {
  NORMAL: 0,      // 正常
  WARNING: 1      // 预警
} as const

/**
 * 预算科目中文映射
 */
export const BUDGET_SUBJECTS_TEXT = {
  [BUDGET_SUBJECTS.EQUIPMENT]: '设备费',
  [BUDGET_SUBJECTS.MATERIALS]: '材料费',
  [BUDGET_SUBJECTS.PERSONNEL]: '人员费',
  [BUDGET_SUBJECTS.OTHER]: '其他费用'
} as const

/**
 * 执行状态中文映射
 */
export const EXECUTION_STATUS_TEXT = {
  [EXECUTION_STATUS.NORMAL]: '正常',
  [EXECUTION_STATUS.WARNING]: '预警'
} as const
