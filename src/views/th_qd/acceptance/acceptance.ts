import request from '@/config/axios'
import type {
  AcceptanceApplicationRespVO,
  AcceptanceApplicationSaveReqVO,
  AcceptanceApplicationPageReqVO,
  AcceptanceMaterialDO,
  AcceptanceMaterialSaveReqVO,
  AcceptanceMaterialReviewRespVO,
  AcceptanceMaterialReviewSaveReqVO,
  AcceptanceMeetingRespVO,
  AcceptanceMeetingSaveReqVO,
  AcceptanceMeetingParticipantReqVO,
  AcceptanceMeetingMaterialSaveReqVO,
  AcceptanceConclusionRespVO,
  AcceptanceConclusionSaveReqVO,
  AcceptanceRectificationRespVO,
  AcceptanceRectificationSaveReqVO,
  AcceptanceTimelineRespVO,
  AcceptanceTimelineSaveReqVO,
  AcceptanceConclusionFileRespVO,
  AcceptanceConclusionFileSaveReqVO,
  AcceptanceMeetingRemindRespVO,
  AcceptanceMeetingRemindSaveReqVO,
  ProjectBasicInfoRespVO,
  ProjectAcceptanceStatusCheckResult,
  MaterialValidationResult,
  AcceptanceApiResponse,
  AcceptancePageResponse,
  PageParam
} from './types'

// ========== 项目开题申请相关API ==========

/**
 * 获得项目开题申请分页
 */
export const getAcceptanceApplicationPage = (params: AcceptanceApplicationPageReqVO) => {
  return request.get<AcceptancePageResponse<AcceptanceApplicationRespVO>>({
    url: '/technological/acceptance-application/page',
    params
  })
}

/**
 * 获得项目开题申请详情
 */
export const getProposalApplication = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceApplicationRespVO>>({
    url: '/technological/acceptance-application/get',
    params: { id }
  })
}

/**
 * 新增项目开题申请
 * 严格按照API文档: /admin-api/technological/acceptance-application/create
 */
export const createProposalApplication = (data: AcceptanceApplicationSaveReqVO) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-application/create',
    data
  })
}

/**
 * 修改项目开题申请
 */
export const updateProposalApplication = (data: AcceptanceApplicationSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/update',
    data
  })
}

/**
 * 删除项目开题申请
 */
export const deleteProposalApplication = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-application/delete?id=${id}`
  })
}

/**
 * 批量删除项目开题申请
 */
export const deleteProposalApplicationList = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/delete-list',
    data: ids
  })
}

/**
 * 导出项目开题申请 Excel
 */
export const exportProposalApplicationExcel = (params?: AcceptanceApplicationPageReqVO) => {
  return request.download({
    url: '/technological/acceptance-application/export-excel',
    params
  })
}

/**
 * 保存开题申请草稿
 * 严格按照API文档: /admin-api/technological/acceptance-application/create
 * 通过设置 applicationStatus: 0 来表示草稿状态
 */
export const saveProposalApplicationDraft = (data: AcceptanceApplicationSaveReqVO) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-application/create',
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
export const checkProjectAcceptanceStatus = (projectId: number) => {
  return request.get<AcceptanceApiResponse<ProjectAcceptanceStatusCheckResult>>({
    url: '/technological/acceptance-application/check-project-status',
    params: { projectId }
  })
}

/**
 * 提交开题申请
 * 将草稿状态变更为提交状态
 */
export const submitProposalApplication = (id: number) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/submit',
    params: { id }
  })
}

/**
 * 撤回开题申请
 * 将提交状态变更为草稿状态
 */
export const withdrawProposalApplication = (id: number) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-application/withdraw',
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
  return request.get<AcceptancePageResponse<AcceptanceApplicationRespVO>>({
    url: '/technological/acceptance-application/my-applications',
    params
  })
}

// ========== 项目开题材料相关API ==========

/**
 * 获得项目开题材料分页
 */
export const getProposalMaterialPage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMaterialDO>>({
    url: '/technological/acceptance-material/page',
    params
  })
}

/**
 * 获得项目开题材料详情
 */
export const getProposalMaterial = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMaterialDO>>({
    url: '/technological/acceptance-material/get',
    params: { id }
  })
}

/**
 * 新增项目开题材料
 */
export const createProposalMaterial = (data: AcceptanceMaterialSaveReqVO) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-material/create',
    data
  })
}

/**
 * 修改项目开题材料
 */
export const updateProposalMaterial = (data: AcceptanceMaterialSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material/update',
    data
  })
}

/**
 * 删除项目开题材料
 */
export const deleteProposalMaterial = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-material/delete?id=${id}`
  })
}

/**
 * 批量删除项目开题材料
 */
export const deleteProposalMaterialList = (ids: number[]) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material/delete-list',
    data: ids
  })
}

/**
 * 上传开题材料文件
 */
export const uploadProposalMaterialFile = (data: {
  acceptanceApplicationId: number
  materialType: string
  fileName: string
  fileUrl: string
  fileSize: number
  isRequired: boolean
}) => {
  return request.post<AcceptanceApiResponse<number>>({
    url: '/technological/acceptance-material/upload-file',
    data
  })
}

/**
 * 获取开题申请的材料列表
 */
export const getProposalApplicationMaterials = (acceptanceApplicationId: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMaterialDO[]>>({
    url: '/technological/acceptance-material/list-by-application',
    params: { acceptanceApplicationId }
  })
}

/**
 * 验证开题材料完整性
 */
export const validateProposalMaterials = (acceptanceApplicationId: number) => {
  return request.get<AcceptanceApiResponse<MaterialValidationResult>>({
    url: '/technological/acceptance-material/validate-materials',
    data: { acceptanceApplicationId }
  })
}

// ========== 项目开题材料审核记录相关API ==========

/**
 * 获得项目开题材料审核记录分页
 */
export const getProposalMaterialReviewPage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMaterialReviewRespVO>>({
    url: '/technological/acceptance-material-review/page',
    params
  })
}

/**
 * 获得项目开题材料审核记录详情
 */
export const getProposalMaterialReview = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMaterialReviewRespVO>>({
    url: '/technological/acceptance-material-review/get',
    params: { id }
  })
}

/**
 * 新增项目开题材料审核记录
 */
export const createProposalMaterialReview = (data: AcceptanceMaterialReviewSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/create',
    data
  })
}

/**
 * 修改项目开题材料审核记录
 */
export const updateProposalMaterialReview = (data: AcceptanceMaterialReviewSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-material-review/update',
    data
  })
}

/**
 * 删除项目开题材料审核记录
 */
export const deleteProposalMaterialReview = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-material-review/delete?id=${id}`
  })
}

// ========== 项目开题会议相关API ==========

/**
 * 获得项目开题会议分页
 */
export const getProposalMeetingPage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMeetingRespVO>>({
    url: '/technological/acceptance-meeting/page',
    params
  })
}

/**
 * 获得项目开题会议详情
 */
export const getProposalMeeting = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceMeetingRespVO>>({
    url: '/technological/acceptance-meeting/get',
    params: { id }
  })
}

/**
 * 新增项目开题会议
 */
export const createProposalMeeting = (data: AcceptanceMeetingSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting/create',
    data
  })
}

/**
 * 修改项目开题会议
 */
export const updateProposalMeeting = (data: AcceptanceMeetingSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting/update',
    data
  })
}

/**
 * 删除项目开题会议
 */
export const deleteProposalMeeting = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-meeting/delete?id=${id}`
  })
}

// ========== 项目开题会议参与人相关API ==========

/**
 * 获得项目开题会议参与人分页
 */
export const getProposalMeetingParticipantPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMeetingParticipantReqVO>>({
    url: '/technological/acceptance-meeting-participant/page',
    params
  })
}

/**
 * 新增项目开题会议参与人
 */
export const createProposalMeetingParticipant = (data: AcceptanceMeetingParticipantReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-participant/create',
    data
  })
}

/**
 * 修改项目开题会议参与人
 */
export const updateProposalMeetingParticipant = (data: AcceptanceMeetingParticipantReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-participant/update',
    data
  })
}

/**
 * 删除项目开题会议参与人
 */
export const deleteProposalMeetingParticipant = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-meeting-participant/delete?id=${id}`
  })
}

// ========== 项目开题会议材料相关API ==========

/**
 * 获得项目开题会议材料分页
 */
export const getProposalMeetingMaterialPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMeetingMaterialSaveReqVO>>({
    url: '/technological/acceptance-meeting-material/page',
    params
  })
}

/**
 * 新增项目开题会议材料
 */
export const createProposalMeetingMaterial = (data: AcceptanceMeetingMaterialSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-material/create',
    data
  })
}

/**
 * 修改项目开题会议材料
 */
export const updateProposalMeetingMaterial = (data: AcceptanceMeetingMaterialSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-material/update',
    data
  })
}

/**
 * 删除项目开题会议材料
 */
export const deleteProposalMeetingMaterial = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-meeting-material/delete?id=${id}`
  })
}

// ========== 项目开题验收结论相关API ==========

/**
 * 获得项目开题验收结论分页
 */
export const getProposalAcceptanceConclusionPage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceConclusionRespVO>>({
    url: '/technological/acceptance-acceptance-conclusion-review/page',
    params
  })
}

/**
 * 获得项目开题验收结论详情
 */
export const getProposalAcceptanceConclusion = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceConclusionRespVO>>({
    url: '/technological/acceptance-acceptance-conclusion-review/get',
    params: { id }
  })
}

/**
 * 新增项目开题验收结论
 */
export const createProposalAcceptanceConclusion = (data: AcceptanceConclusionSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-acceptance-conclusion-review/create',
    data
  })
}

/**
 * 修改项目开题验收结论
 */
export const updateProposalAcceptanceConclusion = (data: AcceptanceConclusionSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-acceptance-conclusion-review/update',
    data
  })
}

/**
 * 删除项目开题验收结论
 */
export const deleteProposalAcceptanceConclusion = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-acceptance-conclusion-review/delete?id=${id}`
  })
}

// ========== 项目开题整改记录相关API ==========

/**
 * 获得项目开题整改记录分页
 */
export const getProposalRectificationPage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceRectificationRespVO>>({
    url: '/technological/acceptance-rectification/page',
    params
  })
}

/**
 * 获得项目开题整改记录详情
 */
export const getProposalRectification = (id: number) => {
  return request.get<AcceptanceApiResponse<AcceptanceRectificationRespVO>>({
    url: '/technological/acceptance-rectification/get',
    params: { id }
  })
}

/**
 * 新增项目开题整改记录
 */
export const createProposalRectification = (data: AcceptanceRectificationSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-rectification/create',
    data
  })
}

/**
 * 修改项目开题整改记录
 */
export const updateProposalRectification = (data: AcceptanceRectificationSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-rectification/update',
    data
  })
}

/**
 * 删除项目开题整改记录
 */
export const deleteProposalRectification = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-rectification/delete?id=${id}`
  })
}

// ========== 项目开题项目时间线相关API ==========

/**
 * 获得项目开题项目时间线分页
 */
export const getProposalTimelinePage = (params: PageParam & { acceptanceApplicationId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceTimelineRespVO>>({
    url: '/technological/acceptance-timeline/page',
    params
  })
}

/**
 * 新增项目开题项目时间线
 */
export const createProposalTimeline = (data: AcceptanceTimelineSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-timeline/create',
    data
  })
}

/**
 * 修改项目开题项目时间线
 */
export const updateProposalTimeline = (data: AcceptanceTimelineSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-timeline/update',
    data
  })
}

/**
 * 删除项目开题项目时间线
 */
export const deleteProposalTimeline = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-timeline/delete?id=${id}`
  })
}

// ========== 项目开题结论文件相关API ==========

/**
 * 获得项目开题结论文件分页
 */
export const getProposalConclusionFilePage = (params: PageParam & { conclusionId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceConclusionFileRespVO>>({
    url: '/technological/acceptance-conclusion-file/page',
    params
  })
}

/**
 * 新增项目开题结论文件
 */
export const createProposalConclusionFile = (data: AcceptanceConclusionFileSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-conclusion-file/create',
    data
  })
}

/**
 * 修改项目开题结论文件
 */
export const updateProposalConclusionFile = (data: AcceptanceConclusionFileSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-conclusion-file/update',
    data
  })
}

/**
 * 删除项目开题结论文件
 */
export const deleteProposalConclusionFile = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-conclusion-file/delete?id=${id}`
  })
}

// ========== 项目开题会议提前提醒相关API ==========

/**
 * 获得项目开题会议提前提醒分页
 */
export const getProposalMeetingRemindPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<AcceptancePageResponse<AcceptanceMeetingRemindRespVO>>({
    url: '/technological/acceptance-meeting-remind/page',
    params
  })
}

/**
 * 新增项目开题会议提前提醒
 */
export const createProposalMeetingRemind = (data: AcceptanceMeetingRemindSaveReqVO) => {
  return request.post<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-remind/create',
    data
  })
}

/**
 * 修改项目开题会议提前提醒
 */
export const updateProposalMeetingRemind = (data: AcceptanceMeetingRemindSaveReqVO) => {
  return request.put<AcceptanceApiResponse<boolean>>({
    url: '/technological/acceptance-meeting-remind/update',
    data
  })
}

/**
 * 删除项目开题会议提前提醒
 */
export const deleteProposalMeetingRemind = (id: number) => {
  return request.delete<AcceptanceApiResponse<boolean>>({
    url: `/technological/acceptance-meeting-remind/delete?id=${id}`
  })
}

// ========== 项目基础信息相关API (用于项目选择) ==========

/**
 * 获得可选项目列表 (用于开题申请时的项目选择)
 */
export const getAvailableProjectsForAcceptance = (params: {
  pageNo?: number
  pageSize?: number
  projectStatus?: number[]
  keyword?: string
}) => {
  return request.get<AcceptancePageResponse<ProjectBasicInfoRespVO>>({
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
export const getProjectDetailForAcceptance = (projectId: number) => {
  return request.get<AcceptanceApiResponse<ProjectBasicInfoRespVO>>({
    url: '/technologicalproject/technological-project/get',
    params: { id: projectId }
  })
}

// ========== 验收命名导出别名（与页面联调保持一致） ==========

