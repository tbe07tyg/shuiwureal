/**
 * 项目成果 API 类型定义 (严格按 all.md)
 */

// ========== 基础通用类型 ==========

export interface CommonResult<T = any> {
  code: number
  data: T
  msg: string
}

export interface PageParam {
  pageNo: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// ========== 项目成果文件 ==========

/** ProjectAchievementFileRespVO */
export interface ProjectAchievementFileRespVO {
  id: number
  achievementId: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileSuffix: string
  sort: number
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
  deleted?: boolean
}

/** ProjectAchievementFileSaveReqVO (新增/修改) */
export interface ProjectAchievementFileSaveReqVO {
  id?: number
  achievementId?: number
  fileName?: string
  fileUrl?: string
  fileSize?: number
  fileSuffix?: string
  sort?: number
}

export type ProjectAchievementFilePageReqVO = PageParam & {
  achievementId?: string
  fileName?: string
  fileUrl?: string
  fileSize?: string
  fileSuffix?: string
  sort?: string
  createTime?: string
}

// ========== 项目成果 ==========

/** ProjectAchievementRespVO */
export interface ProjectAchievementRespVO {
  id: number
  projectId: number
  achievementName: string
  achievementType: number // 0论文 1知识产权 2应用 3平台建设 4其它
  completionTime?: string
  achievementDescription?: string
  journalName?: string
  yearPublication?: string
  impactFactor?: string
  intellectualPropertyType?: number // 0发明专利 1使用新型 2外观设计 3软件著作权
  applicationNumber?: string
  authorizationStatus?: number // 0已授权 1审查中 2已申请
  applicationField?: string
  applicationScale?: string
  economicBenefits?: string
  platformType?: string
  serviceTarget?: string
  userScale?: string
  categoryAchievements?: string
  appliedValue?: string
  createTime?: string
  projectAchievementFileDO?: ProjectAchievementFileRespVO[]
}

/** ProjectAchievementSaveReqVO (新增/修改) */
export interface ProjectAchievementSaveReqVO {
  id?: number
  projectId?: number
  achievementName?: string
  achievementType?: number
  completionTime?: string
  achievementDescription?: string
  journalName?: string
  yearPublication?: string
  impactFactor?: string
  intellectualPropertyType?: number
  applicationNumber?: string
  authorizationStatus?: number
  applicationField?: string
  applicationScale?: string
  economicBenefits?: string
  platformType?: string
  serviceTarget?: string
  userScale?: string
  categoryAchievements?: string
  appliedValue?: string
  projectAchievementFileDO?: ProjectAchievementFileRespVO[]
}

/** 分页查询参数 */
export type ProjectAchievementPageReqVO = PageParam & {
  projectId?: string
  achievementName?: string
  achievementType?: string
  completionTime?: string
  achievementDescription?: string
  journalName?: string
  yearPublication?: string
  impactFactor?: string
  intellectualPropertyType?: string
  applicationNumber?: string
  authorizationStatus?: string
  applicationField?: string
  applicationScale?: string
  economicBenefits?: string
  platformType?: string
  serviceTarget?: string
  userScale?: string
  categoryAchievements?: string
  appliedValue?: string
  createTime?: string
  projectAchievementFileDO?: string
}

// ========== API 响应类型 ==========

export type ApiResponse<T = any> = CommonResult<T>

export type GetProjectAchievementResponse = ApiResponse<ProjectAchievementRespVO>
export type GetProjectAchievementPageResponse = ApiResponse<PageResult<ProjectAchievementRespVO>>
export type CreateProjectAchievementResponse = ApiResponse<number>
export type UpdateProjectAchievementResponse = ApiResponse<boolean>
export type DeleteProjectAchievementResponse = ApiResponse<boolean>

export type GetProjectAchievementFilePageResponse = ApiResponse<PageResult<ProjectAchievementFileRespVO>>
export type GetProjectAchievementFileResponse = ApiResponse<ProjectAchievementFileRespVO>
export type CreateProjectAchievementFileResponse = ApiResponse<number>
export type UpdateProjectAchievementFileResponse = ApiResponse<boolean>
export type DeleteProjectAchievementFileResponse = ApiResponse<boolean>


