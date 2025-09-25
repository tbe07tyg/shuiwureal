import request from '@/config/axios'
import { service } from '@/config/axios/service'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：申报书解析后端数据同步
 * 维护人：科研管理系统
 * 日期：2025-01-29
 * 说明：封装申报书解析结果的后端保存和加载接口，实现完整的数据同步架构
 */

// ===== 请求与响应类型定义 =====

export interface ProposalAnalysisCreateReqVO {
  projectId: number                    // 项目ID（必填）
  documentName?: string                // 申报书文档名称
  documentUrl?: string                 // 申报书文档URL
  documentSize?: number                // 文档大小（字节）
  
  // 扩展字段：解析结果数据
  basicInfo?: {
    projectName?: string
    applicantUnit?: string
    leader?: string
    applicationDate?: string
    origin?: Record<string, any>
  }
  
  technicalRoute?: {
    technicalRoute: any[]              // 技术路线数组
  }
  
  implementationPlan?: {
    implementationPlan: any            // 实施方案对象
    totalDuration?: string
  }
  
  analysisStatus?: string              // 解析状态：'partial' | 'completed'
  completedModules?: string[]          // 已完成的模块：['basicInfo', 'technicalRoute', 'implementation']
  analysisType?: string                // 解析类型：'ai' | 'manual'
  
  // 生成的建议任务（供下一步使用）
  extractedTasks?: {
    implementation?: any[]
    technical?: any[]
    milestones?: any[]
  }
}

export interface ProposalAnalysisRespVO {
  id: number
  projectId: number
  documentName?: string
  documentUrl?: string
  documentSize?: number
  basicInfo?: any
  technicalRoute?: any
  implementationPlan?: any
  analysisStatus: string
  completedModules: string[]
  analysisType: string
  extractedTasks?: any
  createTime: string
  updateTime: string
}

export interface GetProposalAnalysisPageParams {
  projectId: string | number          // 项目ID
  documentName?: string               // 申报书文档名称
  analysisStatus?: string             // 解析状态
  pageNo?: number                     // 页码
  pageSize?: number                   // 每页大小
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface CommonResult<T> {
  code: number
  data: T
  msg?: string
}

// ===== 工具函数 =====
const parseMaybeJson = (value: any): any => {
  if (value == null) return null
  if (typeof value === 'string') {
    const s = value.trim()
    if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
      try { return JSON.parse(s) } catch { return value }
    }
  }
  return value
}

const unwrapResult = (res: any): any => {
  if (!res) return null
  const lvl1 = res.data ?? res
  if (lvl1 && typeof lvl1 === 'object' && 'code' in lvl1 && 'data' in lvl1) {
    return (lvl1 as any).data
  }
  return lvl1
}

// ===== 接口封装 =====

/**
 * 创建申报书解析记录
 * POST /admin-api/technological/proposal-analysis/create
 */
export const createProposalAnalysisRecord = async (
  params: ProposalAnalysisCreateReqVO
): Promise<CommonResult<number>> => {
  const url = '/technological/proposal-analysis/create'
  
  apiLog({ 
    action: '创建申报书解析记录', 
    api: 'createProposalAnalysisRecord', 
    method: 'POST', 
    url, 
    params: {
      projectId: params.projectId,
      analysisStatus: params.analysisStatus,
      completedModules: params.completedModules,
      analysisType: params.analysisType
    }
  })
  
  try {
    // 使用 postOriginal 避免二次提取 data 字段
    const res = await request.postOriginal({
      url,
      data: params
    })
    
    apiLog({ 
      action: '创建申报书解析记录', 
      api: 'createProposalAnalysisRecord', 
      method: 'POST', 
      url, 
      params: { projectId: params.projectId }
    }, res)
    
    // 现在 res 就是完整的 {code: 0, data: 1, msg: ""} 格式
    return res as unknown as CommonResult<number>
  } catch (error: any) {
    apiLog({ 
      action: '创建申报书解析记录', 
      api: 'createProposalAnalysisRecord', 
      method: 'POST', 
      url, 
      params: { projectId: params.projectId }
    }, { error: error?.message || error })
    
    throw error
  }
}

/**
 * 获取申报书解析记录分页
 * GET /admin-api/technological/proposal-analysis/page
 */
export const getProposalAnalysisPage = async (
  params: GetProposalAnalysisPageParams
): Promise<CommonResult<PageResult<ProposalAnalysisRespVO>>> => {
  const url = '/technological/proposal-analysis/page'
  
  apiLog({ 
    action: '获取申报书解析记录', 
    api: 'getProposalAnalysisPage', 
    method: 'GET', 
    url, 
    params 
  })
  
  try {
    // 直接使用 service 避免自动提取 data 字段
    const res = await service({
      method: 'GET',
      url,
      params
    })
    
    apiLog({ 
      action: '获取申报书解析记录', 
      api: 'getProposalAnalysisPage', 
      method: 'GET', 
      url, 
      params 
    }, res.data || res)
    
    return res as unknown as CommonResult<PageResult<ProposalAnalysisRespVO>>
  } catch (error: any) {
    apiLog({ 
      action: '获取申报书解析记录', 
      api: 'getProposalAnalysisPage', 
      method: 'GET', 
      url, 
      params 
    }, { error: error?.message || error })
    
    throw error
  }
}

/**
 * 更新申报书解析记录
 * PUT /admin-api/technological/proposal-analysis/update
 */
export const updateProposalAnalysisRecord = async (
  params: ProposalAnalysisCreateReqVO & { id: number }
): Promise<CommonResult<boolean>> => {
  const url = '/technological/proposal-analysis/update'
  
  apiLog({ 
    action: '更新申报书解析记录', 
    api: 'updateProposalAnalysisRecord', 
    method: 'PUT', 
    url, 
    params: {
      id: params.id,
      projectId: params.projectId,
      analysisStatus: params.analysisStatus
    }
  })
  
  try {
    const res = await request.put<CommonResult<boolean>>({
      url,
      data: params
    })
    
    apiLog({ 
      action: '更新申报书解析记录', 
      api: 'updateProposalAnalysisRecord', 
      method: 'PUT', 
      url, 
      params: { id: params.id }
    }, res)
    
    return res
  } catch (error: any) {
    apiLog({ 
      action: '更新申报书解析记录', 
      api: 'updateProposalAnalysisRecord', 
      method: 'PUT', 
      url, 
      params: { id: params.id }
    }, { error: error?.message || error })
    
    throw error
  }
}

/**
 * 获得申报书解析记录详情（按ID）
 * GET /admin-api/technological/proposal-analysis/get
 */
export const getProposalAnalysis = async (
  id: number | string
): Promise<CommonResult<ProposalAnalysisRespVO>> => {
  const url = '/technological/proposal-analysis/get'
  apiLog({ action: '获得申报书解析记录', api: 'getProposalAnalysis', method: 'GET', url, params: { id } })
  const res = await service({ method: 'GET', url, params: { id } })
  apiLog({ action: '获得申报书解析记录', api: 'getProposalAnalysis', method: 'GET', url, params: { id } }, res.data || res)
  return res as unknown as CommonResult<ProposalAnalysisRespVO>
}

/**
 * 根据项目ID获得申报书解析记录详情
 * GET /admin-api/technological/proposal-analysis/get-by-project
 */
export const getProposalAnalysisByProject = async (
  projectId: number | string
): Promise<CommonResult<ProposalAnalysisRespVO>> => {
  const url = '/technological/proposal-analysis/get-by-project'
  apiLog({ action: '根据项目ID获得申报书解析记录', api: 'getProposalAnalysisByProject', method: 'GET', url, params: { projectId } })
  const res = await service({ method: 'GET', url, params: { projectId } })
  apiLog({ action: '根据项目ID获得申报书解析记录', api: 'getProposalAnalysisByProject', method: 'GET', url, params: { projectId } }, res.data || res)
  return res as unknown as CommonResult<ProposalAnalysisRespVO>
}

/**
 * 按模块更新：基本信息
 */
export const updateBasicInfoModule = async (
  id: number,
  basicInfo: any
): Promise<CommonResult<boolean> | boolean> => {
  const url = '/technological/proposal-analysis/update-basic-info'
  const body: any = { id, basicInfoJson: typeof basicInfo === 'string' ? basicInfo : JSON.stringify(basicInfo) }
  apiLog({ action: '更新基本信息模块', api: 'updateBasicInfoModule', method: 'PUT', url, params: { id } })
  const res = await service({ method: 'PUT', url, data: body })
  apiLog({ action: '更新基本信息模块', api: 'updateBasicInfoModule', method: 'PUT', url, params: { id } }, res.data || res)
  return (res as any)
}

/**
 * 按模块更新：技术路线
 */
export const updateTechnicalRouteModule = async (
  id: number,
  technicalRoute: any
): Promise<CommonResult<boolean> | boolean> => {
  const url = '/technological/proposal-analysis/update-technical-route'
  
  // 🆕 数据验证：确保technicalRoute不为空
  if (!technicalRoute) {
    console.warn('⚠️ 技术路线数据为空，跳过更新')
    return { code: 0, data: true, msg: '数据为空，跳过更新' } as CommonResult<boolean>
  }
  
  // 🆕 数据验证：确保technicalRoute.technicalRoute数组存在且不为空
  const techRouteData = typeof technicalRoute === 'string' ? JSON.parse(technicalRoute) : technicalRoute
  if (!techRouteData.technicalRoute || !Array.isArray(techRouteData.technicalRoute) || techRouteData.technicalRoute.length === 0) {
    console.warn('⚠️ 技术路线阶段数组为空，跳过更新')
    return { code: 0, data: true, msg: '技术路线阶段为空，跳过更新' } as CommonResult<boolean>
  }
  
  const body: any = { id, technicalRouteJson: typeof technicalRoute === 'string' ? technicalRoute : JSON.stringify(technicalRoute) }
  apiLog({ action: '更新技术路线模块', api: 'updateTechnicalRouteModule', method: 'PUT', url, params: { id } })
  
  try {
    const res = await service({ method: 'PUT', url, data: body })
    apiLog({ action: '更新技术路线模块', api: 'updateTechnicalRouteModule', method: 'PUT', url, params: { id } }, res.data || res)
    return (res as any)
  } catch (error: any) {
    console.error('❌ 技术路线模块更新失败:', error)
    apiLog({ action: '更新技术路线模块', api: 'updateTechnicalRouteModule', method: 'PUT', url, params: { id } }, { error: error?.message || error })
    throw error
  }
}

/**
 * 按模块更新：实施方案
 */
export const updateImplementationPlanModule = async (
  id: number,
  implementationPlan: any
): Promise<CommonResult<boolean> | boolean> => {
  const url = '/technological/proposal-analysis/update-implementation-plan'
  
  // 🆕 数据验证：确保implementationPlan不为空
  if (!implementationPlan) {
    console.warn('⚠️ 实施方案数据为空，跳过更新')
    return { code: 0, data: true, msg: '数据为空，跳过更新' } as CommonResult<boolean>
  }
  
  const body: any = { id, implementationPlanJson: typeof implementationPlan === 'string' ? implementationPlan : JSON.stringify(implementationPlan) }
  apiLog({ action: '更新实施方案模块', api: 'updateImplementationPlanModule', method: 'PUT', url, params: { id } })
  
  try {
    const res = await service({ method: 'PUT', url, data: body })
    apiLog({ action: '更新实施方案模块', api: 'updateImplementationPlanModule', method: 'PUT', url, params: { id } }, res.data || res)
    return (res as any)
  } catch (error: any) {
    console.error('❌ 实施方案模块更新失败:', error)
    apiLog({ action: '更新实施方案模块', api: 'updateImplementationPlanModule', method: 'PUT', url, params: { id } }, { error: error?.message || error })
    throw error
  }
}

// ===== 业务逻辑封装 =====

// 🆕 防重复调用机制
const activeRequests = new Map<string, Promise<any>>()

/**
 * 保存单个模块的解析结果到后端
 */
export const saveAnalysisModuleToBackend = async (
  projectId: number | string,
  analysisType: 'basicInfo' | 'technicalRoute' | 'implementation',
  result: any,
  documentInfo?: { name?: string, url?: string, size?: number }
): Promise<number | null> => {
  // 🆕 防重复调用：生成请求唯一标识
  const requestKey = `${projectId}_${analysisType}`
  
  // 如果相同请求正在进行中，返回现有请求的Promise
  if (activeRequests.has(requestKey)) {
    console.log(`⏳ 检测到重复请求 ${requestKey}，等待现有请求完成...`)
    return await activeRequests.get(requestKey)
  }
  
  // 创建新的请求Promise
  const requestPromise = (async () => {
    try {
    // 先尝试按项目ID拿现有记录ID（避免依赖不稳定的分页接口）
    let existingId: number | null = null
    try {
      const byProject = await getProposalAnalysisByProject(String(projectId))
      const data = unwrapResult(byProject)
      if (data?.id) existingId = Number(data.id)
    } catch { /* ignore */ }

    // 若还没有，再尝试分页接口
    if (existingId == null) {
      try {
        const existingRecords = await getProposalAnalysisPage({
          projectId: String(projectId),
          pageNo: 1,
          pageSize: 1
        })
        if (existingRecords.code === 0 && existingRecords.data?.list?.length > 0) {
          existingId = Number(existingRecords.data.list[0].id)
        }
      } catch { /* ignore */ }
    }

    if (existingId != null) {
      console.log(`🔄 发现已存在解析记录ID: ${existingId}，将更新现有记录`)
      // 使用模块专用更新接口
      let updateResponse: any
      if (analysisType === 'basicInfo') {
        updateResponse = await updateBasicInfoModule(existingId, result)
      } else if (analysisType === 'technicalRoute') {
        updateResponse = await updateTechnicalRouteModule(existingId, result)
      } else {
        updateResponse = await updateImplementationPlanModule(existingId, result)
      }
      console.log(`🔍 [调试] ${analysisType}更新响应:`, updateResponse)
      const isSuccess = (updateResponse as any) === true || ((updateResponse as any)?.code === 0) || ((updateResponse as any)?.data === true)
      if (isSuccess) {
        console.log(`✅ ${analysisType}解析结果已更新到后端，记录ID:`, existingId)
        return existingId
      } else {
        console.error(`❌ ${analysisType}解析结果更新失败:`, updateResponse)
        return null
      }
    }

    // 不存在记录，创建新记录
    console.log(`🆕 未发现已存在解析记录，将创建新记录`)
    const createParams: any = {
      projectId: Number(projectId),
      documentName: documentInfo?.name,
      documentUrl: documentInfo?.url,
      documentSize: documentInfo?.size,
      analysisType: 'ai',
      analysisStatus: 'partial',
      completedModules: [analysisType]
    }
    if (analysisType === 'basicInfo') createParams.basicInfoJson = typeof result === 'string' ? result : JSON.stringify(result)
    if (analysisType === 'technicalRoute') createParams.technicalRouteJson = typeof result === 'string' ? result : JSON.stringify(result)
    if (analysisType === 'implementation') createParams.implementationPlanJson = typeof result === 'string' ? result : JSON.stringify(result)

    const response = await createProposalAnalysisRecord(createParams)
    console.log(`🔍 [调试] ${analysisType}保存响应:`, response)
    if (response && response.code === 0 && response.data) {
      const newId = Number(response.data)
      // 保险：创建后再调用专用更新接口一次，确保模块字段写入
      try {
        if (analysisType === 'basicInfo') await updateBasicInfoModule(newId, result)
        if (analysisType === 'technicalRoute') await updateTechnicalRouteModule(newId, result)
        if (analysisType === 'implementation') await updateImplementationPlanModule(newId, result)
      } catch { /* ignore */ }
      console.log(`✅ ${analysisType}解析结果已保存到后端，记录ID:`, newId)
      return newId
    } else {
      console.error(`❌ ${analysisType}解析结果保存失败:`, response?.msg || response)
      return null
    }
    } catch (error) {
      console.error(`❌ ${analysisType}解析结果保存异常:`, error)
      return null
    }
  })()
  
  // 🆕 将请求Promise存储到Map中
  activeRequests.set(requestKey, requestPromise)
  
  try {
    // 等待请求完成
    const result = await requestPromise
    return result
  } finally {
    // 🆕 请求完成后清理Map中的记录
    activeRequests.delete(requestKey)
  }
}

/**
 * 从后端加载项目的解析结果
 */
export const loadAnalysisFromBackend = async (
  projectId: number | string
): Promise<{
  basicInfo: any | null
  technicalRoute: any | null
  implementation: any | null
  analysisId?: number
  hasData: boolean
}> => {
  try {
    let recordsList: any[] | null = null
    try {
      const response = await getProposalAnalysisPage({
        projectId: String(projectId),
        pageNo: 1,
        pageSize: 10
      })
      console.log('🔍 [调试] getProposalAnalysisPage完整响应:', response)
      const responseAny = response as any
      if (response.code === 0 && response.data?.list?.length > 0) {
        recordsList = response.data.list
      } else if (responseAny.list?.length > 0) {
        recordsList = responseAny.list
      } else if (responseAny.total > 0 && responseAny.records?.length > 0) {
        recordsList = responseAny.records
      }
    } catch (e) {
      console.warn('⚠️ 分页接口异常，改为直接按项目拉取详情:', (e as any)?.message || e)
    }
    
    if (recordsList && recordsList.length > 0) {
      // 获取最新的解析记录
      const latestRecord = recordsList[0]

      // 进一步拉取详情（先按项目ID，再回退按ID）
      let detailRes: any = null
      try {
        detailRes = await getProposalAnalysisByProject(String(projectId))
      } catch { /* ignore */ }
      if (!detailRes && latestRecord?.id) {
        try { detailRes = await getProposalAnalysis(latestRecord.id) } catch { /* ignore */ }
      }
      const detail = unwrapResult(detailRes) || latestRecord

      console.log('🌐 从后端加载到解析结果:', {
        analysisId: detail.id,
        completedModules: detail.completedModules,
        analysisStatus: detail.analysisStatus,
        basicInfo: !!detail.basicInfo,
        technicalRoute: !!detail.technicalRoute,
        implementationPlan: !!detail.implementationPlan
      })

      // 检查是否有任何解析数据（兼容 *_Json 与旧字段）
      const hasBasicInfo = (detail.basicInfoJson != null && detail.basicInfoJson !== '') || detail.basicInfo != null
      const hasTechnicalRoute = (detail.technicalRouteJson != null && detail.technicalRouteJson !== '') || detail.technicalRoute != null
      const hasImplementation = (detail.implementationPlanJson != null && detail.implementationPlanJson !== '') || detail.implementationPlan != null
      const hasAnyData = hasBasicInfo || hasTechnicalRoute || hasImplementation

      console.log('🔍 [调试] 解析数据检查:', {
        hasBasicInfo,
        hasTechnicalRoute,
        hasImplementation,
        hasAnyData,
        basicInfoValue: detail.basicInfoJson ?? detail.basicInfo,
        technicalRouteValue: detail.technicalRouteJson ?? detail.technicalRoute,
        implementationValue: detail.implementationPlanJson ?? detail.implementationPlan
      })

      return {
        basicInfo: parseMaybeJson(detail.basicInfoJson ?? detail.basicInfo),
        technicalRoute: parseMaybeJson(detail.technicalRouteJson ?? detail.technicalRoute),
        implementation: parseMaybeJson(detail.implementationPlanJson ?? detail.implementationPlan),
        analysisId: detail.id,
        hasData: hasAnyData
      }
    } else {
      // 分页没拿到或失败，直接按项目拉详情
      try {
        const direct = unwrapResult(await getProposalAnalysisByProject(String(projectId)))
        if (direct) {
          const hasBasicInfo = direct.basicInfoJson != null
          const hasTechnicalRoute = direct.technicalRouteJson != null
          const hasImplementation = direct.implementationPlanJson != null
          const hasAnyData = hasBasicInfo || hasTechnicalRoute || hasImplementation
          return {
            basicInfo: parseMaybeJson(direct.basicInfoJson ?? direct.basicInfo),
            technicalRoute: parseMaybeJson(direct.technicalRouteJson ?? direct.technicalRoute),
            implementation: parseMaybeJson(direct.implementationPlanJson ?? direct.implementationPlan),
            analysisId: direct.id,
            hasData: hasAnyData
          }
        }
      } catch (e) {
        console.warn('⚠️ 直接按项目拉取详情失败:', (e as any)?.message || e)
      }
      return { basicInfo: null, technicalRoute: null, implementation: null, hasData: false }
    }
  } catch (error) {
    console.error('❌ 从后端加载解析结果失败:', error)
    return {
      basicInfo: null,
      technicalRoute: null,
      implementation: null,
      hasData: false
    }
  }
}

export default {
  createProposalAnalysisRecord,
  getProposalAnalysisPage,
  updateProposalAnalysisRecord,
  saveAnalysisModuleToBackend,
  loadAnalysisFromBackend
}
