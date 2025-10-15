/**
 * 开题申请管理API接口
 * @description 专门用于开题申请管理页面的接口
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 */

import request from '@/config/axios'
import type {
  AcceptanceApiResponse,
  AcceptancePageResponse,
  TechnologicalProjectRespVO,
  AcceptanceApplicationRespVO,
  AcceptanceMaterialDO,
  AcceptanceMeetingRespVO
} from './types'

// 开题申请分页查询
export const getProposalApplicationPage = (params: {
  pageNo: number
  pageSize: number
  projectId?: number
  applicationNo?: string
  acceptanceType?: number
  applicationStatus?: number
  expectedAcceptanceTime?: string
  applicationDescription?: string
  notes?: string
  createTime?: string
}) => {
  return request.get<AcceptancePageResponse<AcceptanceApplicationRespVO>>({
    url: '/technological/acceptance-application/page',
    params
  })
}

// 开题申请详情查询
export const getProposalApplication = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceApplicationRespVO>>({
    url: `/technological/acceptance-application/get?id=${id}`
  })
}

// 开题材料分页查询
export const getProposalMaterialPage = (params: {
  pageNo: number
  pageSize: number
  projectId?: number
  acceptanceApplicationId?: number
  materialType?: number
  reviewStatus?: number
}) => {
  return request.get<AcceptancePageResponse<AcceptanceMaterialDO>>({
    url: '/technological/acceptance-material/page',
    params
  })
}

// 检查项目开题状态
export const checkProjectAcceptanceStatus = (projectId: number) => {
  return request.get<AcceptanceApiResponse<{ canSubmit: boolean }>>({
    url: '/technological/acceptance-application/check-project-status',
    params: { projectId }
  })
}

// 获得项目立项申请详情
export const getTechnologicalProject = (id: number) => {
  return request.get<AcceptanceApiResponse<TechnologicalProjectRespVO>>({
    url: `/technologicalproject/technological-project/get?id=${id}`
  })
}
