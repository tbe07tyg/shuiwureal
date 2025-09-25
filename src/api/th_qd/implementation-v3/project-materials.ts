import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：立项项目材料管理
 * 维护人：科研管理系统
 * 日期：2025-01-29
 * 说明：获取立项项目的申报书等材料文档
 */

// ===== 请求与响应类型定义 =====

export interface ProjectMaterialParams {
  pageNo?: number
  pageSize?: number
  projectId?: number
  materialType?: string
  fileName?: string
  fileExtension?: string
}

export interface ProjectMaterialItem {
  id: number
  projectId: number
  materialType: string
  materialName: string  // 实际API字段名
  fileName?: string     // 兼容字段
  fileUrl: string
  fileSize: number
  fileExtension?: string
  fileSuffix?: string   // 实际API字段名
  uploadTime: string
  uploadUserId?: number
  uploadUserName?: string
  uploader?: string     // 实际API字段名
  isRequired: boolean
  reviewStatus?: string
  reviewComments?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface CommonResultPage<T> {
  code: number
  data: PageResult<T>
  msg?: string
}

// ===== 接口封装 =====

/**
 * 获取立项项目的申报书材料（分页）
 * GET /admin-api/technologicalprojectmaterial/technological-project-material/page
 */
export const listProjectMaterials = async (
  params: ProjectMaterialParams
): Promise<CommonResultPage<ProjectMaterialItem>> => {
  const url = '/technologicalprojectmaterial/technological-project-material/page'
  apiLog({ action: '获取立项项目材料', api: 'listProjectMaterials', method: 'GET', url, params })
  const res = await request.get<{ data: PageResult<ProjectMaterialItem>; code: number; msg?: string }>({
    url,
    params
  })
  apiLog({ action: '获取立项项目材料', api: 'listProjectMaterials', method: 'GET', url, params }, res)
  return res as unknown as CommonResultPage<ProjectMaterialItem>
}

/**
 * 从候选材料中挑选最可能的"申报书"
 * 策略：关键词评分（申报书/申请书优先；草稿/模板降权）→ 上传时间降序
 */
export const pickBestProposalMaterial = (materials: ProjectMaterialItem[]): ProjectMaterialItem | null => {
  if (!materials || materials.length === 0) return null
  
  // 评分函数
  const scoreByKeywords = (material: ProjectMaterialItem): number => {
    let score = 0
    // 优先使用 materialName，回退到 fileName
    const fileName = material.materialName || material.fileName
    if (!fileName || typeof fileName !== 'string') return 0
    const name = fileName.toLowerCase()
    
    // 正向关键词（加分）
    if (name.includes('申报书') || name.includes('申请书')) score += 10
    if (name.includes('正式') || name.includes('定稿')) score += 5
    if (name.includes('最终') || name.includes('终版')) score += 3
    
    // 负向关键词（减分）
    if (name.includes('草稿') || name.includes('初稿')) score -= 5
    if (name.includes('模板') || name.includes('示例')) score -= 8
    if (name.includes('备份') || name.includes('副本')) score -= 3
    
    return score
  }
  
  // 按评分和时间排序
  const sorted = materials
    .map(material => ({
      ...material,
      score: scoreByKeywords(material)
    }))
    .sort((a, b) => {
      // 先按评分降序
      if (a.score !== b.score) return b.score - a.score
      // 评分相同时按上传时间降序（最新的优先）
      return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    })
  
  return sorted[0] || null
}
