import request from '@/config/axios'
import { getTechnologicalProjectPage, getTechnologicalProject } from '@/api/th_qd/approval'
import type {
  ProjectBasicInfoRespVO,
  OpeningApiResponse,
  OpeningPageResponse
} from './types'

// ========== 项目选择相关API ==========

/**
 * 获得可选项目列表 (用于开题申请时的项目选择)
 * 只返回可申请开题的项目状态
 */
export const getAvailableProjectsForOpening = (params: {
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
    status: params.projectStatus?.[0] || 8, // 使用第一个状态值，或者默认值1
    projectName: params.keyword, // 使用项目名称作为搜索关键词
    applicant: params.applicant,
    applicantUnit: params.applicantUnit
  })
}

/**
 * 获得项目详情 (用于开题申请时获取项目信息)
 */
export const getProjectDetailForOpening = (projectId: number) => {
  // 使用approval中已经存在的API
  return getTechnologicalProject(projectId)
}

/**
 * 根据关键词搜索项目 (用于项目选择下拉框的搜索功能)
 */
export const searchProjectsForOpening = (keyword: string, pageSize: number = 20) => {
  // 使用approval中已经存在的API
  return getTechnologicalProjectPage({
    pageNo: 1,
    pageSize,
    projectName: keyword, // 使用项目名称作为搜索关键词
    status: 1 // 默认状态
  })
}

/**
 * 获取当前用户可申请开题的项目列表
 * 根据用户权限和项目状态过滤
 */
export const getMyAvailableProjectsForOpening = (params: {
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
 * 检查项目是否可以申请开题
 * 验证项目状态、用户权限等
 */
export const checkProjectOpeningEligibility = (projectId: number) => {
  return request.get<OpeningApiResponse<{
    eligible: boolean
    reason?: string
    projectInfo: ProjectBasicInfoRespVO
  }>>({
    url: '/technologicalproject/technological-project/check-opening-eligibility',
    params: { projectId }
  })
}

/**
 * 获取项目开题申请历史
 * 检查该项目是否已经申请过开题
 */
export const getProjectOpeningHistory = (projectId: number) => {
  return request.get<OpeningApiResponse<{
    hasHistory: boolean
    lastApplicationId?: number
    lastApplicationStatus?: number
    lastApplicationTime?: string
  }>>({
    url: '/technological/proposal-application-rewrite/check-project-history',
    params: { projectId }
  })
}
