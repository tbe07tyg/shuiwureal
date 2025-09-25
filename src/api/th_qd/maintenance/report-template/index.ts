/**
 * 提报模板 API 接口
 * 
 * 提供提报模板的完整CRUD操作
 * API路径: /admin-api/technological/template/*
 */

import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'
import type {
  ReportTemplateRespVO,
  ReportTemplateCreateReqVO,
  ReportTemplateUpdateReqVO,
  ReportTemplatePageReqVO,
  ReportTemplateExportReqVO,
  GetReportTemplatePageResponse,
  GetReportTemplateResponse,
  GetReportTemplateListResponse,
  CreateReportTemplateResponse,
  UpdateReportTemplateResponse,
  DeleteReportTemplateResponse,
  GetReportTemplateStatsResponse,
  FrontendTemplateConfig,
  TemplateConfig,
  TemplateSection
} from './types'
// 枚举需要运行时可用，使用普通导入
import { TemplateStatus, TemplateType } from './types'

// ========== 基础 CRUD 操作 ==========

/**
 * 获得提报模板分页
 * @param params 查询参数
 */
export const getReportTemplatePage = async (params: ReportTemplatePageReqVO): Promise<GetReportTemplatePageResponse> => {
  const response = await request.get({
    url: '/technological/template/page',
    params
  })
  
  apiLog({
    action: '获取提报模板分页',
    api: 'getReportTemplatePage',
    method: 'GET',
    url: '/technological/template/page',
    params
  }, response)
  
  return response
}

/**
 * 获得提报模板详情
 * @param id 模板ID
 */
export const getReportTemplate = async (id: number): Promise<GetReportTemplateResponse> => {
  const response = await request.get({
    url: '/technological/template/get',
    params: { id }
  })
  
  apiLog({
    action: '获取提报模板详情',
    api: 'getReportTemplate',
    method: 'GET',
    url: '/technological/template/get',
    params: { id }
  }, response)
  
  return response
}

/**
 * 获得提报模板列表
 * @param params 查询参数
 */
export const getReportTemplateList = async (params?: Partial<ReportTemplatePageReqVO>): Promise<GetReportTemplateListResponse> => {
  const response = await request.get({
    url: '/technological/template/list',
    params
  })
  
  apiLog({
    action: '获取提报模板列表',
    api: 'getReportTemplateList',
    method: 'GET',
    url: '/technological/template/list',
    params
  }, response)
  
  // 统一解包：有的环境直接返回数组
  const raw: any = (response && (response as any).data !== undefined) ? (response as any).data : response
  if (Array.isArray(raw)) {
    return { code: 0, data: raw, msg: '' } as any
  }
  return raw
}

/**
 * 根据项目ID获取模板列表
 * @param projectId 项目ID
 */
export const getReportTemplateListByProject = async (projectId: number): Promise<GetReportTemplateListResponse> => {
  const response = await request.get({
    url: '/technological/template/list-by-project',
    params: { projectId }
  })
  
  apiLog({
    action: '根据项目获取提报模板列表',
    api: 'getReportTemplateListByProject',
    method: 'GET',
    url: '/technological/template/list-by-project',
    params: { projectId }
  }, response)
  
  return response
}

/**
 * 新增提报模板
 * @param data 模板数据
 */
export const createReportTemplate = async (data: ReportTemplateCreateReqVO): Promise<CreateReportTemplateResponse> => {
  // 兜底：若外部传了对象，这里统一转字符串
  try {
    const anyData: any = data as any
    if (anyData && anyData.templateConfig && typeof anyData.templateConfig !== 'string') {
      anyData.templateConfig = JSON.stringify(anyData.templateConfig)
    }
  } catch {}
  const response = await request.post({
    url: '/technological/template/create',
    data
  })
  
  apiLog({
    action: '创建提报模板',
    api: 'createReportTemplate',
    method: 'POST',
    url: '/technological/template/create',
    params: data
  }, response)
  // 统一解包：兼容 axios 响应与直接数据
  const unwrapped: any = (response && (response as any).data !== undefined) ? (response as any).data : response
  return unwrapped
}

/**
 * 修改提报模板
 * @param data 模板数据
 */
export const updateReportTemplate = async (data: ReportTemplateUpdateReqVO): Promise<UpdateReportTemplateResponse> => {
  // 兜底：若外部传了对象，这里统一转字符串
  try {
    const anyData: any = data as any
    if (anyData && anyData.templateConfig && typeof anyData.templateConfig !== 'string') {
      anyData.templateConfig = JSON.stringify(anyData.templateConfig)
    }
  } catch {}
  const response = await request.put({
    url: '/technological/template/update',
    data
  })
  
  apiLog({
    action: '更新提报模板',
    api: 'updateReportTemplate',
    method: 'PUT',
    url: '/technological/template/update',
    params: data
  }, response)
  const unwrapped: any = (response && (response as any).data !== undefined) ? (response as any).data : response
  return unwrapped
}

/**
 * 删除提报模板
 * @param id 模板ID
 */
export const deleteReportTemplate = async (id: number): Promise<DeleteReportTemplateResponse> => {
  const response = await request.delete({
    url: `/technological/template/delete?id=${id}`
  })
  
  apiLog({
    action: '删除提报模板',
    api: 'deleteReportTemplate',
    method: 'DELETE',
    url: `/technological/template/delete?id=${id}`,
    params: { id }
  }, response)
  
  return response
}

/**
 * 导出提报模板 Excel
 * @param params 导出参数
 */
export const exportReportTemplateExcel = (params: ReportTemplateExportReqVO) => {
  return request.download({
    url: '/technological/template/export-excel',
    params
  })
}

// ========== 业务逻辑操作 ==========

/**
 * 获取默认模板
 */
export const getDefaultReportTemplate = async (): Promise<GetReportTemplateResponse> => {
  const response = await request.get({
    url: '/technological/template/default'
  })
  
  apiLog({
    action: '获取默认提报模板',
    api: 'getDefaultReportTemplate',
    method: 'GET',
    url: '/technological/template/default'
  }, response)
  
  return response
}

/**
 * 设置默认模板
 * @param id 模板ID
 */
export const setDefaultReportTemplate = async (id: number): Promise<UpdateReportTemplateResponse> => {
  const response = await request.post({
    url: '/technological/template/set-default',
    // 后端要求的参数名为 templateId
    params: { templateId: id }
  })
  
  apiLog({
    action: '设置默认提报模板',
    api: 'setDefaultReportTemplate',
    method: 'POST',
    url: '/technological/template/set-default',
    params: { templateId: id }
  }, response)
  
  return response
}

/**
 * 启用模板
 * @param id 模板ID
 */
export const enableReportTemplate = async (id: number): Promise<UpdateReportTemplateResponse> => {
  const response = await request.put({
    url: '/technological/template/enable',
    params: { id }
  })
  
  apiLog({
    action: '启用提报模板',
    api: 'enableReportTemplate',
    method: 'PUT',
    url: '/technological/template/enable',
    params: { id }
  }, response)
  
  return response
}

/**
 * 禁用模板
 * @param id 模板ID
 */
export const disableReportTemplate = async (id: number): Promise<UpdateReportTemplateResponse> => {
  const response = await request.put({
    url: '/technological/template/disable',
    params: { id }
  })
  
  apiLog({
    action: '禁用提报模板',
    api: 'disableReportTemplate',
    method: 'PUT',
    url: '/technological/template/disable',
    params: { id }
  }, response)
  
  return response
}

/**
 * 获取模板统计
 */
export const getReportTemplateStatistics = async (): Promise<GetReportTemplateStatsResponse> => {
  const response = await request.get({
    url: '/technological/template/statistics'
  })
  
  apiLog({
    action: '获取提报模板统计',
    api: 'getReportTemplateStatistics',
    method: 'GET',
    url: '/technological/template/statistics'
  }, response)
  
  return response
}

// ========== 数据转换工具函数 ==========

/**
 * 将 API 响应的模板数据转换为前端使用的格式
 */
export const convertToFrontendConfig = (template: ReportTemplateRespVO): FrontendTemplateConfig => {
  // 兼容：后端返回的 templateConfig 可能是字符串
  let cfg: any = template.templateConfig as any
  if (typeof cfg === 'string') {
    try { cfg = JSON.parse(cfg) } catch { cfg = {} }
  }
  return {
    id: template.id,
    name: template.templateName,
    title: (cfg && cfg.title) || template.templateName,
    sections: (cfg && Array.isArray(cfg.sections)) ? cfg.sections : [],
    requireAttachment: (cfg && typeof cfg.requireAttachment === 'boolean') ? cfg.requireAttachment : !!template.requireAttachment,
    templateType: template.templateType,
    isDefault: template.isSystemDefault,
    order: template.templateOrder
  }
}

/**
 * 将前端配置转换为 API 创建请求格式
 */
export const convertToCreateRequest = (config: FrontendTemplateConfig): ReportTemplateCreateReqVO => {
  return {
    templateCode: `TPL_${Date.now()}`, // 生成唯一编码
    templateName: config.name,
    // 后端期望字符串：将配置对象序列化
    // "{\"title\":...,\"sections\":[...]}"
    // 若后端将来兼容对象，可在服务端自行解析
    templateConfig: JSON.stringify({
      title: config.title || config.name,
      sections: config.sections,
      requireAttachment: config.requireAttachment
    }) as any,
    requireAttachment: config.requireAttachment,
    templateType: (config.templateType as any) || TemplateType.TASK,
    templateStatus: TemplateStatus.ENABLED,
    isSystemDefault: config.isDefault || false,
    templateOrder: config.order || 0
  }
}

/**
 * 将前端配置转换为 API 更新请求格式
 */
export const convertToUpdateRequest = (config: FrontendTemplateConfig): ReportTemplateUpdateReqVO => {
  return {
    id: Number(config.id),
    templateName: config.name,
    // 同创建：后端期望字符串
    templateConfig: JSON.stringify({
      title: config.title || config.name,
      sections: config.sections,
      requireAttachment: config.requireAttachment
    }) as any,
    requireAttachment: config.requireAttachment,
    templateType: (config.templateType as any) || TemplateType.TASK,
    isSystemDefault: config.isDefault || false,
    templateOrder: config.order || 0
  }
}

// ========== 高级业务功能 ==========

/**
 * 获取所有启用的模板并转换为前端格式
 */
export const getEnabledTemplatesForFrontend = async (): Promise<FrontendTemplateConfig[]> => {
  try {
    const response = await getReportTemplateList({
      templateStatus: TemplateStatus.ENABLED
    })
    
    if (response.code === 0 && response.data) {
      return response.data.map(convertToFrontendConfig)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    
    console.warn('获取启用模板失败:', response.msg)
    return []
  } catch (error) {
    console.error('获取启用模板异常:', error)
    return []
  }
}

/**
 * 批量更新模板排序
 * @param sortData 排序数据数组 {id, order}
 */
export const batchUpdateTemplateOrder = async (
  sortData: Array<{ id: number; order: number }>
): Promise<boolean> => {
  try {
    const updatePromises = sortData.map(async ({ id, order }) => {
      // 先获取模板详情
      const templateResponse = await getReportTemplate(id)
      if (templateResponse.code !== 0 || !templateResponse.data) {
        throw new Error(`获取模板${id}失败`)
      }

      const template = templateResponse.data
      
      // 更新排序
      const updateData: ReportTemplateUpdateReqVO = {
        id: template.id,
        templateOrder: order // 新的排序值
      }

      return updateReportTemplate(updateData)
    })

    const results = await Promise.allSettled(updatePromises)
    const failedCount = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && result.value.code !== 0)
    ).length

    return failedCount === 0
  } catch (error) {
    console.error('批量更新排序失败:', error)
    return false
  }
}

// ========== 导出常量 ==========

export { TemplateStatus, TemplateType }
export type { 
  ReportTemplateRespVO, 
  ReportTemplateCreateReqVO, 
  ReportTemplateUpdateReqVO,
  FrontendTemplateConfig,
  TemplateConfig,
  TemplateSection
}
