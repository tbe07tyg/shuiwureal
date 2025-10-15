import request from '@/config/axios'
import { getTechnologicalProjectPage, getTechnologicalProject } from '@/api/th_qd/approval'
import type {
  ProjectBasicInfoRespVO,
  AcceptanceApiResponse,
  AcceptancePageResponse
} from './types'

// ========== 项目选择相关API（验收） ==========

/**
 * 获得可选项目列表 (用于验收申请时的项目选择)
 * 只返回可申请验收的项目状态
 */
export const getAvailableProjectsForAcceptance = (params: {
  pageNo?: number
  pageSize?: number
  projectStatus?: number[]
  keyword?: string
  applicant?: string
  applicantUnit?: string
}) => {
  // 使用approval中已经存在的API
  return getTechnologicalProjectPage({
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 100,
    status: params.projectStatus?.[0] || 8,
    projectName: params.keyword, // 使用项目名称作为搜索关键词
    applicant: params.applicant,
    applicantUnit: params.applicantUnit
  })
}

/**
 * 获得项目详情 (用于验收申请时获取项目信息)
 */
export const getProjectDetailForAcceptance = (projectId: number) => {
  // 使用approval中已经存在的API
  return getTechnologicalProject(projectId)
}

/**
 * 根据关键词搜索项目 (用于项目选择下拉框的搜索功能)
 */
export const searchProjectsForAcceptance = (keyword: string, pageSize: number = 20) => {
  // 使用approval中已经存在的API
  return getTechnologicalProjectPage({
    pageNo: 1,
    pageSize,
    projectName: keyword, // 使用项目名称作为搜索关键词
    status: 1 // 默认状态
  })
}

/**
 * 获取当前用户可申请验收的项目列表
 * 根据用户权限和项目状态过滤
 */
export const getMyAvailableProjectsForAcceptance = (params: {
  pageNo?: number
  pageSize?: number
  keyword?: string
}) => {
  // 使用approval中已经存在的API
  return getTechnologicalProjectPage({
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 100,
    projectName: params.keyword, // 使用项目名称作为搜索关键词
    status: 1, // 默认状态
    // 这里可以根据实际需求添加用户权限相关的参数
    // 比如：applicant: currentUser.id
  })
}

/**
 * 检查项目是否可以申请验收
 * 验证项目状态、用户权限等
 */
export const checkProjectAcceptanceEligibility = (projectId: number) => {
  return request.get<AcceptanceApiResponse<{
    eligible: boolean
    reason?: string
    projectInfo: ProjectBasicInfoRespVO
  }>>({
    url: '/technologicalproject/technological-project/check-acceptance-eligibility',
    params: { projectId }
  })
}

/**
 * 获取项目验收申请历史
 * 检查该项目是否已经申请过验收
 */
export const getProjectAcceptanceHistory = (projectId: number) => {
  return request.get<AcceptanceApiResponse<{
    hasHistory: boolean
    lastApplicationId?: number
    lastApplicationStatus?: number
    lastApplicationTime?: string
  }>>({
    url: '/technological/acceptance-application/check-project-history',
    params: { projectId }
  })
}
