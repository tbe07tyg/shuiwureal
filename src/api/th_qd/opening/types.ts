// 项目开题相关类型定义
// 对应后端 [项目开题] 模块的所有数据结构

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

// ========== 项目开题申请相关类型 ==========

// 开题申请类型枚举
export enum ProposalApplicationType {
  PRELIMINARY = 1,    // 初步开题
  FORMAL = 2,         // 正式开题
  SPECIAL = 3          // 专项开题
}

// 开题申请状态枚举
export enum ProposalApplicationStatus {
  DRAFT = 0,                   // 草稿
  MATERIAL_REVIEWING = 1,      // 材料审核中
  MEETING_PENDING = 2,         // 会议待组织
  MEETING_SCHEDULED = 3,       // 会议已安排
  OPENING_PASSED = 4,          // 开题通过
  CONDITIONALLY_PASSED = 5,    // 有条件通过
  OPENING_FAILED = 6,          // 开题未通过
  MATERIAL_REJECTED = 7        // 材料驳回
}

// 材料审核结果枚举
export enum MaterialReviewResult {
  PENDING = 0,     // 待处理
  PASSED = 1,      // 通过
  REJECTED = 2     // 驳回
}

// 会议类型枚举
export enum MeetingType {
  OFFLINE = 0,     // 现场会议
  ONLINE = 1,      // 线上会议
  HYBRID = 2       // 混合会议
}

// 会议状态枚举
export enum MeetingStatus {
  PENDING = 0,     // 待组织
  SCHEDULED = 1,   // 已安排
  IN_PROGRESS = 2, // 进行中
  COMPLETED = 3    // 已结束
}

// 参与人角色枚举
export enum ParticipantRole {
  HOST = 0,        // 主持人
  EXPERT = 1,      // 专家
  RECORDER = 2,    // 记录员
  OBSERVER = 3     // 观察员
}

// 出勤状态枚举
export enum AttendanceStatus {
  INVITED = 0,     // 已邀请
  CONFIRMED = 1,   // 已确认
  PRESENT = 2,     // 已出席
  ABSENT = 3       // 缺席
}

// 结论结果枚举
export enum ConclusionResult {
  PASSED = 0,              // 通过
  CONDITIONALLY_PASSED = 1, // 有条件通过
  REJECTED = 2             // 驳回
}

// 结论类型枚举
export enum ConclusionType {
  MATERIAL_REVIEW = 0,     // 材料审核
  MEETING_REVIEW = 1,      // 会议评审
  RECTIFICATION_REVIEW = 2 // 整改审核
}

// 整改审核结果枚举
export enum RectificationReviewResult {
  PENDING = 0,     // 待处理
  PASSED = 1,      // 通过
  REJECTED = 2     // 驳回
}

// 提醒类型枚举
export enum ReminderType {
  HOUR = 0,        // 小时
  DAY = 1,         // 天
  MINUTE = 2       // 分钟
}

// ========== 项目开题申请相关类型 ==========

// 项目开题申请 Response VO
export interface ProposalApplicationRespVO {
  id: number                                    // 主键ID
  projectId: number                            // 项目ID
  applicationNo: string                        // 申请编号
  applicationType: ProposalApplicationType     // 申请类型
  applicationStatus: ProposalApplicationStatus // 申请状态
  expectedProposalTime: string                 // 预期开题时间
  applicationDescription: string               // 申请说明
  notes: string                                // 备注说明
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
  proposalMaterialRewriteDOList?: ProposalMaterialRewriteDO[] // 开题申请材料列表
}

// 项目开题申请 Request VO (新增/修改) - 严格按照API文档
export interface ProposalApplicationSaveReqVO {
  id: number                                   // 申请ID (必填)
  projectId: number                            // 项目ID (必填)
  applicationNo: string                        // 申请编号 (必填)
  applicationType: number                      // 申请类型 (必填): 1-初步开题, 2-正式开题, 3-专项开题
  applicationStatus: number                    // 申请状态 (必填): 1-材料审核中, 2-会议待组织, 3-会议已安排, 4-开题通过, 5-有条件通过, 6-开题未通过
  expectedProposalTime?: string                // 预期开题时间 (可选): YYYY-MM-DD格式
  applicationDescription?: string              // 申请说明 (可选)
  notes?: string                               // 备注说明 (可选)
  createTime?: string                          // 创建时间 (可选): 新增时后端自动生成，修改时可传递
  proposalMaterialRewriteDOList?: ProposalMaterialRewriteDO[] // 开题申请材料列表 (可选)
}

// 项目开题申请查询 VO
export interface ProposalApplicationPageReqVO extends PageParam {
  projectId?: number                           // 项目ID
  applicationNo?: string                       // 申请编号
  applicationType?: ProposalApplicationType    // 申请类型
  applicationStatus?: ProposalApplicationStatus // 申请状态
  expectedProposalTime?: string                // 预期开题时间
  creator?: string                             // 创建人
  createTime?: string                          // 创建时间
}

// 项目开题状态检查结果
export interface ProjectOpeningStatusCheckResult {
  hasApplication: boolean                      // 是否已有申请
  canSubmit: boolean                          // 是否可以提交
  reason?: string                             // 不能提交的原因
  existingApplicationId?: number              // 现有申请ID
  existingApplicationStatus?: ProposalApplicationStatus // 现有申请状态
}

// 材料验证结果
export interface MaterialValidationResult {
  isValid: boolean                             // 材料是否完整
  missingMaterials: string[]                  // 缺失的材料列表
  totalRequired: number                       // 必需材料总数
  totalUploaded: number                       // 已上传材料总数
}

// ========== 项目开题材料相关类型 ==========

// 项目开题材料 Response VO
export interface ProposalMaterialRewriteDO {
  id: number                                   // 主键ID
  projectId: number                            // 项目ID
  proposalApplicationId: number                // 开题申请ID
  materialType: number                         // 材料类型
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize: number                             // 文件大小
  fileSuffix: string                           // 文件后缀
  isRequired: boolean                          // 是否必传
  reviewStatus: number                         // 审核状态（0-待处理, 1-通过, 2-驳回）
  sort: number                                 // 排序
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题材料 Request VO (新增/修改)
export interface ProposalMaterialRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  projectId: number                            // 项目ID
  proposalApplicationId: number                // 开题申请ID
  materialType: number                         // 材料类型
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize: number                             // 文件大小
  fileSuffix: string                           // 文件后缀
  isRequired: boolean                          // 是否必传
  reviewStatus?: number                        // 审核状态（0-待处理, 1-通过, 2-驳回）
  sort?: number                                // 排序
}

// ========== 项目开题材料审核记录相关类型 ==========

// 项目开题材料审核记录 Response VO
export interface ProposalMaterialReviewRewriteRespVO {
  id: number                                   // 主键ID
  proposalApplicationId: number                // 开题申请ID
  materialId?: number                          // 材料ID (空表示整体审核)
  reviewResult: MaterialReviewResult           // 审核结果
  reviewOpinion: string                        // 审核意见
  reviewer: string                             // 审核人
  reviewTime: string                           // 审核时间
  isFinalReview: boolean                       // 是否最终审核
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题材料审核记录 Request VO (新增/修改)
export interface ProposalMaterialReviewRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  proposalApplicationId: number                // 开题申请ID
  materialId?: number                          // 材料ID (空表示整体审核)
  reviewResult: MaterialReviewResult           // 审核结果
  reviewOpinion: string                        // 审核意见
  reviewer: string                             // 审核人
  reviewTime: string                           // 审核时间
  isFinalReview: boolean                       // 是否最终审核
}

// ========== 项目开题会议相关类型 ==========

// 项目开题会议 Response VO
export interface ProposalMeetingRewriteRespVO {
  id: number                                   // 主键ID
  proposalApplicationId: number                // 开题申请ID
  meetingNo: string                            // 会议编号
  meetingName: string                          // 会议名称
  meetingTime: string                          // 会议时间
  meetingPlace: string                         // 会议地点
  meetingType: MeetingType                     // 会议类型
  meetingStatus: MeetingStatus                 // 会议状态
  meetingMinutes?: string                      // 会议纪要
  meetingInstructions?: string                 // 会议说明
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
  meetingParticipantReqVOList?: ProposalMeetingParticipantReqVO[] // 会议参与人列表
  meetingMaterialSaveReqVOList?: ProposalMeetingMaterialSaveReqVO[] // 会议材料列表
}

// 项目开题会议 Request VO (新增/修改)
export interface ProposalMeetingRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  proposalApplicationId: number                // 开题申请ID
  meetingNo: string                            // 会议编号
  meetingName: string                          // 会议名称
  meetingTime: string                          // 会议时间
  meetingPlace: string                         // 会议地点
  meetingType: MeetingType                     // 会议类型
  meetingStatus: MeetingStatus                 // 会议状态
  meetingMinutes?: string                      // 会议纪要
  meetingInstructions?: string                 // 会议说明
  meetingParticipantReqVOList?: ProposalMeetingParticipantReqVO[] // 会议参与人列表
  meetingMaterialSaveReqVOList?: ProposalMeetingMaterialSaveReqVO[] // 会议材料列表
}

// ========== 项目开题会议参与人相关类型 ==========

// 项目开题会议参与人 Request VO
export interface ProposalMeetingParticipantReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  userId: number                               // 用户ID
  participantRole: ParticipantRole             // 参与人角色
  participantName: string                      // 参与人姓名
  participantTitle: string                     // 参与人职称
  participantOrganization: string              // 参与人单位
  attendanceStatus: AttendanceStatus           // 出勤状态
  sort?: number                                // 排序
}

// ========== 项目开题会议材料相关类型 ==========

// 项目开题会议材料 Request VO
export interface ProposalMeetingMaterialSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  materialSource: number                       // 材料来源
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize: number                             // 文件大小
  fileSuffix: string                           // 文件后缀
  sort?: number                                // 排序
}

// ========== 项目开题验收结论相关类型 ==========

// 项目开题验收结论 Response VO
export interface ProposalAcceptanceConclusionRespVO {
  id: number                                   // 主键ID
  proposalApplicationId: number                // 开题申请ID
  meetingId?: number                           // 会议ID
  conclusionType: ConclusionType               // 结论类型
  conclusionResult: ConclusionResult           // 结论结果
  conclusionScore?: number                     // 结论评分
  conclusionDescription: string                // 结论描述
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题验收结论 Request VO (新增/修改)
export interface ProposalAcceptanceConclusionSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  proposalApplicationId: number                // 开题申请ID
  meetingId?: number                           // 会议ID
  conclusionType: ConclusionType               // 结论类型
  conclusionResult: ConclusionResult           // 结论结果
  conclusionScore?: number                     // 结论评分
  conclusionDescription: string                // 结论描述
}

// ========== 项目开题整改记录相关类型 ==========

// 项目开题整改记录 Response VO
export interface ProposalRectificationRewriteRespVO {
  id: number                                   // 主键ID
  proposalApplicationId: number                // 开题申请ID
  meetingConclusionId?: number                 // 会议结论ID
  rectificationNo: string                     // 整改编号
  rectificationRequirements: string            // 整改要求
  rectificationDeadline: string                // 整改截止时间
  applicantResponse?: string                   // 申请人回复
  reviewResult: RectificationReviewResult      // 审核结果
  reviewOpinion?: string                       // 审核意见
  reviewer?: string                            // 审核人
  reviewTime?: string                          // 审核时间
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题整改记录 Request VO (新增/修改)
export interface ProposalRectificationRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  proposalApplicationId: number                // 开题申请ID
  meetingConclusionId?: number                 // 会议结论ID
  rectificationNo: string                     // 整改编号
  rectificationRequirements: string            // 整改要求
  rectificationDeadline: string                // 整改截止时间
  applicantResponse?: string                   // 申请人回复
  reviewResult?: RectificationReviewResult     // 审核结果
  reviewOpinion?: string                       // 审核意见
  reviewer?: string                            // 审核人
  reviewTime?: string                          // 审核时间
}

// ========== 项目开题项目时间线相关类型 ==========

// 项目开题项目时间线 Response VO
export interface ProposalTimelineRewriteRespVO {
  id: number                                   // 主键ID
  proposalApplicationId: number                // 开题申请ID
  eventType: number                            // 事件类型
  eventTime: string                            // 事件时间
  operator: string                             // 操作人
  description: string                          // 事件描述
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题项目时间线 Request VO (新增/修改)
export interface ProposalTimelineRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  proposalApplicationId: number                // 开题申请ID
  eventType: number                            // 事件类型
  eventTime: string                            // 事件时间
  operator: string                             // 操作人
  description: string                          // 事件描述
}

// ========== 项目开题结论文件相关类型 ==========

// 项目开题结论文件 Response VO
export interface ProposalConclusionFileRewriteRespVO {
  id: number                                   // 主键ID
  conclusionId: number                         // 结论ID
  fileName: string                             // 文件名称
  fileUrl: string                              // 文件URL
  fileSize?: number                            // 文件大小
  fileSuffix?: string                          // 文件后缀
  sort?: number                                // 排序
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题结论文件 Request VO (新增/修改)
export interface ProposalConclusionFileRewriteSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  conclusionId: number                         // 结论ID
  fileName: string                             // 文件名称
  fileUrl: string                              // 文件URL
  fileSize?: number                            // 文件大小
  fileSuffix?: string                          // 文件后缀
  sort?: number                                // 排序
}

// ========== 项目开题会议提前提醒相关类型 ==========

// 项目开题会议提前提醒 Response VO
export interface ProposalMeetingRemindRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  meetingTitle: string                         // 会议标题
  startTime: string                            // 开始时间
  remindPersonnel: string                      // 提醒人员
  reminderType: ReminderType                   // 提醒类型
  reminderValue: number                        // 提醒值
  inAdvanceTime: string                        // 提前时间
  createTime: string                           // 创建时间
  updateTime: string                           // 更新时间
  creator: string                              // 创建人
  updater: string                              // 更新人
  deleted: boolean                             // 是否删除
}

// 项目开题会议提前提醒 Request VO (新增/修改)
export interface ProposalMeetingRemindSaveReqVO {
  id?: number                                  // 主键ID (修改时必填)
  meetingId: number                            // 会议ID
  meetingTitle: string                         // 会议标题
  startTime: string                            // 开始时间
  remindPersonnel: string                      // 提醒人员
  reminderType: ReminderType                   // 提醒类型
  reminderValue: number                        // 提醒值
  inAdvanceTime: string                        // 提前时间
}

// ========== 项目基础信息相关类型 ==========

// 项目基础信息 Response VO (用于项目选择)
export interface ProjectBasicInfoRespVO {
  id: number                                   // 项目ID
  projectName: string                          // 项目名称
  projectCode: string                          // 项目编号
  projectStatus: number                        // 项目状态
  startDate: string                            // 项目开始时间
  endDate: string                              // 项目计划结束时间
  projectLeader: string                        // 项目负责人
  projectBudget: number                        // 项目总预算
  projectCycle: number                         // 项目周期(月)
}

// ========== API响应类型 ==========

// 开题API响应类型
export interface OpeningApiResponse<T = any> {
  code: number
  data: T
  msg: string
}

// 开题分页响应类型
export interface OpeningPageResponse<T = any> {
  code: number
  data: PageResult<T>
  msg: string
}

// ========== 项目开题会议参与人管理相关类型 ==========

// 开题会议参与人分页查询参数 (严格按照all.md)
export interface ProposalMeetingParticipantPageReqVO extends PageParam {
  meetingId?: number                           // 会议ID
  userId?: number                              // 系统用户ID
  participantRole?: number                     // 参与者角色（0-主持人, 1-专家, 2-记录员, 3-观察员）
  participantName?: string                     // 参与者姓名
  participantTitle?: string                    // 参与者职称
  participantOrganization?: string             // 参与者单位
  attendanceStatus?: number                    // 出席状态（0-已邀请, 1-已确认, 2-已出席, 3-缺席）
  sort?: number                                // 排序
  createTime?: string                          // 创建时间
}

// 开题会议参与人保存请求VO (严格按照all.md)
export interface ProposalMeetingParticipantRewriteSaveReqVO {
  id: number                                   // 主键ID (必填)
  meetingId: number                            // 会议ID (必填)
  userId?: number                              // 系统用户ID (可选)
  participantRole: number                      // 参与者角色（0-主持人, 1-专家, 2-记录员, 3-观察员）(必填)
  participantName: string                      // 参与者姓名 (必填)
  participantTitle?: string                    // 参与者职称 (可选)
  participantOrganization?: string             // 参与者单位 (可选)
  attendanceStatus?: number                    // 出席状态（0-已邀请, 1-已确认, 2-已出席, 3-缺席）(可选)
  sort: number                                 // 排序 (必填)
}

// 开题会议参与人响应VO (严格按照all.md)
export interface ProposalMeetingParticipantRewriteRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  userId?: number                              // 系统用户ID
  participantRole: number                      // 参与者角色
  participantName: string                      // 参与者姓名
  participantTitle?: string                    // 参与者职称
  participantOrganization?: string             // 参与者单位
  attendanceStatus?: number                    // 出席状态
  sort: number                                 // 排序
  createTime: string                           // 创建时间
}

// ========== 项目开题会议材料管理相关类型 ==========

// 开题会议材料分页查询参数 (严格按照all.md)
export interface ProposalMeetingMaterialPageReqVO extends PageParam {
  meetingId?: number                           // 会议ID
  materialSource?: number                      // 材料来源（0-申报单位提交, 1-专家预审意见, 2-会议记录, 3-其他）
  materialName?: string                        // 材料名称
  fileUrl?: string                             // 文件URL
  fileSize?: number                            // 文件大小(字节)
  fileSuffix?: string                          // 文件后缀
  sort?: number                                // 排序
  createTime?: string                          // 创建时间
}

// 开题会议材料保存请求VO (严格按照all.md)
export interface ProposalMeetingMaterialRewriteSaveReqVO {
  id: number                                   // 主键ID (必填)
  meetingId: number                            // 会议ID (必填)
  materialSource: number                       // 材料来源（0-申报单位提交, 1-专家预审意见, 2-会议记录, 3-其他）(必填)
  materialName: string                         // 材料名称 (必填)
  fileUrl: string                              // 文件URL (必填)
  fileSize?: number                            // 文件大小(字节) (可选)
  fileSuffix?: string                          // 文件后缀 (可选)
  sort: number                                 // 排序 (必填)
}

// 开题会议材料响应VO (严格按照all.md)
export interface ProposalMeetingMaterialRewriteRespVO {
  id: number                                   // 主键ID
  meetingId: number                            // 会议ID
  materialSource: number                       // 材料来源
  materialName: string                         // 材料名称
  fileUrl: string                              // 文件URL
  fileSize?: number                            // 文件大小
  fileSuffix?: string                          // 文件后缀
  sort: number                                 // 排序
  createTime: string                           // 创建时间
}

// ========== 项目开题结论文件管理相关类型 ==========

// 开题结论文件分页查询参数 (严格按照all.md)
export interface ProposalConclusionFilePageReqVO extends PageParam {
  conclusionId?: number                        // 结论ID
  fileName?: string                            // 文件名称
  fileUrl?: string                             // 文件URL
  fileSize?: number                            // 文件大小
  fileSuffix?: string                          // 文件后缀
  sort?: number                                // 排序
  createTime?: string                          // 创建时间
}

// ========== 项目立项申请相关类型 ==========

// 项目立项申请 Response VO (严格按照API文档)
export interface TechnologicalProjectRespVO {
  id: number                                   // 主键ID
  projectNo?: string                           // 项目编号
  projectName: string                          // 立项名称
  yearly?: number                              // 年度(如2024,2025)
  applicant?: string                           // 申请人
  applicantUnit?: string                       // 申请单位
  projectCycle?: number                        // 项目周期(月)
  budget?: number                              // 预算(万元)
  expectedProjectTime?: string                 // 预期立项时间
  applicationDescription?: string              // 申请说明
  technicalApproach?: string                   // 技术方案描述
  riskAnalysis?: string                        // 风险分析与应对
  remark?: string                              // 备注说明
  status?: number                              // 项目状态（0-草稿, 1-材料审核中, 2-材料驳回, 3-会议待组织, 4-会议已安排, 5-会议进行中, 6-有条件通过, 7-整改中, 8-立项通过, 9-立项未通过）
  materialReviewResult?: number                // 材料整体审核结论（0-待处理, 1-通过, 2-驳回）
  failedReason?: string                        // 不通过原因
  reviewComments?: string                      // 审核意见
  createTime?: string                          // 创建时间
}
