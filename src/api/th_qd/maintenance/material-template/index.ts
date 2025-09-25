/**
 * 材料模板 API 接口
 * 
 * 提供材料模板的完整CRUD操作
 * API路径: /admin-api/technologicalmaterialtemplate/technological-material-template/*
 */

import request from '@/config/axios'
import type {
  TechnologicalMaterialTemplateRespVO,
  TechnologicalMaterialTemplateSaveReqVO,
  TechnologicalMaterialTemplatePageReqVO,
  TechnologicalMaterialTemplateExportReqVO,
  MaterialTemplateConfig,
  GroupedTemplateConfig,
  MaterialTemplateStats,
  GetMaterialTemplatePageResponse,
  GetMaterialTemplateResponse,
  CreateMaterialTemplateResponse,
  UpdateMaterialTemplateResponse,
  DeleteMaterialTemplateResponse,
  MaterialTemplateApiResponse,
  PageResult
} from './types'
import { UseSource,IsRequired } from './types'
// ========== 基础 CRUD 操作 ==========

/**
 * 获得材料模板分页
 * @param params 查询参数
 */
export const getMaterialTemplatePage = (params: TechnologicalMaterialTemplatePageReqVO): Promise<GetMaterialTemplatePageResponse> => {
  return request.get({
    url: '/technologicalmaterialtemplate/technological-material-template/page',
    params
  })
}

/**
 * 获得材料模板详情
 * @param id 模板ID
 */
export const getMaterialTemplate = (id: number): Promise<GetMaterialTemplateResponse> => {
  return request.get({
    url: '/technologicalmaterialtemplate/technological-material-template/get',
    params: { id }
  })
}

/**
 * 新增材料模板
 * @param data 模板数据
 */
export const createMaterialTemplate = (data: TechnologicalMaterialTemplateSaveReqVO): Promise<CreateMaterialTemplateResponse> => {
  return request.post({
    url: '/technologicalmaterialtemplate/technological-material-template/create',
    data
  })
}

/**
 * 修改材料模板
 * @param data 模板数据
 */
export const updateMaterialTemplate = (data: TechnologicalMaterialTemplateSaveReqVO): Promise<UpdateMaterialTemplateResponse> => {
  return request.put({
    url: '/technologicalmaterialtemplate/technological-material-template/update',
    data
  })
}

/**
 * 删除材料模板
 * @param id 模板ID
 */
export const deleteMaterialTemplate = (id: number): Promise<DeleteMaterialTemplateResponse> => {
  return request.delete({
    url: `/technologicalmaterialtemplate/technological-material-template/delete?id=${id}`
  })
}

/**
 * 批量删除材料模板
 * @param ids 模板ID数组
 */
export const deleteMaterialTemplateList = (ids: number[]): Promise<DeleteMaterialTemplateResponse> => {
  return request.delete({
    url: '/technologicalmaterialtemplate/technological-material-template/delete-list',
    data: ids
  })
}

/**
 * 导出材料模板 Excel
 * @param params 导出参数
 */
export const exportMaterialTemplateExcel = (params: TechnologicalMaterialTemplateExportReqVO) => {
  return request.download({
    url: '/technologicalmaterialtemplate/technological-material-template/export-excel',
    params
  })
}

// ========== 业务逻辑操作 ==========

/**
 * 根据使用源获取材料模板配置
 * @param useSource 使用源
 * @param includeOptional 是否包含可选材料
 */
export const getMaterialTemplatesByUseSource = async (
  useSource: UseSource, 
  includeOptional: boolean = true
): Promise<MaterialTemplateConfig[]> => {
  try {
    const response = await getMaterialTemplatePage({
      pageNo: 1,
      pageSize: 1000, // 获取所有数据
      useSource,
      ...(includeOptional ? {} : { isRequired: IsRequired.REQUIRED })
    })

    if (response.code === 0 && response.data) {
      return response.data.list.map(template => convertToTemplateConfig(template))
        .sort((a, b) => a.sort - b.sort)
    }
    
    console.warn('获取材料模板失败:', response.msg)
    return []
  } catch (error) {
    console.error('获取材料模板异常:', error)
    return []
  }
}

/**
 * 获取所有使用源的材料模板配置（按使用源分组）
 */
export const getAllMaterialTemplatesGrouped = async (): Promise<GroupedTemplateConfig> => {
  const [approvalTemplates, openingTemplates, midtermTemplates, acceptanceTemplates] = await Promise.all([
    getMaterialTemplatesByUseSource(UseSource.APPROVAL),
    getMaterialTemplatesByUseSource(UseSource.OPENING),
    getMaterialTemplatesByUseSource(UseSource.MIDTERM),
    getMaterialTemplatesByUseSource(UseSource.ACCEPTANCE)
  ])

  return {
    [UseSource.APPROVAL]: approvalTemplates,
    [UseSource.OPENING]: openingTemplates,
    [UseSource.MIDTERM]: midtermTemplates,
    [UseSource.ACCEPTANCE]: acceptanceTemplates
  }
}

/**
 * 获取材料模板统计信息
 */
export const getMaterialTemplateStats = async (): Promise<MaterialTemplateStats> => {
  try {
    const response = await getMaterialTemplatePage({
      pageNo: 1,
      pageSize: 1000 // 获取所有数据进行统计
    })

    if (response.code === 0 && response.data) {
      const templates = response.data.list
      
      const stats: MaterialTemplateStats = {
        total: templates.length,
        requiredCount: templates.filter(t => t.isRequired === IsRequired.REQUIRED).length,
        optionalCount: templates.filter(t => t.isRequired === IsRequired.OPTIONAL).length,
        byUseSource: {
          [UseSource.APPROVAL]: templates.filter(t => t.useSource === UseSource.APPROVAL).length,
          [UseSource.OPENING]: templates.filter(t => t.useSource === UseSource.OPENING).length,
          [UseSource.MIDTERM]: templates.filter(t => t.useSource === UseSource.MIDTERM).length,
          [UseSource.ACCEPTANCE]: templates.filter(t => t.useSource === UseSource.ACCEPTANCE).length
        }
      }
      
      return stats
    }
    
    return getEmptyStats()
  } catch (error) {
    console.error('获取材料模板统计异常:', error)
    return getEmptyStats()
  }
}

/**
 * 复制材料模板到其他使用源
 * @param templateId 源模板ID
 * @param targetUseSource 目标使用源
 */
export const copyMaterialTemplateToUseSource = async (
  templateId: number, 
  targetUseSource: UseSource
): Promise<boolean> => {
  try {
    // 获取源模板
    const sourceResponse = await getMaterialTemplate(templateId)
    if (sourceResponse.code !== 0 || !sourceResponse.data) {
      throw new Error('获取源模板失败')
    }

    const sourceTemplate = sourceResponse.data
    
    // 创建新模板
    const newTemplate: TechnologicalMaterialTemplateSaveReqVO = {
      categoryName: `${sourceTemplate.categoryName}(复制)`,
      isRequired: sourceTemplate.isRequired,
      sort: sourceTemplate.sort,
      templateFilePath: sourceTemplate.templateFilePath,
      descriptionAndExplanation: sourceTemplate.descriptionAndExplanation,
      useSource: targetUseSource
    }

    const createResponse = await createMaterialTemplate(newTemplate)
    return createResponse.code === 0
  } catch (error) {
    console.error('复制材料模板失败:', error)
    return false
  }
}

/**
 * 批量更新材料模板排序
 * @param sortData 排序数据数组 {id, sort}
 */
export const batchUpdateMaterialTemplateSort = async (
  sortData: Array<{ id: number; sort: number }>
): Promise<boolean> => {
  try {
    const updatePromises = sortData.map(async ({ id, sort }) => {
      // 先获取模板详情
      const templateResponse = await getMaterialTemplate(id)
      if (templateResponse.code !== 0 || !templateResponse.data) {
        throw new Error(`获取模板${id}失败`)
      }

      const template = templateResponse.data
      
      // 更新排序
      const updateData: TechnologicalMaterialTemplateSaveReqVO = {
        id: template.id,
        categoryName: template.categoryName,
        isRequired: template.isRequired,
        sort: sort, // 新的排序值
        templateFilePath: template.templateFilePath,
        descriptionAndExplanation: template.descriptionAndExplanation,
        useSource: template.useSource
      }

      return updateMaterialTemplate(updateData)
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

// ========== 工具函数 ==========

/**
 * 将 API 响应的模板数据转换为前端配置格式
 */
function convertToTemplateConfig(template: TechnologicalMaterialTemplateRespVO): MaterialTemplateConfig {
  return {
    id: template.id,
    key: generateTemplateKey(template.categoryName),
    name: template.categoryName,
    description: template.descriptionAndExplanation || '',
    isRequired: template.isRequired === IsRequired.REQUIRED,
    sort: template.sort,
    templateUrl: template.templateFilePath,
    useSource: template.useSource,
    fileList: [] // 前端使用
  }
}

/**
 * 根据类目名称生成唯一的key
 */
function generateTemplateKey(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]/g, '_') // 将非字母数字中文替换为下划线
    .replace(/_{2,}/g, '_') // 连续下划线合并为一个
    .replace(/^_|_$/g, '') // 去除首尾下划线
}

/**
 * 获取空的统计数据
 */
function getEmptyStats(): MaterialTemplateStats {
  return {
    total: 0,
    requiredCount: 0,
    optionalCount: 0,
    byUseSource: {
      [UseSource.APPROVAL]: 0,
      [UseSource.OPENING]: 0,
      [UseSource.MIDTERM]: 0,
      [UseSource.ACCEPTANCE]: 0
    }
  }
}

// ========== 使用源相关工具函数 ==========

/**
 * 获取使用源的显示名称
 */
export const getUseSourceName = (useSource: UseSource): string => {
  const names = {
    [UseSource.APPROVAL]: '立项申请',
    [UseSource.OPENING]: '项目开题',
    [UseSource.MIDTERM]: '项目中期', 
    [UseSource.ACCEPTANCE]: '项目验收'
  }
  return names[useSource] || '未知'
}

/**
 * 获取所有使用源选项
 */
export const getUseSourceOptions = () => [
  { label: '立项申请', value: UseSource.APPROVAL },
  { label: '项目开题', value: UseSource.OPENING },
  { label: '项目中期', value: UseSource.MIDTERM },
  { label: '项目验收', value: UseSource.ACCEPTANCE }
]

/**
 * 获取是否必传的显示名称
 */
export const getIsRequiredName = (isRequired: IsRequired): string => {
  return isRequired === IsRequired.REQUIRED ? '必传' : '选传'
}

/**
 * 获取是否必传选项
 */
export const getIsRequiredOptions = () => [
  { label: '必传', value: IsRequired.REQUIRED },
  { label: '选传', value: IsRequired.OPTIONAL }
]