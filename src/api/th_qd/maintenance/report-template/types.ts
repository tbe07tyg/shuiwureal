/**
 * 提报模板 API 类型定义
 * 
 * 基于 OpenAPI 规范生成
 * API路径: /admin-api/technological/template/*
 */

// ========== 基础类型 ==========

/**
 * 分页查询基类
 */
export interface PageParam {
  pageNo: number
  pageSize: number
}

/**
 * 分页返回结果
 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/**
 * API响应包装类
 */
export interface CommonResult<T = any> {
  code: number
  data: T
  msg: string
}

// ========== 提报模板相关类型 ==========

/**
 * 模板配置结构
 */
export interface TemplateConfig {
  title?: string
  sections: TemplateSection[]
  requireAttachment?: boolean
}

/**
 * 模板分段
 */
export interface TemplateSection {
  title: string
  required: boolean
}

/**
 * 提报模板响应 VO
 */
export interface ReportTemplateRespVO {
  id: number
  templateCode: string
  templateName: string
  templateConfig: TemplateConfig
  requireAttachment: boolean
  templateType: string
  templateTypeText: string
  templateStatus: number
  templateStatusText: string
  isSystemDefault: boolean
  templateOrder: number
  projectId?: number
  description?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
}

/**
 * 提报模板创建请求 VO
 */
export interface ReportTemplateCreateReqVO {
  templateCode: string
  templateName: string
  templateConfig?: TemplateConfig
  requireAttachment?: boolean
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  templateOrder?: number
  projectId?: number
  description?: string
}

/**
 * 提报模板更新请求 VO
 */
export interface ReportTemplateUpdateReqVO {
  id: number
  templateCode?: string
  templateName?: string
  templateConfig?: TemplateConfig
  requireAttachment?: boolean
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  templateOrder?: number
  projectId?: number
  description?: string
}

/**
 * 提报模板分页查询请求 VO
 */
export interface ReportTemplatePageReqVO extends PageParam {
  templateCode?: string
  templateName?: string
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  projectId?: number
  createTime?: string[]
}

/**
 * 提报模板导出请求 VO
 */
export interface ReportTemplateExportReqVO {
  templateCode?: string
  templateName?: string
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  projectId?: number
  createTime?: string[]
}

// ========== API 响应类型 ==========

/**
 * 获取提报模板分页响应
 */
export type GetReportTemplatePageResponse = CommonResult<PageResult<ReportTemplateRespVO>>

/**
 * 获取提报模板详情响应
 */
export type GetReportTemplateResponse = CommonResult<ReportTemplateRespVO>

/**
 * 获取提报模板列表响应
 */
export type GetReportTemplateListResponse = CommonResult<ReportTemplateRespVO[]>

/**
 * 创建提报模板响应
 */
export type CreateReportTemplateResponse = CommonResult<number>

/**
 * 更新提报模板响应
 */
export type UpdateReportTemplateResponse = CommonResult<boolean>

/**
 * 删除提报模板响应
 */
export type DeleteReportTemplateResponse = CommonResult<boolean>

/**
 * 提报模板统计信息
 */
export interface ReportTemplateStats {
  total: number
  enabledCount: number
  disabledCount: number
  byType: Record<string, number>
  defaultTemplate?: ReportTemplateRespVO
}

/**
 * 模板统计响应
 */
export type GetReportTemplateStatsResponse = CommonResult<ReportTemplateStats>

// ========== 模板状态枚举 ==========

/**
 * 模板状态
 */
export enum TemplateStatus {
  DISABLED = 0,  // 禁用
  ENABLED = 1    // 启用
}

/**
 * 模板类型
 */
export enum TemplateType {
  TASK = 'task',           // 任务模板
  PROJECT = 'project',     // 项目模板
  MILESTONE = 'milestone', // 里程碑模板
  GENERAL = 'general'      // 通用模板
}

// ========== 工具类型 ==========

/**
 * 前端使用的模板配置（兼容现有代码）
 */
export interface FrontendTemplateConfig {
  id: string | number
  name: string
  title?: string
  sections: TemplateSection[]
  requireAttachment: boolean
  templateType?: string
  isDefault?: boolean
  order?: number
}
/*
 * 提报模板 API 类型定义
 * 
 * 基于 OpenAPI 规范生成
 * API路径: /admin-api/technological/template/*
 */

// ========== 基础类型 ==========

/**
 * 分页查询基类
 */
export interface PageParam {
  pageNo: number
  pageSize: number
}

/**
 * 分页返回结果
 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/**
 * API响应包装类
 */
export interface CommonResult<T = any> {
  code: number
  data: T
  msg: string
}

// ========== 提报模板相关类型 ==========

/**
 * 模板配置结构
 */
export interface TemplateConfig {
  title?: string
  sections: TemplateSection[]
  requireAttachment?: boolean
}

/**
 * 模板分段
 */
export interface TemplateSection {
  title: string
  required: boolean
}

/**
 * 提报模板响应 VO
 */
export interface ReportTemplateRespVO {
  id: number
  templateCode: string
  templateName: string
  templateConfig: TemplateConfig
  requireAttachment: boolean
  templateType: string
  templateTypeText: string
  templateStatus: number
  templateStatusText: string
  isSystemDefault: boolean
  templateOrder: number
  projectId?: number
  description?: string
  createTime?: string
  updateTime?: string
  creator?: string
  updater?: string
}

/**
 * 提报模板创建请求 VO
 */
export interface ReportTemplateCreateReqVO {
  templateCode: string
  templateName: string
  templateConfig?: TemplateConfig
  requireAttachment?: boolean
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  templateOrder?: number
  projectId?: number
  description?: string
}

/**
 * 提报模板更新请求 VO
 */
export interface ReportTemplateUpdateReqVO {
  id: number
  templateCode?: string
  templateName?: string
  templateConfig?: TemplateConfig
  requireAttachment?: boolean
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  templateOrder?: number
  projectId?: number
  description?: string
}

/**
 * 提报模板分页查询请求 VO
 */
export interface ReportTemplatePageReqVO extends PageParam {
  templateCode?: string
  templateName?: string
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  projectId?: number
  createTime?: string[]
}

/**
 * 提报模板导出请求 VO
 */
export interface ReportTemplateExportReqVO {
  templateCode?: string
  templateName?: string
  templateType?: string
  templateStatus?: number
  isSystemDefault?: boolean
  projectId?: number
  createTime?: string[]
}

// ========== API 响应类型 ==========

/**
 * 获取提报模板分页响应
 */
export type GetReportTemplatePageResponse = CommonResult<PageResult<ReportTemplateRespVO>>

/**
 * 获取提报模板详情响应
 */
export type GetReportTemplateResponse = CommonResult<ReportTemplateRespVO>

/**
 * 获取提报模板列表响应
 */
export type GetReportTemplateListResponse = CommonResult<ReportTemplateRespVO[]>

/**
 * 创建提报模板响应
 */
export type CreateReportTemplateResponse = CommonResult<number>

/**
 * 更新提报模板响应
 */
export type UpdateReportTemplateResponse = CommonResult<boolean>

/**
 * 删除提报模板响应
 */
export type DeleteReportTemplateResponse = CommonResult<boolean>

/**
 * 提报模板统计信息
 */
export interface ReportTemplateStats {
  total: number
  enabledCount: number
  disabledCount: number
  byType: Record<string, number>
  defaultTemplate?: ReportTemplateRespVO
}

/**
 * 模板统计响应
 */
export type GetReportTemplateStatsResponse = CommonResult<ReportTemplateStats>

// ========== 模板状态枚举 ==========

/**
 * 模板状态
 */
export enum TemplateStatus {
  DISABLED = 0,  // 禁用
  ENABLED = 1    // 启用
}

/**
 * 模板类型
 */
export enum TemplateType {
  TASK = 'task',           // 任务模板
  PROJECT = 'project',     // 项目模板
  MILESTONE = 'milestone', // 里程碑模板
  GENERAL = 'general'      // 通用模板
}

// ========== 工具类型 ==========

/**
 * 前端使用的模板配置（兼容现有代码）
 */
export interface FrontendTemplateConfig {
  id: string | number
  name: string
  title?: string
  sections: TemplateSection[]
  requireAttachment: boolean
  templateType?: string
  isDefault?: boolean
  order?: number
}
