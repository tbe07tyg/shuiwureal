import request from '@/config/axios'
import type {
  TechnologicalProjectRespVO,
  TechnologicalProjectSaveReqVO,
  TechnologicalProjectPageReqVO,
  TechnologicalProjectMaterialRespVO,
  TechnologicalProjectMaterialSaveReqVO,
  TechnologicalRectificationRespVO,
  TechnologicalRectificationSaveReqVO,
  TechnologicalProjectTimelineRespVO,
  TechnologicalProjectTimelineSaveReqVO,
  TechnologicalMeetingRespVO,
  TechnologicalMeetingSaveReqVO,
  TechnologicalMeetingParticipantRespVO,
  TechnologicalMeetingParticipantSaveReqVO,
  TechnologicalMeetingMaterialRespVO,
  TechnologicalMeetingMaterialSaveReqVO,
  TechnologicalMeetingRemindRespVO,
  TechnologicalMeetingRemindSaveReqVO,
  TechnologicalMaterialReviewRespVO,
  TechnologicalMaterialReviewSaveReqVO,
  TechnologicalConclusionFileRespVO,
  TechnologicalConclusionFileSaveReqVO,
  TechnologicalAcceptanceConclusionRespVO,
  TechnologicalAcceptanceConclusionSaveReqVO,
  ApprovalApiResponse,
  ApprovalPageResponse,
  PageParam
} from './types'

// ========== 项目立项申请相关API ==========

/**
 * 获得项目立项申请分页
 */
export const getTechnologicalProjectPage = (params: TechnologicalProjectPageReqVO) => {
  return request.get<ApprovalPageResponse<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/page',
    params
  })
}

/**
 * 获得项目立项申请详情
 */
export const getTechnologicalProject = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/get',
    params: { id }
  })
}


//获得项目立项申请统计
export const getTechnologicalProjectStats = () => {
  return request.get({
    url: '/technologicalproject/technological-project/getProjectStatistics'
  })
}

/**
 * 新增项目立项申请
 */
export const createTechnologicalProject = (data: TechnologicalProjectSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalproject/technological-project/create',
    data
  })
}

/**
 * 修改项目立项申请
 */
export const updateTechnologicalProject = (data: TechnologicalProjectSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalproject/technological-project/update',
    data
  })
}

/**
 * 删除项目立项申请
 */
export const deleteTechnologicalProject = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalproject/technological-project/delete?id=${id}`
  })
}

/**
 * 批量删除项目立项申请
 */
export const deleteTechnologicalProjectList = (ids: number[]) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: '/technologicalproject/technological-project/delete-list',
    data: ids
  })
}

/**
 * 导出项目立项申请 Excel
 */
export const exportTechnologicalProjectExcel = (params?: TechnologicalProjectPageReqVO) => {
  return request.download({
    url: '/technologicalproject/technological-project/export-excel',
    params
  })
}

// ========== 项目材料相关API ==========

/**
 * 获得项目材料分页
 */
export const getTechnologicalProjectMaterialPage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalProjectMaterialRespVO>>({
    url: '/technologicalprojectmaterial/technological-project-material/page',
    params
  })
}

/**
 * 获得项目材料详情
 */
export const getTechnologicalProjectMaterial = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalProjectMaterialRespVO>>({
    url: '/technologicalprojectmaterial/technological-project-material/get',
    params: { id }
  })
}

/**
 * 新增项目材料
 */
export const createTechnologicalProjectMaterial = (data: TechnologicalProjectMaterialSaveReqVO) => {
  return request.post<ApprovalApiResponse<number>>({
    url: '/technologicalprojectmaterial/technological-project-material/create',
    data
  })
}

/**
 * 修改项目材料
 */
export const updateTechnologicalProjectMaterial = (data: TechnologicalProjectMaterialSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalprojectmaterial/technological-project-material/update',
    data
  })
}

/**
 * 删除项目材料
 */
export const deleteTechnologicalProjectMaterial = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalprojectmaterial/technological-project-material/delete?id=${id}`
  })
}

export const deleteTechnologicalProjectMaterialList = (ids) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: '/technologicalprojectmaterial/technological-project-material/delete-list',
    params: { ids }
  })
}

// ========== 整改记录相关API ==========

/**
 * 获得整改记录分页
 */
export const getTechnologicalRectificationPage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalRectificationRespVO>>({
    url: '/technologicalrectification/technological-rectification/page',
    params
  })
}

/**
 * 获得整改记录详情
 */
export const getTechnologicalRectification = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalRectificationRespVO>>({
    url: '/technologicalrectification/technological-rectification/get',
    params: { id }
  })
}

/**
 * 新增整改记录
 */
export const createTechnologicalRectification = (data: TechnologicalRectificationSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalrectification/technological-rectification/create',
    data
  })
}

/**
 * 修改整改记录
 */
export const updateTechnologicalRectification = (data: TechnologicalRectificationSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalrectification/technological-rectification/update',
    data
  })
}

/**
 * 删除整改记录
 */
export const deleteTechnologicalRectification = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalrectification/technological-rectification/delete?id=${id}`
  })
}

// ========== 项目时间线相关API ==========

/**
 * 获得项目时间线分页
 */
export const getTechnologicalProjectTimelinePage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalProjectTimelineRespVO>>({
    url: '/technologicalprojecttimeline/technological-project-timeline/page',
    params
  })
}

/**
 * 获得项目时间线详情
 */
export const getTechnologicalProjectTimeline = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalProjectTimelineRespVO>>({
    url: '/technologicalprojecttimeline/technological-project-timeline/get',
    params: { id }
  })
}

/**
 * 新增项目时间线记录
 */
export const createTechnologicalProjectTimeline = (data: TechnologicalProjectTimelineSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalprojecttimeline/technological-project-timeline/create',
    data
  })
}

/**
 * 修改项目时间线记录
 */
export const updateTechnologicalProjectTimeline = (data: TechnologicalProjectTimelineSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalprojecttimeline/technological-project-timeline/update',
    data
  })
}

/**
 * 删除项目时间线记录
 */
export const deleteTechnologicalProjectTimeline = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalprojecttimeline/technological-project-timeline/delete?id=${id}`
  })
}

// ========== 会议相关API ==========

/**
 * 获得会议分页
 */
export const getTechnologicalMeetingPage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalMeetingRespVO>>({
    url: '/technologicalmeeting/technological-meeting/page',
    params
  })
}

/**
 * 获得会议详情
 */
export const getTechnologicalMeeting = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalMeetingRespVO>>({
    url: '/technologicalmeeting/technological-meeting/get',
    params: { id }
  })
}

/**
 * 新增会议
 */
export const createTechnologicalMeeting = (data: TechnologicalMeetingSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeeting/technological-meeting/create',
    data
  })
}

/**
 * 修改会议
 */
export const updateTechnologicalMeeting = (data: TechnologicalMeetingSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeeting/technological-meeting/update',
    data
  })
}

/**
 * 删除会议
 */
export const deleteTechnologicalMeeting = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalmeeting/technological-meeting/delete?id=${id}`
  })
}

// ========== 会议参与人相关API ==========

/**
 * 获得会议参与人分页
 */
export const getTechnologicalMeetingParticipantPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalMeetingParticipantRespVO>>({
    url: '/technologicalmeetingparticipant/technological-meeting-participant/page',
    params
  })
}

/**
 * 获得会议参与人详情
 */
export const getTechnologicalMeetingParticipant = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalMeetingParticipantRespVO>>({
    url: '/technologicalmeetingparticipant/technological-meeting-participant/get',
    params: { id }
  })
}

/**
 * 新增会议参与人
 */
export const createTechnologicalMeetingParticipant = (data: TechnologicalMeetingParticipantSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingparticipant/technological-meeting-participant/create',
    data
  })
}

/**
 * 修改会议参与人
 */
export const updateTechnologicalMeetingParticipant = (data: TechnologicalMeetingParticipantSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingparticipant/technological-meeting-participant/update',
    data
  })
}

/**
 * 删除会议参与人
 */
export const deleteTechnologicalMeetingParticipant = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalmeetingparticipant/technological-meeting-participant/delete?id=${id}`
  })
}

// ========== 会议资料相关API ==========

/**
 * 获得会议资料分页
 */
export const getTechnologicalMeetingMaterialPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalMeetingMaterialRespVO>>({
    url: '/technologicalmeetingmaterial/technological-meeting-material/page',
    params
  })
}

/**
 * 获得会议资料详情
 */
export const getTechnologicalMeetingMaterial = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalMeetingMaterialRespVO>>({
    url: '/technologicalmeetingmaterial/technological-meeting-material/get',
    params: { id }
  })
}

/**
 * 新增会议资料
 */
export const createTechnologicalMeetingMaterial = (data: TechnologicalMeetingMaterialSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingmaterial/technological-meeting-material/create',
    data
  })
}

/**
 * 修改会议资料
 */
export const updateTechnologicalMeetingMaterial = (data: TechnologicalMeetingMaterialSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingmaterial/technological-meeting-material/update',
    data
  })
}

/**
 * 删除会议资料
 */
export const deleteTechnologicalMeetingMaterial = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalmeetingmaterial/technological-meeting-material/delete?id=${id}`
  })
}

// ========== 会议提前提醒相关API ==========

/**
 * 获得会议提前提醒分页
 */
export const getTechnologicalMeetingRemindPage = (params: PageParam & { meetingId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalMeetingRemindRespVO>>({
    url: '/technologicalmeetingremind/technological-meeting-remind/page',
    params
  })
}

/**
 * 获得会议提前提醒详情
 */
export const getTechnologicalMeetingRemind = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalMeetingRemindRespVO>>({
    url: '/technologicalmeetingremind/technological-meeting-remind/get',
    params: { id }
  })
}

/**
 * 新增会议提前提醒
 */
export const createTechnologicalMeetingRemind = (data: TechnologicalMeetingRemindSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingremind/technological-meeting-remind/create',
    data
  })
}

/**
 * 修改会议提前提醒
 */
export const updateTechnologicalMeetingRemind = (data: TechnologicalMeetingRemindSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalmeetingremind/technological-meeting-remind/update',
    data
  })
}

/**
 * 删除会议提前提醒
 */
export const deleteTechnologicalMeetingRemind = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalmeetingremind/technological-meeting-remind/delete?id=${id}`
  })
}

// ========== 材料审核记录相关API ==========

/**
 * 获得材料审核记录分页
 */
export const getTechnologicalMaterialReviewPage = (params: PageParam & { projectId?: number; materialId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalMaterialReviewRespVO>>({
    url: '/technologicalmaterialreview/technological-material-review/page',
    params
  })
}

/**
 * 获得材料审核记录详情
 */
export const getTechnologicalMaterialReview = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalMaterialReviewRespVO>>({
    url: '/technologicalmaterialreview/technological-material-review/get',
    params: { id }
  })
}

/**
 * 新增材料审核记录
 */
export const createTechnologicalMaterialReview = (data: TechnologicalMaterialReviewSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalmaterialreview/technological-material-review/create',
    data
  })
}

/**
 * 修改材料审核记录
 */
export const updateTechnologicalMaterialReview = (data: TechnologicalMaterialReviewSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalmaterialreview/technological-material-review/update',
    data
  })
}

/**
 * 删除材料审核记录
 */
export const deleteTechnologicalMaterialReview = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalmaterialreview/technological-material-review/delete?id=${id}`
  })
}

// ========== 结论文件相关API ==========

/**
 * 获得结论文件分页
 */
export const getTechnologicalConclusionFilePage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalConclusionFileRespVO>>({
    url: '/technologicalconclusionfile/technological-conclusion-file/page',
    params
  })
}

/**
 * 获得结论文件详情
 */
export const getTechnologicalConclusionFile = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalConclusionFileRespVO>>({
    url: '/technologicalconclusionfile/technological-conclusion-file/get',
    params: { id }
  })
}

/**
 * 新增结论文件
 */
export const createTechnologicalConclusionFile = (data: TechnologicalConclusionFileSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalconclusionfile/technological-conclusion-file/create',
    data
  })
}

/**
 * 修改结论文件
 */
export const updateTechnologicalConclusionFile = (data: TechnologicalConclusionFileSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalconclusionfile/technological-conclusion-file/update',
    data
  })
}

/**
 * 删除结论文件
 */
export const deleteTechnologicalConclusionFile = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalconclusionfile/technological-conclusion-file/delete?id=${id}`
  })
}

// ========== 验收结论相关API ==========

/**
 * 获得验收结论分页
 */
export const getTechnologicalAcceptanceConclusionPage = (params: PageParam & { projectId?: number }) => {
  return request.get<ApprovalPageResponse<TechnologicalAcceptanceConclusionRespVO>>({
    url: '/technologicalacceptanceconclusion/technological-acceptance-conclusion/page',
    params
  })
}

/**
 * 获得验收结论详情
 */
export const getTechnologicalAcceptanceConclusion = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalAcceptanceConclusionRespVO>>({
    url: '/technologicalacceptanceconclusion/technological-acceptance-conclusion/get',
    params: { id }
  })
}

/**
 * 新增验收结论
 */
export const createTechnologicalAcceptanceConclusion = (data: TechnologicalAcceptanceConclusionSaveReqVO) => {
  return request.post<ApprovalApiResponse<boolean>>({
    url: '/technologicalacceptanceconclusion/technological-acceptance-conclusion/create',
    data
  })
}

/**
 * 修改验收结论
 */
export const updateTechnologicalAcceptanceConclusion = (data: TechnologicalAcceptanceConclusionSaveReqVO) => {
  return request.put<ApprovalApiResponse<boolean>>({
    url: '/technologicalacceptanceconclusion/technological-acceptance-conclusion/update',
    data
  })
}

/**
 * 删除验收结论
 */
export const deleteTechnologicalAcceptanceConclusion = (id: number) => {
  return request.delete<ApprovalApiResponse<boolean>>({
    url: `/technologicalacceptanceconclusion/technological-acceptance-conclusion/delete?id=${id}`
  })
}

// ========== 业务逻辑封装API ==========

/**
 * 提交项目立项申请 (将状态改为材料审核中)
 */
export const submitTechnologicalProject = (id: number) => {
  return updateTechnologicalProject({
    id,
    status: 1, // 材料审核中
    materialReviewResult: 0,
    projectNo: '', // 这些必填字段在实际使用时需要从详情接口获取
    projectName: '',
    yearly: new Date().getFullYear(),
    applicant: '',
    applicantUnit: '',
    projectCycle: 12,
    budget: 0
  })
}

/**
 * 审核通过项目材料
 */
export const approveProjectMaterial = (id: number, reviewComments: string,projectNo:string,projectName:string,applicant:string,applicantUnit:string,projectCycle:number,budget:number) => {
  return updateTechnologicalProject({
    id,
    status: 3, // 会议待组织
    materialReviewResult: 0, // 通过
    reviewComments,
    projectNo, // 这些必填字段在实际使用时需要从详情接口获取
    projectName,
    yearly: new Date().getFullYear(),
    applicant,
    applicantUnit,
    projectCycle,
    budget
  })
}

/**
 * 驳回项目材料
 */
export const rejectProjectMaterial = (id: number, reviewComments: string, failedReason: string,projectNo:string,projectName:string,applicant:string,applicantUnit:string,projectCycle:number,budget:number) => {
  return updateTechnologicalProject({
    id,
    status: 2, // 材料驳回
    materialReviewResult: 0, // 驳回
    reviewComments,
    failedReason,
    projectNo, // 这些必填字段在实际使用时需要从详情接口获取
    projectName,
    yearly: new Date().getFullYear(),
    applicant,
    applicantUnit,
    projectCycle,
    budget
  })
}

/**
 * 项目立项通过
 */
export const approveProject = (id: number, reviewComments: string,projectNo:string,projectName:string,applicant:string,applicantUnit:string,projectCycle:number,budget:number) => {
  return updateTechnologicalProject({
    id,
    status: 8, // 立项通过
    materialReviewResult: 1,
    reviewComments,
    projectNo, // 这些必填字段在实际使用时需要从详情接口获取
    projectName,
    yearly: new Date().getFullYear(),
    applicant,
    applicantUnit,
    projectCycle,
    budget
  })
}

/**
 * 项目立项未通过
 */
export const rejectProject = (id: number, reviewComments: string, failedReason: string,projectNo:string,projectName:string,applicant:string,applicantUnit:string,projectCycle:number,budget:number) => {
  return updateTechnologicalProject({
    id,
    status: 9, // 立项未通过
    materialReviewResult: 2,
    reviewComments,
    failedReason,
    projectNo, // 这些必填字段在实际使用时需要从详情接口获取
    projectName,
    yearly: new Date().getFullYear(),
    applicant,
    applicantUnit,
    projectCycle,
    budget
  })
}