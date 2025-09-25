/**
 * 开题申请管理API接口
 * @description 专门用于开题申请管理页面的接口
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 */

import request from '@/config/axios'
import type { OpeningApiResponse, OpeningPageResponse, TechnologicalProjectRespVO } from './types'

// 开题申请分页查询
export const getProposalApplicationPage = (params: {
  pageNo: number
  pageSize: number
  projectId?: number
  applicationNo?: string
  applicationType?: number
  applicationStatus?: number
  expectedProposalTime?: string
  applicationDescription?: string
  notes?: string
  createTime?: string
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-application-rewrite/page',
    params
  })
}

// 开题申请详情查询
export const getProposalApplication = (id: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: `/technological/proposal-application-rewrite/get?id=${id}`
  })
}

// 开题材料分页查询
export const getProposalMaterialPage = (params: {
  pageNo: number
  pageSize: number
  projectId?: number
  proposalApplicationId?: number
  materialType?: number
  reviewStatus?: number
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-material-rewrite/page',
    params
  })
}

// 检查项目开题状态
export const checkProjectOpeningStatus = (projectId: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: '/technological/proposal-application-rewrite/check-project-status',
    params: { projectId }
  })
}

// 获得项目立项申请详情
export const getTechnologicalProject = (id: number) => {
  return request.get<OpeningApiResponse<TechnologicalProjectRespVO>>({
    url: `/technologicalproject/technological-project/get?id=${id}`
  })
}
