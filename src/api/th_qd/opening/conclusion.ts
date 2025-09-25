import request from '@/config/axios/index'
import type {
  ProposalMeetingParticipantPageReqVO,
  ProposalMeetingParticipantRewriteSaveReqVO,
  ProposalMeetingParticipantRewriteRespVO,
  ProposalMeetingMaterialPageReqVO,
  ProposalMeetingMaterialRewriteSaveReqVO,
  ProposalMeetingMaterialRewriteRespVO,
  ProposalConclusionFilePageReqVO,
  ProposalConclusionFileRewriteSaveReqVO,
  ProposalConclusionFileRewriteRespVO,
  PageResult
} from './types'

// ========== 项目开题会议参与人管理API ==========

/**
 * 创建开题会议参与人（会议结论管理专用）
 * @param data 参与人信息
 */
export function createMeetingParticipantForConclusion(data: ProposalMeetingParticipantRewriteSaveReqVO) {
  return request.post<number>({
    url: '/technological/proposal-meeting-participant-rewrite/create',
    data
  })
}

/**
 * 更新开题会议参与人（会议结论管理专用）
 * @param data 参与人信息
 */
export function updateMeetingParticipantForConclusion(data: ProposalMeetingParticipantRewriteSaveReqVO) {
  return request.put<boolean>({
    url: '/technological/proposal-meeting-participant-rewrite/update',
    data
  })
}

/**
 * 删除开题会议参与人（会议结论管理专用）
 * @param id 参与人ID
 */
export function deleteMeetingParticipantForConclusion(id: number) {
  return request.delete<boolean>({
    url: `/technological/proposal-meeting-participant-rewrite/delete?id=${id}`
  })
}

/**
 * 批量删除开题会议参与人（会议结论管理专用）
 * @param ids 参与人ID数组
 */
export function batchDeleteMeetingParticipantForConclusion(ids: number[]) {
  return request.delete<boolean>({
    url: '/technological/proposal-meeting-participant-rewrite/batch-delete',
    data: { ids }
  })
}

/**
 * 分页查询开题会议参与人（会议结论管理专用）
 * @param params 查询参数
 */
export function getMeetingParticipantPageForConclusion(params: ProposalMeetingParticipantPageReqVO) {
  return request.get<PageResult<ProposalMeetingParticipantRewriteRespVO>>({
    url: '/technological/proposal-meeting-participant-rewrite/page',
    params
  })
}

/**
 * 获取开题会议参与人详情（会议结论管理专用）
 * @param id 参与人ID
 */
export function getMeetingParticipantForConclusion(id: number) {
  return request.get<ProposalMeetingParticipantRewriteRespVO>({
    url: `/technological/proposal-meeting-participant-rewrite/get?id=${id}`
  })
}

// ========== 项目开题会议材料管理API ==========

/**
 * 创建开题会议材料（会议结论管理专用）
 * @param data 材料信息
 */
export function createMeetingMaterialForConclusion(data: ProposalMeetingMaterialRewriteSaveReqVO) {
  return request.post<number>({
    url: '/technological/proposal-meeting-material-rewrite/create',
    data
  })
}

// ========== 开题验收结论管理API（重写版本） ==========

/**
 * 创建开题验收结论（重写版本）
 */
export function createProposalAcceptanceConclusionRewrite(data: any) {
  return request.post<number>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/create',
    data
  })
}

/**
 * 更新开题验收结论（重写版本）
 */
export function updateProposalAcceptanceConclusionRewrite(data: any) {
  return request.put<boolean>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/update',
    data
  })
}

/**
 * 获得开题验收结论分页（重写版本）
 */
export function getProposalAcceptanceConclusionRewritePage(params: any) {
  return request.get<any>({
    url: '/technological/proposal-acceptance-conclusion-rewrite/page',
    params
  })
}

/**
 * 获得开题验收结论详情（重写版本）
 */
export function getProposalAcceptanceConclusionRewrite(id: number) {
  return request.get<any>({
    url: `/technological/proposal-acceptance-conclusion-rewrite/get?id=${id}`,
    params: { id }
  })
}

/**
 * 删除开题验收结论（重写版本）
 */
export function deleteProposalAcceptanceConclusionRewrite(id: number) {
  return request.delete<boolean>({
    url: `/technological/proposal-acceptance-conclusion-rewrite/delete?id=${id}`,
    params: { id }
  })
}

// ========== 开题结论文件管理API（重写版本） ==========

/**
 * 创建开题结论文件（重写版本）
 */
export function createProposalConclusionFileRewrite(data: any) {
  return request.post<number>({
    url: '/technological/proposal-conclusion-file-rewrite/create',
    data
  })
}

/**
 * 更新开题结论文件（重写版本）
 */
export function updateProposalConclusionFileRewrite(data: any) {
  return request.put<boolean>({
    url: '/technological/proposal-conclusion-file-rewrite/update',
    data
  })
}

/**
 * 获得开题结论文件详情（重写版本）
 */
export function getProposalConclusionFileRewrite(id: number) {
  return request.get<any>({
    url: `/technological/proposal-conclusion-file-rewrite/get?id=${id}`,
    params: { id }
  })
}

/**
 * 获得开题结论文件分页（重写版本）
 */
export function getProposalConclusionFileRewritePage(params: any) {
  return request.get<any>({
    url: '/technological/proposal-conclusion-file-rewrite/page',
    params
  })
}

/**
 * 删除开题结论文件（重写版本）
 */
export function deleteProposalConclusionFileRewrite(id: number) {
  return request.delete<boolean>({
    url: `/technological/proposal-conclusion-file-rewrite/delete?id=${id}`,
    params: { id }
  })
}

/**
 * 更新开题会议材料（会议结论管理专用）
 * @param data 材料信息
 */
export function updateMeetingMaterialForConclusion(data: ProposalMeetingMaterialRewriteSaveReqVO) {
  return request.put<boolean>({
    url: '/technological/proposal-meeting-material-rewrite/update',
    data
  })
}

/**
 * 删除开题会议材料（会议结论管理专用）
 * @param id 材料ID
 */
export function deleteMeetingMaterialForConclusion(id: number) {
  return request.delete<boolean>({
    url: `/technological/proposal-meeting-material-rewrite/delete?id=${id}`
  })
}

/**
 * 批量删除开题会议材料（会议结论管理专用）
 * @param ids 材料ID数组
 */
export function batchDeleteMeetingMaterialForConclusion(ids: number[]) {
  return request.delete<boolean>({
    url: '/technological/proposal-meeting-material-rewrite/batch-delete',
    data: { ids }
  })
}

/**
 * 分页查询开题会议材料（会议结论管理专用）
 * @param params 查询参数
 */
export function getMeetingMaterialPageForConclusion(params: ProposalMeetingMaterialPageReqVO) {
  return request.get<PageResult<ProposalMeetingMaterialRewriteRespVO>>({
    url: '/technological/proposal-meeting-material-rewrite/page',
    params
  })
}

/**
 * 获取开题会议材料详情（会议结论管理专用）
 * @param id 材料ID
 */
export function getMeetingMaterialForConclusion(id: number) {
  return request.get<ProposalMeetingMaterialRewriteRespVO>({
    url: `/technological/proposal-meeting-material-rewrite/get?id=${id}`
  })
}

// ========== 项目开题结论文件管理API ==========

/**
 * 创建开题结论文件（会议结论管理专用）
 * @param data 文件信息
 */
export function createConclusionFileForConclusion(data: ProposalConclusionFileRewriteSaveReqVO) {
  return request.post<number>({
    url: '/technological/proposal-conclusion-file-rewrite/create',
    data
  })
}

/**
 * 更新开题结论文件（会议结论管理专用）
 * @param data 文件信息
 */
export function updateConclusionFileForConclusion(data: ProposalConclusionFileRewriteSaveReqVO) {
  return request.put<boolean>({
    url: '/technological/proposal-conclusion-file-rewrite/update',
    data
  })
}

/**
 * 删除开题结论文件（会议结论管理专用）
 * @param id 文件ID
 */
export function deleteConclusionFileForConclusion(id: number) {
  return request.delete<boolean>({
    url: `/technological/proposal-conclusion-file-rewrite/delete?id=${id}`
  })
}

/**
 * 批量删除开题结论文件（会议结论管理专用）
 * @param ids 文件ID数组
 */
export function batchDeleteConclusionFileForConclusion(ids: number[]) {
  return request.delete<boolean>({
    url: '/technological/proposal-conclusion-file-rewrite/batch-delete',
    data: { ids }
  })
}

/**
 * 分页查询开题结论文件（会议结论管理专用）
 * @param params 查询参数
 */
export function getConclusionFilePageForConclusion(params: ProposalConclusionFilePageReqVO) {
  return request.get<PageResult<ProposalConclusionFileRewriteRespVO>>({
    url: '/technological/proposal-conclusion-file-rewrite/page',
    params
  })
}

/**
 * 获取开题结论文件详情（会议结论管理专用）
 * @param id 文件ID
 */
export function getConclusionFileForConclusion(id: number) {
  return request.get<ProposalConclusionFileRewriteRespVO>({
    url: `/technological/proposal-conclusion-file-rewrite/get?id=${id}`
  })
}

// ========== 导出所有API函数 ==========

export const conclusionApi = {
  // 会议参与人管理（会议结论管理专用）
  createMeetingParticipantForConclusion,
  updateMeetingParticipantForConclusion,
  deleteMeetingParticipantForConclusion,
  batchDeleteMeetingParticipantForConclusion,
  getMeetingParticipantPageForConclusion,
  getMeetingParticipantForConclusion,
  
  // 会议材料管理（会议结论管理专用）
  createMeetingMaterialForConclusion,
  updateMeetingMaterialForConclusion,
  deleteMeetingMaterialForConclusion,
  batchDeleteMeetingMaterialForConclusion,
  getMeetingMaterialPageForConclusion,
  getMeetingMaterialForConclusion,
  
  // 结论文件管理（会议结论管理专用）
  createConclusionFileForConclusion,
  updateConclusionFileForConclusion,
  deleteConclusionFileForConclusion,
  batchDeleteConclusionFileForConclusion,
  getConclusionFilePageForConclusion,
  getConclusionFileForConclusion,
  
  // 开题验收结论管理（重写版本）
  createProposalAcceptanceConclusionRewrite,
  updateProposalAcceptanceConclusionRewrite,
  getProposalAcceptanceConclusionRewritePage,
  getProposalAcceptanceConclusionRewrite,
  deleteProposalAcceptanceConclusionRewrite,
  
  // 开题结论文件管理（重写版本）
  createProposalConclusionFileRewrite,
  updateProposalConclusionFileRewrite,
  getProposalConclusionFileRewrite,
  getProposalConclusionFileRewritePage,
  deleteProposalConclusionFileRewrite
}
