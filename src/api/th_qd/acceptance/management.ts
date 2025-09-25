/**
 * 开题管理中心API接口
 * @description 专门用于开题管理中心页面的接口
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 */

import request from '@/config/axios'
import type {
  AcceptanceApiResponse,
  AcceptancePageResponse,
  AcceptanceApplicationRespVO,
  AcceptanceMaterialDO,
  AcceptanceMaterialReviewRespVO,
  AcceptanceMeetingRespVO,
  AcceptanceConclusionFileRespVO
} from './types'

// ==================== 开题申请管理 ====================

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

// 创建开题申请
export const createProposalApplication = (data: any) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-application/create',
    data
  })
}

// 更新开题申请
export const updateProposalApplication = (data: any) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/update',
    data
  })
}

// 删除开题申请
export const deleteProposalApplication = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-application/delete?id=${id}`
  })
}

// 批量删除开题申请
export const batchDeleteProposalApplication = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/delete-list',
    params: { ids }
  })
}

// 导出开题申请Excel
export const exportProposalApplicationExcel = (params: any) => {
  return request.get({
    url: '/technological/acceptance-application/export-excel',
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
  acceptanceApplicationId?: number
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
  return request.get<AcceptancePageResponse<AcceptanceMaterialDO>>({
    url: '/technological/acceptance-material/page',
    params
  })
}

// 开题材料详情查询
export const getProposalMaterial = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMaterialDO>>({
    url: `/technological/acceptance-material/get?id=${id}`
  })
}

// 创建开题材料
export const createProposalMaterial = (data: any) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-material/create',
    data
  })
}

// 更新开题材料
export const updateProposalMaterial = (data: any) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material/update',
    data
  })
}

// 删除开题材料
export const deleteProposalMaterial = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-material/delete?id=${id}`
  })
}

// 批量删除开题材料
export const batchDeleteProposalMaterial = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material/delete-list',
    params: { ids }
  })
}

// 导出开题材料Excel
export const exportProposalMaterialExcel = (params: any) => {
  return request.get({
    url: '/technological/acceptance-material/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题审核记录管理 ====================

// 开题审核记录分页查询
export const getProposalMaterialReviewPage = (params: {
  pageNo: string
  pageSize: string
  acceptanceApplicationId?: string
  materialId?: string
  reviewResult?: string
  reviewOpinion?: string
  reviewer?: string
  reviewTime?: string
  isFinalReview?: string
  createTime?: string
}) => {
  return request.get<AcceptancePageResponse<AcceptanceMaterialReviewRespVO>>({
    url: '/technological/acceptance-material-review/page',
    params
  })
}

// 开题审核记录详情查询
export const getProposalMaterialReview = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMaterialReviewRespVO>>({
    url: `/technological/acceptance-material-review/get?id=${id}`
  })
}

// 创建开题审核记录
export const createProposalMaterialReview = (data: any) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-material-review/create',
    data
  })
}

// 批量创建开题审核记录
export const batchCreateProposalMaterialReview = (data: { saveReqVOList: any[] }) => {
  return request.post<AcceptanceApiResponse<number[]>>({
    url: '/technological/acceptance-material-review/creat',
    data
  })
}

// 更新开题审核记录
export const updateProposalMaterialReview = (data: any) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/update',
    data
  })
}

// 删除开题审核记录
export const deleteProposalMaterialReview = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-material-review/delete?id=${id}`
  })
}

// 批量删除开题审核记录
export const batchDeleteProposalMaterialReview = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/delete-list',
    params: { ids }
  })
}

// 导出开题审核记录Excel
export const exportProposalMaterialReviewExcel = (params: any) => {
  return request.get({
    url: '/technological/acceptance-material-review/export-excel',
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
  return request.get<AcceptancePageResponse<AcceptanceConclusionFileRespVO>>({
    url: '/technological/acceptance-conclusion-file/page',
    params
  })
}

// 开题结论文件详情查询
export const getProposalConclusionFile = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceConclusionFileRespVO>>({
    url: `/technological/acceptance-conclusion-file/get?id=${id}`
  })
}

// 创建开题结论文件
export const createProposalConclusionFile = (data: any) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-conclusion-file/create',
    data
  })
}

// 更新开题结论文件
export const updateProposalConclusionFile = (data: any) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-conclusion-file/update',
    data
  })
}

// 删除开题结论文件
export const deleteProposalConclusionFile = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-conclusion-file/delete?id=${id}`
  })
}

// 批量删除开题结论文件
export const batchDeleteProposalConclusionFile = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-conclusion-file/delete-list',
    params: { ids }
  })
}

// 导出开题结论文件Excel
export const exportProposalConclusionFileExcel = (params: any) => {
  return request.get({
    url: '/technological/acceptance-conclusion-file/export-excel',
    params,
    responseType: 'blob'
  })
}

// ==================== 开题会议管理 ====================

// 创建开题会议
export const createProposalMeeting = (data: {
  id: number
  acceptanceApplicationId: number
  meetingNo: string
  meetingName: string
  meetingTime: string
  meetingPlace: string
  meetingType: number
  meetingStatus: number
  meetingMinutes?: string
  meetingInstructions?: string
  acceptanceMeetingParticipantDOList?: Array<{
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
  acceptanceMeetingMaterialDOList?: Array<{
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
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-meeting/create',
    data
  })
}

// 获取开题会议详情
export const getProposalMeeting = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMeetingRespVO>>({
    url: `/technological/acceptance-meeting/get?id=${id}`
  })
}

// 更新开题会议
export const updateProposalMeeting = (data: any) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting/update',
    data
  })
}

// 删除开题会议
export const deleteProposalMeeting = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-meeting/delete?id=${id}`
  })
}

// 获取开题会议分页列表
export const getProposalMeetingPage = (params: {
  pageNo: string
  pageSize: string
  acceptanceApplicationId?: string
  meetingNo?: string
  meetingName?: string
  meetingStatus?: string
  meetingType?: string
}) => {
  return request.get<AcceptancePageResponse<AcceptanceMeetingRespVO>>({
    url: '/technological/acceptance-meeting/page',
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
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/createBatch',
    data: {
      saveReqVOList: data.applicationIds.map(id => ({
        id: 0,
        acceptanceApplicationId: id,
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
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/createBatch',
    data: {
      saveReqVOList: data.materialIds.map(materialId => ({
        id: 0,
        acceptanceApplicationId: 0, // 需要根据材料ID查询对应的申请ID
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
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-meeting-participant/create',
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
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-meeting-material/create',
    data
  })
}

// ==================== 开题验收结论管理 ====================

// 创建开题验收结论表(重写)
export const createProposalAcceptanceConclusion = (data: {
  id: number                    // 主键ID
  acceptanceApplicationId: number // 开题申请ID
  meetingId: number             // 会议ID（可选）
  conclusionType: number        // 结论类型（0-材料审核, 1-会议评审, 2-整改审核）
  conclusionResult: number      // 结论结果（0-通过, 1-有条件通过, 2-驳回）
  conclusionScore: number       // 验收评分（可选）
  conclusionDescription: string // 结论说明（可选）
}) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-acceptance-conclusion-review/create',
    data
  })
}

