// 项目立项相关类型定义
// 对应后端 [项目立项] 模块的所有数据结构

// ========== 通用类型 ==========
export interface CommonResult<T = any> {
  code: number
  data: T
  msg: string
}

export interface PageResult<T = any> {
  list: T[]
  total: number
}

export interface PageParam {
  pageNo: number
  pageSize: number
}

// ========== 项目立项申请相关类型 ==========

// 项目状态枚举
export enum ProjectStatus {
  DRAFT = 0,                    // 草稿
  MATERIAL_REVIEWING = 1,       // 材料审核中
  MATERIAL_REJECTED = 2,        // 材料驳回
  MEETING_PENDING = 3,          // 会议待组织
  MEETING_SCHEDULED = 4,        // 会议已安排
  MEETING_IN_PROGRESS = 5,      // 会议进行中
  CONDITIONALLY_PASSED = 6,     // 有条件通过
  RECTIFYING = 7,               // 整改中
  PROJECT_APPROVED = 8,         // 立项通过
  PROJECT_REJECTED = 9          // 立项未通过
}

// 材料审核结果枚举
export enum MaterialReviewResult {
  PENDING = 0,     // 待处理
  PASSED = 1,      // 通过
  REJECTED = 2     // 驳回
}

// 项目立项申请 Response VO
export interface TechnologicalProjectRespVO {
  id: number                                    // 主键ID
  projectNo: string                            // 项目编号
  projectName: string                          // 立项名称
  yearly: number                               // 年度(如2024,2025)
  applicant: string                            // 申请人
  applicantUnit: string                        // 申请单位
  projectCycle: number                         // 项目周期(月)
  budget: number                               // 预算(万元)
  expectedProjectTime?: string                 // 预期立项时间
  applicationDescription?: string              // 申请说明
  technicalApproach?: string                   // 技术方案描述
  riskAnalysis?: string                        // 风险分析与应对
  remark?: string                              // 备注说明
  status: ProjectStatus                        // 项目状态
  materialReviewResult?: MaterialReviewResult  // 材料整体审核结论
  failedReason?: string                        // 不通过原因
  reviewComments?: string                      // 审核意见
  createTime: string                           // 创建时间
}

// 项目立项申请 Request VO (新增/修改)
export interface TechnologicalProjectSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectNo: string                            // 项目编号
  projectName: string                          // 立项名称
  yearly: number                               // 年度(如2024,2025)
  applicant: string                            // 申请人
  applicantUnit: string                        // 申请单位
  projectCycle: number                         // 项目周期(月)
  budget: number                               // 预算(万元)
  expectedProjectTime?: string                 // 预期立项时间
  applicationDescription?: string              // 申请说明
  technicalApproach?: string                   // 技术方案描述
  riskAnalysis?: string                        // 风险分析与应对
  remark?: string                              // 备注说明
  status: ProjectStatus                        // 项目状态
  materialReviewResult?: MaterialReviewResult  // 材料整体审核结论
  failedReason?: string                        // 不通过原因
  reviewComments?: string                      // 审核意见
  technologicalProjectMaterialDOList?: TechnologicalProjectMaterialDO[]  // 项目申请材料列表
}

// 项目立项申请查询 VO
export interface TechnologicalProjectPageReqVO extends PageParam {
  projectNo?: string                           // 项目编号
  projectName?: string                         // 立项名称
  yearly?: string                              // 年度(如2024,2025)
  applicant?: string                           // 申请人
  applicantUnit?: string                       // 申请单位
  projectCycle?: string                        // 项目周期(月)
  budget?: string                              // 预算(万元)
  expectedProjectTime?: string                 // 预期立项时间
  applicationDescription?: string              // 申请说明
  technicalApproach?: string                   // 技术方案描述
  riskAnalysis?: string                        // 风险分析与应对
  remark?: string                              // 备注说明
  status?: number                              // 项目状态
  materialReviewResult?: number                // 材料整体审核结论
  failedReason?: string                        // 不通过原因
  reviewComments?: string                      // 审核意见
  createTime?: string                          // 创建时间
}

// 项目申请材料
export interface TechnologicalProjectMaterialDO {
  id?: number                                  // 主键ID
  projectId?: number                           // 项目ID
  materialName?: string                        // 材料名称
  materialPath?: string                        // 材料路径
  materialType?: string                        // 材料类型
  uploadTime?: string                          // 上传时间
  uploader?: string                            // 上传人
}

// 项目材料保存请求 VO
export interface TechnologicalProjectMaterialSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  materialType: string                         // 材料类型
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize: number                             // 文件大小(字节)
  fileSuffix: string                           // 文件后缀
  isRequired: number                           // 是否必需(0=否,1=是)
  reviewStatus?: number                        // 审核状态(0=待处理,1=通过,2=驳回)
  reviewComments?: string                      // 审核意见
  sort?: number                                // 排序
}

// 项目材料响应 VO
export interface TechnologicalProjectMaterialRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  materialType: string                         // 材料类型
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize: number                             // 文件大小(字节)
  fileSuffix: string                           // 文件后缀
  isRequired: number                           // 是否必需(0=否,1=是)
  reviewStatus: number                         // 审核状态(0=待处理,1=通过,2=驳回)
  reviewComments?: string                      // 审核意见
  sort: number                                 // 排序
  uploader: string                             // 上传人
  uploadTime: string                           // 上传时间
  createTime: string                           // 创建时间
}

// ========== 整改记录相关类型 ==========

// 整改记录 Response VO
export interface TechnologicalRectificationRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  rectificationContent: string                 // 整改内容
  rectificationPerson: string                  // 整改人
  rectificationTime: string                    // 整改时间
  status: number                               // 整改状态
  createTime: string                           // 创建时间
}

// 整改记录 Request VO (新增/修改)
export interface TechnologicalRectificationSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  rectificationContent: string                 // 整改内容
  rectificationPerson: string                  // 整改人
  rectificationTime?: string                   // 整改时间
  status?: number                              // 整改状态
}

// ========== 项目时间线相关类型 ==========

// 项目时间线 Response VO
export interface TechnologicalProjectTimelineRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  eventType: string                            // 事件类型
  eventDescription: string                     // 事件描述
  eventTime: string                            // 事件时间
  operator: string                             // 操作人
  createTime: string                           // 创建时间
}

// 项目时间线 Request VO (新增/修改)
export interface TechnologicalProjectTimelineSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  eventType: string                            // 事件类型
  eventDescription: string                     // 事件描述
  eventTime?: string                           // 事件时间
  operator?: string                            // 操作人
}

// ========== 会议相关类型 ==========

// 会议 Response VO
export interface TechnologicalMeetingRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  meetingTitle: string                         // 会议标题
  meetingType: string                          // 会议类型
  startTime: string                            // 开始时间
  endTime: string                              // 结束时间
  meetingPlace: string                         // 会议地点
  meetingDescription?: string                  // 会议说明
  status: number                               // 会议状态
  createTime: string                           // 创建时间
}

// 会议 Request VO (新增/修改)
export interface TechnologicalMeetingSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  meetingNo: string                         // 会议编号
  meetingName: string                         // 会议名称
  meetingType: string                          // 会议类型
  meetingTime: string                            // 开始时间
  meetingPlace: string                         // 会议地点
  meetingDescription?: string                  // 会议说明
  meetingStatus?: number                              // 会议状态
}

// 会议参与人 Response VO
export interface TechnologicalMeetingParticipantRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  participantName: string                      // 参与人姓名
  participantPhone: string                     // 参与人电话
  participantUnit: string                      // 参与人单位
  participantRole: string                      // 参与人角色
  createTime: string                           // 创建时间
}

// 会议参与人 Request VO (新增/修改)
export interface TechnologicalMeetingParticipantSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  participantName: string                      // 参与人姓名
  participantPhone: string                     // 参与人电话
  participantUnit: string                      // 参与人单位
  participantRole: string                      // 参与人角色
}

// 会议资料 Response VO
export interface TechnologicalMeetingMaterialRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  materialName: string                         // 资料名称
  materialPath: string                         // 资料路径
  materialType: string                         // 资料类型
  uploadTime: string                           // 上传时间
  uploader: string                             // 上传人
  createTime: string                           // 创建时间
}

// 会议资料 Request VO (新增/修改)
export interface TechnologicalMeetingMaterialSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  materialName: string                         // 资料名称
  materialPath: string                         // 资料路径
  materialType: string                         // 资料类型
  uploadTime?: string                          // 上传时间
  uploader?: string                            // 上传人
}

// 会议提前提醒 Response VO
export interface TechnologicalMeetingRemindRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  meetingTitle: string                         // 会议标题
  startTime: string                            // 会议开始时间
  remindPersonnel: string                      // 提醒人员（参会人手机号，使用逗号隔开）
  reminderType: number                         // 提醒类型 0 HOUR小时 或 1 DAY天 2 MINUTE 分钟
  reminderValue: number                        // 提前量（1小时数或1天数）
  inAdvanceTime: string                        // 提前时间
  createTime: string                           // 创建时间
}

// 会议提前提醒 Request VO (新增/修改)
export interface TechnologicalMeetingRemindSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  meetingTitle: string                         // 会议标题
  startTime: string                            // 会议开始时间
  remindPersonnel: string                      // 提醒人员（参会人手机号，使用逗号隔开）
  reminderType: number                         // 提醒类型 0 HOUR小时 或 1 DAY天 2 MINUTE 分钟
  reminderValue: number                        // 提前量（1小时数或1天数）
  inAdvanceTime?: string                       // 提前时间
}

// ========== 材料审核记录相关类型 ==========

// 材料审核记录 Response VO
export interface TechnologicalMaterialReviewRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  materialId: number                           // 材料ID
  reviewResult: MaterialReviewResult           // 审核结果
  reviewComments: string                       // 审核意见
  reviewer: string                             // 审核人
  reviewTime: string                           // 审核时间
  createTime: string                           // 创建时间
}

// 材料审核记录 Request VO (新增/修改)
export interface TechnologicalMaterialReviewSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  materialId: number                           // 材料ID
  reviewResult: MaterialReviewResult           // 审核结果
  reviewComments: string                       // 审核意见
  reviewer: string                             // 审核人
  reviewTime?: string                          // 审核时间
}

// ========== 结论文件相关类型 ==========

// 结论文件 Response VO
export interface TechnologicalConclusionFileRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  fileName: string                             // 文件名称
  filePath: string                             // 文件路径
  fileType: string                             // 文件类型
  uploadTime: string                           // 上传时间
  uploader: string                             // 上传人
  createTime: string                           // 创建时间
}

// 结论文件 Request VO (新增/修改)
export interface TechnologicalConclusionFileSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  conclusionId: number                            // 项目ID
  fileName: string                             // 文件名称
  filePath: string                             // 文件路径
  sort: number                                 // 排序
}

// ========== 验收结论相关类型 ==========

// 验收结论 Response VO
export interface TechnologicalAcceptanceConclusionRespVO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  conclusionType: string                       // 结论类型
  conclusionContent: string                    // 结论内容
  conclusionTime: string                       // 结论时间
  conclusionPerson: string                     // 结论人
  createTime: string                           // 创建时间
}

// 验收结论 Request VO (新增/修改)
export interface TechnologicalAcceptanceConclusionSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  conclusionType: number                       // 结论类型
  conclusionResult: number                     // 结论结果
  conclusionDescription: string                    // 结论内容

}

// ========== API Response 封装类型 ==========

// 统一响应格式
export type ApprovalApiResponse<T = any> = CommonResult<T>
export type ApprovalPageResponse<T = any> = CommonResult<PageResult<T>>

// 分页请求基础参数
export interface ApprovalPageQuery extends PageParam {
  [key: string]: any
}