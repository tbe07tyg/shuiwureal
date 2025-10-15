/**
 * 开题管理中心API接口
 * @description 专门用于开题管理中心页面的接口
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 */

import request from '@/config/axios'
import type { OpeningApiResponse, OpeningPageResponse } from './types'

// ==================== 开题申请管理 ====================

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

// 创建开题申请
export const createProposalApplication = (data: any) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-application-rewrite/create',
    data
  })
}

// 更新开题申请
export const updateProposalApplication = (data: any) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/update',
    data
  })
}

// 删除开题申请
export const deleteProposalApplication = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-application-rewrite/delete?id=${id}`
  })
}

// 批量删除开题申请
export const batchDeleteProposalApplication = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/delete-list',
    params: { ids }
  })
}

// 导出开题申请Excel
export const exportProposalApplicationExcel = (params: any) => {
  return request.get({
    url: '/technological/proposal-application-rewrite/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题材料管理 ====================

// 开题材料分页查询
export const getProposalMaterialPage = (params: {
  pageNo: number
  pageSize: number
  projectId?: number
  proposalApplicationId?: number
  materialType?: number
  materialName?: string
  fileUrl?: string
  fileSize?: number
  fileSuffix?: string
  isRequired?: boolean
  reviewStatus?: number
  sort?: number
  createTime?: string
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-material-rewrite/page',
    params
  })
}

// 开题材料详情查询
export const getProposalMaterial = (id: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: `/technological/proposal-material-rewrite/get?id=${id}`
  })
}

// 创建开题材料
export const createProposalMaterial = (data: any) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-material-rewrite/create',
    data
  })
}

// 更新开题材料
export const updateProposalMaterial = (data: any) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-rewrite/update',
    data
  })
}

// 删除开题材料
export const deleteProposalMaterial = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-material-rewrite/delete?id=${id}`
  })
}

// 批量删除开题材料
export const batchDeleteProposalMaterial = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-rewrite/delete-list',
    params: { ids }
  })
}

// 导出开题材料Excel
export const exportProposalMaterialExcel = (params: any) => {
  return request.get({
    url: '/technological/proposal-material-rewrite/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题审核记录管理 ====================

// 开题审核记录分页查询
export const getProposalMaterialReviewPage = (params: {
  pageNo: string
  pageSize: string
  proposalApplicationId?: string
  materialId?: string
  reviewResult?: string
  reviewOpinion?: string
  reviewer?: string
  reviewTime?: string
  isFinalReview?: string
  createTime?: string
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-material-review-rewrite/page',
    params
  })
}

// 开题审核记录详情查询
export const getProposalMaterialReview = (id: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: `/technological/proposal-material-review-rewrite/get?id=${id}`
  })
}

// 创建开题审核记录
export const createProposalMaterialReview = (data: any) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-material-review-rewrite/create',
    data
  })
}

// 批量创建开题审核记录
export const batchCreateProposalMaterialReview = (data: { saveReqVOList: any[] }) => {
  return request.post<OpeningApiResponse<number[]>>({
    url: '/technological/proposal-material-review-rewrite/createBatch',
    data
  })
}

// 更新开题审核记录
export const updateProposalMaterialReview = (data: any) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/update',
    data
  })
}

// 删除开题审核记录
export const deleteProposalMaterialReview = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-material-review-rewrite/delete?id=${id}`
  })
}

// 批量删除开题审核记录
export const batchDeleteProposalMaterialReview = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/delete-list',
    params: { ids }
  })
}

// 导出开题审核记录Excel
export const exportProposalMaterialReviewExcel = (params: any) => {
  return request.get({
    url: '/technological/proposal-material-review-rewrite/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题结论文件管理 ====================

// 开题结论文件分页查询
export const getProposalConclusionFilePage = (params: {
  pageNo: number
  pageSize: number
  conclusionId?: number
  fileName?: string
  fileUrl?: string
  fileSize?: number
  fileSuffix?: string
  sort?: number
  createTime?: string
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-conclusion-file-rewrite/page',
    params
  })
}

// 开题结论文件详情查询
export const getProposalConclusionFile = (id: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: `/technological/proposal-conclusion-file-rewrite/get?id=${id}`
  })
}

// 创建开题结论文件
export const createProposalConclusionFile = (data: any) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-conclusion-file-rewrite/create',
    data
  })
}

// 更新开题结论文件
export const updateProposalConclusionFile = (data: any) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-conclusion-file-rewrite/update',
    data
  })
}

// 删除开题结论文件
export const deleteProposalConclusionFile = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-conclusion-file-rewrite/delete?id=${id}`
  })
}

// 批量删除开题结论文件
export const batchDeleteProposalConclusionFile = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-conclusion-file-rewrite/delete-list',
    params: { ids }
  })
}

// 导出开题结论文件Excel
export const exportProposalConclusionFileExcel = (params: any) => {
  return request.get({
    url: '/technological/proposal-conclusion-file-rewrite/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题会议管理 ====================

// 创建开题会议
export const createProposalMeeting = (data: {
  id: number
  proposalApplicationId: number
  meetingNo: string
  meetingName: string
  meetingTime: string
  meetingPlace: string
  meetingType: number
  meetingStatus: number
  meetingMinutes?: string
  meetingInstructions?: string
  meetingParticipantReqVOList?: Array<{
    pageNo: number
    pageSize: number
    meetingId: number
    userId: number
    participantRole: number
    participantName: string
    participantTitle: string
    participantOrganization: string
    attendanceStatus: number
    sort: number
    createTime?: string[]
  }>
  meetingMaterialSaveReqVOList?: Array<{
    pageNo: number
    pageSize: number
    meetingId: number
    materialSource: number
    materialName: string
    fileUrl: string
    fileSize: number
    fileSuffix: string
    sort: number
    createTime?: string[]
  }>
}) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-meeting-rewrite/create',
    data
  })
}

// 获取开题会议详情
export const getProposalMeeting = (id: number) => {
  return request.get<OpeningApiResponse<any>>({
    url: `/technological/proposal-meeting-rewrite/get?id=${id}`
  })
}

// 更新开题会议
export const updateProposalMeeting = (data: any) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-rewrite/update',
    data
  })
}

// 删除开题会议
export const deleteProposalMeeting = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-meeting-rewrite/delete?id=${id}`
  })
}

// 获取开题会议分页列表
export const getProposalMeetingPage = (params: {
  pageNo: string
  pageSize: string
  proposalApplicationId?: string
  meetingNo?: string
  meetingName?: string
  meetingStatus?: string
  meetingType?: string
}) => {
  return request.get<OpeningPageResponse<any>>({
    url: '/technological/proposal-meeting-rewrite/page',
    params
  })
}

// ==================== 批量操作接口 ====================

// 批量审核开题申请
export const batchReviewProposalApplications = (data: {
  applicationIds: number[]
  reviewResult: number
  reviewOpinion: string
  reviewer: string
  reviewTime: string
  isFinalReview: boolean
}) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/createBatch',
    data: {
      saveReqVOList: data.applicationIds.map(id => ({
        id: 0,
        proposalApplicationId: id,
        materialId: null, // 空表示整体审核
        reviewResult: data.reviewResult,
        reviewOpinion: data.reviewOpinion,
        reviewer: data.reviewer,
        reviewTime: data.reviewTime,
        isFinalReview: data.isFinalReview
      }))
    }
  })
}

// 批量审核开题材料
export const batchReviewProposalMaterials = (data: {
  materialIds: number[]
  reviewResult: number
  reviewOpinion: string
  reviewer: string
  reviewTime: string
  isFinalReview: boolean
}) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/createBatch',
    data: {
      saveReqVOList: data.materialIds.map(materialId => ({
        id: 0,
        proposalApplicationId: 0, // 需要根据材料ID查询对应的申请ID
        materialId: materialId,
        reviewResult: data.reviewResult,
        reviewOpinion: data.reviewOpinion,
        reviewer: data.reviewer,
        reviewTime: data.reviewTime,
        isFinalReview: data.isFinalReview
      }))
    }
  })
}

// ==================== 开题会议参与人管理 ====================

// 创建开题会议参与人表(重写)
export const createProposalMeetingParticipant = (data: {
  id: number                    // 主键ID
  meetingId: number            // 会议ID
  userId: number               // 系统用户ID（可选）
  participantRole: number      // 参与者角色（0-主持人, 1-专家, 2-记录员, 3-观察员）
  participantName: string      // 参与者姓名
  participantTitle?: string    // 参与者职称（可选）
  participantOrganization?: string // 参与者单位（可选）
  attendanceStatus: number     // 出席状态（0-已邀请, 1-已确认, 2-已出席, 3-缺席）
  sort: number                 // 排序
}) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-meeting-participant-rewrite/create',
    data
  })
}

// ==================== 开题会议材料管理 ====================

// 创建开题会议资料表(重写)
export const createProposalMeetingMaterial = (data: {
  id: number                    // 主键ID
  meetingId: number            // 会议ID
  materialSource: number       // 材料来源（0-申报单位提交, 1-专家预审意见, 2-会议记录, 3-其他）
  materialName: string         // 材料名称
  fileUrl: string              // 文件URL
  fileSize: number             // 文件大小(字节)
  fileSuffix: string           // 文件后缀
  sort: number                 // 排序
}) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-meeting-material-rewrite/create',
    data
  })
}

// ==================== 开题验收结论管理 ====================

// 创建开题验收结论表(重写)
export const createProposalAcceptanceConclusion = (data: {
  id: number                    // 主键ID
  proposalApplicationId: number // 开题申请ID
  meetingId: number             // 会议ID（可选）
  conclusionType: number        // 结论类型（0-材料审核, 1-会议评审, 2-整改审核）
  conclusionResult: number      // 结论结果（0-通过, 1-有条件通过, 2-驳回）
  conclusionScore: number       // 验收评分（可选）
  conclusionDescription: string // 结论说明（可选）
}) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/create',
    data
  })
}
