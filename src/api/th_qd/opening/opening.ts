import request from '@/config/axios'
import type {
  ProposalApplicationRespVO,
  ProposalApplicationSaveReqVO,
  ProposalApplicationPageReqVO,
  ProposalMaterialRewriteDO,
  ProposalMaterialRewriteSaveReqVO,
  ProposalMaterialReviewRewriteRespVO,
  ProposalMaterialReviewRewriteSaveReqVO,
  ProposalMeetingRewriteRespVO,
  ProposalMeetingRewriteSaveReqVO,
  ProposalMeetingParticipantReqVO,
  ProposalMeetingMaterialSaveReqVO,
  ProposalAcceptanceConclusionRespVO,
  ProposalAcceptanceConclusionSaveReqVO,
  ProposalRectificationRewriteRespVO,
  ProposalRectificationRewriteSaveReqVO,
  ProposalTimelineRewriteRespVO,
  ProposalTimelineRewriteSaveReqVO,
  ProposalConclusionFileRewriteRespVO,
  ProposalConclusionFileRewriteSaveReqVO,
  ProposalMeetingRemindRespVO,
  ProposalMeetingRemindSaveReqVO,
  ProjectBasicInfoRespVO,
  ProjectOpeningStatusCheckResult,
  MaterialValidationResult,
  OpeningApiResponse,
  OpeningPageResponse,
  PageParam
} from './types'

// ========== 项目开题申请相关API ==========

/**
 * 获得项目开题申请分页
 */
export const getProposalApplicationPage = (params: ProposalApplicationPageReqVO) => {
  return request.get<OpeningPageResponse<ProposalApplicationRespVO>>({
    url: '/technological/proposal-application-rewrite/page',
    params
  })
}

/**
 * 获得项目开题申请详情
 */
export const getProposalApplication = (id: number) => {
  return request.get<OpeningApiResponse<ProposalApplicationRespVO>>({
    url: '/technological/proposal-application-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题申请
 * 严格按照API文档: /admin-api/technological/proposal-application-rewrite/create
 */
export const createProposalApplication = (data: ProposalApplicationSaveReqVO) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-application-rewrite/create',
    data
  })
}

/**
 * 修改项目开题申请
 */
export const updateProposalApplication = (data: ProposalApplicationSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/update',
    data
  })
}

/**
 * 删除项目开题申请
 */
export const deleteProposalApplication = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-application-rewrite/delete?id=${id}`
  })
}

/**
 * 批量删除项目开题申请
 */
export const deleteProposalApplicationList = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/delete-list',
    data: ids
  })
}

/**
 * 导出项目开题申请 Excel
 */
export const exportProposalApplicationExcel = (params?: ProposalApplicationPageReqVO) => {
  return request.download({
    url: '/technological/proposal-application-rewrite/export-excel',
    params
  })
}

/**
 * 保存开题申请草稿
 * 严格按照API文档: /admin-api/technological/proposal-application-rewrite/create
 * 通过设置 applicationStatus: 0 来表示草稿状态
 */
export const saveProposalApplicationDraft = (data: ProposalApplicationSaveReqVO) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-application-rewrite/create',
    data: {
      ...data,
      applicationStatus: 0 // 草稿状态
    }
  })
}

/**
 * 检查项目开题状态
 * 验证项目是否可以申请开题
 */
export const checkProjectOpeningStatus = (projectId: number) => {
  return request.get<OpeningApiResponse<ProjectOpeningStatusCheckResult>>({
    url: '/technological/proposal-application-rewrite/check-project-status',
    params: { projectId }
  })
}

/**
 * 提交开题申请
 * 将草稿状态变更为提交状态
 */
export const submitProposalApplication = (id: number) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/submit',
    params: { id }
  })
}

/**
 * 撤回开题申请
 * 将提交状态变更为草稿状态
 */
export const withdrawProposalApplication = (id: number) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-application-rewrite/withdraw',
    params: { id }
  })
}

/**
 * 获取用户的开题申请列表
 */
export const getMyProposalApplications = (params: {
  pageNo?: number
  pageSize?: number
  status?: number[]
  keyword?: string
}) => {
  return request.get<OpeningPageResponse<ProposalApplicationRespVO>>({
    url: '/technological/proposal-application-rewrite/my-applications',
    params
  })
}

// ========== 项目开题材料相关API ==========

/**
 * 获得项目开题材料分页
 */
export const getProposalMaterialPage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMaterialRewriteDO>>({
    url: '/technological/proposal-material-rewrite/page',
    params
  })
}

/**
 * 获得项目开题材料详情
 */
export const getProposalMaterial = (id: number) => {
  return request.get<OpeningApiResponse<ProposalMaterialRewriteDO>>({
    url: '/technological/proposal-material-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题材料
 */
export const createProposalMaterial = (data: ProposalMaterialRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-material-rewrite/create',
    data
  })
}

/**
 * 修改项目开题材料
 */
export const updateProposalMaterial = (data: ProposalMaterialRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-rewrite/update',
    data
  })
}

/**
 * 删除项目开题材料
 */
export const deleteProposalMaterial = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-material-rewrite/delete?id=${id}`
  })
}

/**
 * 批量删除项目开题材料
 */
export const deleteProposalMaterialList = (ids: number[]) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-rewrite/delete-list',
    data: ids
  })
}

/**
 * 上传开题材料文件
 */
export const uploadProposalMaterialFile = (data: {
  proposalApplicationId: number
  materialType: string
  fileName: string
  fileUrl: string
  fileSize: number
  isRequired: boolean
}) => {
  return request.post<OpeningApiResponse<number>>({
    url: '/technological/proposal-material-rewrite/upload-file',
    data
  })
}

/**
 * 获取开题申请的材料列表
 */
export const getProposalApplicationMaterials = (proposalApplicationId: number) => {
  return request.get<OpeningApiResponse<ProposalMaterialRewriteDO[]>>({
    url: '/technological/proposal-material-rewrite/list-by-application',
    params: { proposalApplicationId }
  })
}

/**
 * 验证开题材料完整性
 */
export const validateProposalMaterials = (proposalApplicationId: number) => {
  return request.get<OpeningApiResponse<MaterialValidationResult>>({
    url: '/technological/proposal-material-rewrite/validate-materials',
    data: { proposalApplicationId }
  })
}

// ========== 项目开题材料审核记录相关API ==========

/**
 * 获得项目开题材料审核记录分页
 */
export const getProposalMaterialReviewPage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMaterialReviewRewriteRespVO>>({
    url: '/technological/proposal-material-review-rewrite/page',
    params
  })
}

/**
 * 获得项目开题材料审核记录详情
 */
export const getProposalMaterialReview = (id: number) => {
  return request.get<OpeningApiResponse<ProposalMaterialReviewRewriteRespVO>>({
    url: '/technological/proposal-material-review-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题材料审核记录
 */
export const createProposalMaterialReview = (data: ProposalMaterialReviewRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/create',
    data
  })
}

/**
 * 修改项目开题材料审核记录
 */
export const updateProposalMaterialReview = (data: ProposalMaterialReviewRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-material-review-rewrite/update',
    data
  })
}

/**
 * 删除项目开题材料审核记录
 */
export const deleteProposalMaterialReview = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-material-review-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题会议相关API ==========

/**
 * 获得项目开题会议分页
 */
export const getProposalMeetingPage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMeetingRewriteRespVO>>({
    url: '/technological/proposal-meeting-rewrite/page',
    params
  })
}

/**
 * 获得项目开题会议详情
 */
export const getProposalMeeting = (id: number) => {
  return request.get<OpeningApiResponse<ProposalMeetingRewriteRespVO>>({
    url: '/technological/proposal-meeting-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题会议
 */
export const createProposalMeeting = (data: ProposalMeetingRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-rewrite/create',
    data
  })
}

/**
 * 修改项目开题会议
 */
export const updateProposalMeeting = (data: ProposalMeetingRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-rewrite/update',
    data
  })
}

/**
 * 删除项目开题会议
 */
export const deleteProposalMeeting = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-meeting-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题会议参与人相关API ==========

/**
 * 获得项目开题会议参与人分页
 */
export const getProposalMeetingParticipantPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMeetingParticipantReqVO>>({
    url: '/technological/proposal-meeting-participant-rewrite/page',
    params
  })
}

/**
 * 新增项目开题会议参与人
 */
export const createProposalMeetingParticipant = (data: ProposalMeetingParticipantReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-participant-rewrite/create',
    data
  })
}

/**
 * 修改项目开题会议参与人
 */
export const updateProposalMeetingParticipant = (data: ProposalMeetingParticipantReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-participant-rewrite/update',
    data
  })
}

/**
 * 删除项目开题会议参与人
 */
export const deleteProposalMeetingParticipant = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-meeting-participant-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题会议材料相关API ==========

/**
 * 获得项目开题会议材料分页
 */
export const getProposalMeetingMaterialPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMeetingMaterialSaveReqVO>>({
    url: '/technological/proposal-meeting-material-rewrite/page',
    params
  })
}

/**
 * 新增项目开题会议材料
 */
export const createProposalMeetingMaterial = (data: ProposalMeetingMaterialSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-material-rewrite/create',
    data
  })
}

/**
 * 修改项目开题会议材料
 */
export const updateProposalMeetingMaterial = (data: ProposalMeetingMaterialSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-material-rewrite/update',
    data
  })
}

/**
 * 删除项目开题会议材料
 */
export const deleteProposalMeetingMaterial = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-meeting-material-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题验收结论相关API ==========

/**
 * 获得项目开题验收结论分页
 */
export const getProposalAcceptanceConclusionPage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalAcceptanceConclusionRespVO>>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/page',
    params
  })
}
//getProposalAcceptanceConclusionPage,updateProposalAcceptanceConclusion
/**
 * 获得项目开题验收结论详情
 */
export const getProposalAcceptanceConclusion = (id: number) => {
  return request.get<OpeningApiResponse<ProposalAcceptanceConclusionRespVO>>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题验收结论
 */
export const createProposalAcceptanceConclusion = (data: ProposalAcceptanceConclusionSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/create',
    data
  })
}

/**
 * 修改项目开题验收结论
 */
export const updateProposalAcceptanceConclusion = (data: ProposalAcceptanceConclusionSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/update',
    data
  })
}

/**
 * 删除项目开题验收结论
 */
export const deleteProposalAcceptanceConclusion = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-acceptance-conclusion-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题整改记录相关API ==========

/**
 * 获得项目开题整改记录分页
 */
export const getProposalRectificationPage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalRectificationRewriteRespVO>>({
    url: '/technological/proposal-rectification-rewrite/page',
    params
  })
}

/**
 * 获得项目开题整改记录详情
 */
export const getProposalRectification = (id: number) => {
  return request.get<OpeningApiResponse<ProposalRectificationRewriteRespVO>>({
    url: '/technological/proposal-rectification-rewrite/get',
    params: { id }
  })
}

/**
 * 新增项目开题整改记录
 */
export const createProposalRectification = (data: ProposalRectificationRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-rectification-rewrite/create',
    data
  })
}

/**
 * 修改项目开题整改记录
 */
export const updateProposalRectification = (data: ProposalRectificationRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-rectification-rewrite/update',
    data
  })
}

/**
 * 删除项目开题整改记录
 */
export const deleteProposalRectification = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-rectification-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题项目时间线相关API ==========

/**
 * 获得项目开题项目时间线分页
 */
export const getProposalTimelinePage = (params: PageParam & { proposalApplicationId?: number }) => {
  return request.get<OpeningPageResponse<ProposalTimelineRewriteRespVO>>({
    url: '/technological/proposal-timeline-rewrite/page',
    params
  })
}

/**
 * 新增项目开题项目时间线
 */
export const createProposalTimeline = (data: ProposalTimelineRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-timeline-rewrite/create',
    data
  })
}

/**
 * 修改项目开题项目时间线
 */
export const updateProposalTimeline = (data: ProposalTimelineRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-timeline-rewrite/update',
    data
  })
}

/**
 * 删除项目开题项目时间线
 */
export const deleteProposalTimeline = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-timeline-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题结论文件相关API ==========

/**
 * 获得项目开题结论文件分页
 */
export const getProposalConclusionFilePage = (params: PageParam & { conclusionId?: number }) => {
  return request.get<OpeningPageResponse<ProposalConclusionFileRewriteRespVO>>({
    url: '/technological/proposal-conclusion-file-rewrite/page',
    params
  })
}

/**
 * 新增项目开题结论文件
 */
export const createProposalConclusionFile = (data: ProposalConclusionFileRewriteSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-conclusion-file-rewrite/create',
    data
  })
}

/**
 * 修改项目开题结论文件
 */
export const updateProposalConclusionFile = (data: ProposalConclusionFileRewriteSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-conclusion-file-rewrite/update',
    data
  })
}

/**
 * 删除项目开题结论文件
 */
export const deleteProposalConclusionFile = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-conclusion-file-rewrite/delete?id=${id}`
  })
}

// ========== 项目开题会议提前提醒相关API ==========

/**
 * 获得项目开题会议提前提醒分页
 */
export const getProposalMeetingRemindPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<OpeningPageResponse<ProposalMeetingRemindRespVO>>({
    url: '/technological/proposal-meeting-remind/page',
    params
  })
}

/**
 * 新增项目开题会议提前提醒
 */
export const createProposalMeetingRemind = (data: ProposalMeetingRemindSaveReqVO) => {
  return request.post<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-remind/create',
    data
  })
}

/**
 * 修改项目开题会议提前提醒
 */
export const updateProposalMeetingRemind = (data: ProposalMeetingRemindSaveReqVO) => {
  return request.put<OpeningApiResponse<boolean>>({
    url: '/technological/proposal-meeting-remind/update',
    data
  })
}

/**
 * 删除项目开题会议提前提醒
 */
export const deleteProposalMeetingRemind = (id: number) => {
  return request.delete<OpeningApiResponse<boolean>>({
    url: `/technological/proposal-meeting-remind/delete?id=${id}`
  })
}

// ========== 项目基础信息相关API (用于项目选择) ==========

/**
 * 获得可选项目列表 (用于开题申请时的项目选择)
 */
export const getAvailableProjectsForOpening = (params: {
  pageNo?: number
  pageSize?: number
  projectStatus?: number[]
  keyword?: string
}) => {
  return request.get<OpeningPageResponse<ProjectBasicInfoRespVO>>({
    url: '/technologicalproject/technological-project/page',
    params: {
      ...params,
      // 只查询可申请开题的项目状态
      projectStatus: params.projectStatus || [1, 2] // 实施中、即将结束
    }
  })
}

/**
 * 获得项目详情 (用于开题申请时获取项目信息)
 */
export const getProjectDetailForOpening = (projectId: number) => {
  return request.get<OpeningApiResponse<ProjectBasicInfoRespVO>>({
    url: '/technologicalproject/technological-project/get',
    params: { id: projectId }
  })
}
