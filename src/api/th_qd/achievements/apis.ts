import request from '@/config/axios'
import type {
  ApiResponse,
  PageResult,
  ProjectAchievementRespVO,
  ProjectAchievementSaveReqVO,
  ProjectAchievementPageReqVO,
  ProjectAchievementFileRespVO,
  ProjectAchievementFileSaveReqVO,
  ProjectAchievementFilePageReqVO
} from './types'

// ========== 管理后台 - [成果管理]项目成果 ==========

/** 获得项目成果分页 */
export const getProjectAchievementPage = (params: ProjectAchievementPageReqVO) => {
  return request.get<PageResult<ProjectAchievementRespVO>>({
    url: '/technological/project-achievement/page',
    params
  })
}

/** 获得项目成果 */
export const getProjectAchievement = (id: number) => {
  return request.get<ApiResponse<ProjectAchievementRespVO>>({
    url: '/technological/project-achievement/get',
    params: { id }
  })
}

/** 创建项目成果（创建不需要传文件中的成果ID） */
export const createProjectAchievement = (data: ProjectAchievementSaveReqVO) => {
  return request.post<ApiResponse<number>>({
    url: '/technological/project-achievement/create',
    data
  })
}

/** 更新项目成果 */
export const updateProjectAchievement = (data: ProjectAchievementSaveReqVO) => {
  return request.put<ApiResponse<boolean>>({
    url: '/technological/project-achievement/update',
    data
  })
}

/** 删除项目成果 */
export const deleteProjectAchievement = (id: number) => {
  return request.delete<ApiResponse<boolean>>({
    url: `/technological/project-achievement/delete?id=${id}`
  })
}

/** 批量删除项目成果 */
export const deleteProjectAchievementList = (ids: number[]) => {
  return request.delete<ApiResponse<boolean>>({
    url: '/technological/project-achievement/delete-list',
    params: { ids }
  })
}

/** 导出项目成果 Excel */
export const exportProjectAchievementExcel = (params?: ProjectAchievementPageReqVO) => {
  return request.download({
    url: '/technological/project-achievement/export-excel',
    params
  })
}

/** 获得项目成果统计 */
export const getProjectAchievementStatistics = () => {
  return request.get<ApiResponse<Record<string, any>>>({
    url: '/technological/project-achievement/achievementStatistics'
  })
}

// ========== 管理后台 - [成果管理]项目成果上传的文件 ==========

/** 获得项目成果上传的文件分页 */
export const getProjectAchievementFilePage = (params: ProjectAchievementFilePageReqVO) => {
  return request.get<ApiResponse<PageResult<ProjectAchievementFileRespVO>>>({
    url: '/technological/project-achievement-file/page',
    params
  })
}

/** 获得项目成果上传的文件 */
export const getProjectAchievementFile = (id: number) => {
  return request.get<ApiResponse<ProjectAchievementFileRespVO>>({
    url: '/technological/project-achievement-file/get',
    params: { id }
  })
}

/** 创建项目成果上传的文件 */
export const createProjectAchievementFile = (data: ProjectAchievementFileSaveReqVO) => {
  return request.post<ApiResponse<number>>({
    url: '/technological/project-achievement-file/create',
    data
  })
}

/** 更新项目成果上传的文件 */
export const updateProjectAchievementFile = (data: ProjectAchievementFileSaveReqVO) => {
  return request.put<ApiResponse<boolean>>({
    url: '/technological/project-achievement-file/update',
    data
  })
}

/** 删除项目成果上传的文件 */
export const deleteProjectAchievementFile = (id: number) => {
  return request.delete<ApiResponse<boolean>>({
    url: `/technological/project-achievement-file/delete?id=${id}`
  })
}

/** 批量删除项目成果上传的文件 */
export const deleteProjectAchievementFileList = (ids: number[]) => {
  return request.delete<ApiResponse<boolean>>({
    url: '/technological/project-achievement-file/delete-list',
    params: { ids }
  })
}

/** 导出项目成果上传的文件 Excel */
export const exportProjectAchievementFileExcel = (params?: ProjectAchievementFilePageReqVO) => {
  return request.download({
    url: '/technological/project-achievement-file/export-excel',
    params
  })
}


