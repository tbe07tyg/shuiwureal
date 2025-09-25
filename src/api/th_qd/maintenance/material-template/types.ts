/**
 * 材料模板 API 类型定义
 * 
 * 基于 OpenAPI 规范生成
 * API路径: /admin-api/technologicalmaterialtemplate/technological-material-template/*
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
  msg: string
  data: T
}

// ========== 使用源枚举 ==========

/**
 * 使用源枚举
 * 定义材料模板在哪个业务场景中使用
 */
export enum UseSource {
  APPROVAL = 0,    // 立项申请
  OPENING = 1,     // 项目开题  
  MIDTERM = 2,     // 项目中期
  ACCEPTANCE = 3   // 项目验收
}

/**
 * 是否必传枚举
 */
export enum IsRequired {
  REQUIRED = 0,    // 必传
  OPTIONAL = 1     // 选传
}

// ========== 材料模板相关类型 ==========

/**
 * 材料模板 Response VO
 */
export interface TechnologicalMaterialTemplateRespVO {
  id: number                              // 主键ID
  categoryName: string                    // 类目名称
  isRequired: IsRequired                  // 是否必传（0必传 1选传）
  sort: number                           // 显示顺序
  templateFilePath?: string              // 模板文件路径
  descriptionAndExplanation?: string     // 描述说明
  useSource: UseSource                   // 使用源（0.立项申请，1.项目开题，2.项目中期，3.项目验收）
  createTime: string                     // 创建时间
}

/**
 * 材料模板 Request VO (新增/修改)
 */
export interface TechnologicalMaterialTemplateSaveReqVO {
  id?: number                            // 主键ID (修改时必填)
  categoryName: string                   // 类目名称
  isRequired: IsRequired                 // 是否必传（0必传 1选传）
  sort: number                          // 显示顺序
  templateFilePath?: string             // 模板文件路径
  descriptionAndExplanation?: string    // 描述说明
  useSource: UseSource                  // 使用源（0.立项申请，1.项目开题，2.项目中期，3.项目验收）
}

/**
 * 材料模板查询 VO
 */
export interface TechnologicalMaterialTemplatePageReqVO extends PageParam {
  categoryName?: string                  // 类目名称
  isRequired?: IsRequired               // 是否必传
  useSource?: UseSource                 // 使用源
  createTime?: string[]                 // 创建时间范围
}

/**
 * 材料模板导出 VO
 */
export interface TechnologicalMaterialTemplateExportReqVO {
  categoryName?: string                  // 类目名称
  isRequired?: IsRequired               // 是否必传
  useSource?: UseSource                 // 使用源
  createTime?: string[]                 // 创建时间范围
}

// ========== 业务逻辑相关类型 ==========

/**
 * 材料模板配置项
 * 用于前端组件展示
 */
export interface MaterialTemplateConfig {
  id: number                            // 模板ID
  key: string                          // 唯一标识key (基于categoryName生成)
  name: string                         // 显示名称
  description: string                  // 描述说明  
  isRequired: boolean                  // 是否必传
  sort: number                         // 排序
  templateUrl?: string                 // 模板文件下载URL
  useSource: UseSource                 // 使用源
  fileList?: any[]                     // 文件列表 (前端使用)
}

/**
 * 按使用源分组的模板配置
 */
export interface GroupedTemplateConfig {
  [UseSource.APPROVAL]: MaterialTemplateConfig[]    // 立项申请
  [UseSource.OPENING]: MaterialTemplateConfig[]     // 项目开题
  [UseSource.MIDTERM]: MaterialTemplateConfig[]     // 项目中期
  [UseSource.ACCEPTANCE]: MaterialTemplateConfig[]  // 项目验收
}

/**
 * 材料模板统计信息
 */
export interface MaterialTemplateStats {
  total: number                        // 总数
  requiredCount: number               // 必传数量
  optionalCount: number               // 选传数量
  byUseSource: {                      // 按使用源统计
    [UseSource.APPROVAL]: number
    [UseSource.OPENING]: number  
    [UseSource.MIDTERM]: number
    [UseSource.ACCEPTANCE]: number
  }
}

// ========== API 响应类型 ==========

/**
 * 材料模板 API 响应类型
 */
export type MaterialTemplateApiResponse<T = any> = CommonResult<T>

/**
 * 获取材料模板列表的响应类型
 */
export type GetMaterialTemplatePageResponse = MaterialTemplateApiResponse<PageResult<TechnologicalMaterialTemplateRespVO>>

/**
 * 获取材料模板详情的响应类型
 */
export type GetMaterialTemplateResponse = MaterialTemplateApiResponse<TechnologicalMaterialTemplateRespVO>

/**
 * 创建材料模板的响应类型
 */
export type CreateMaterialTemplateResponse = MaterialTemplateApiResponse<number>

/**
 * 更新材料模板的响应类型
 */
export type UpdateMaterialTemplateResponse = MaterialTemplateApiResponse<boolean>

/**
 * 删除材料模板的响应类型
 */
export type DeleteMaterialTemplateResponse = MaterialTemplateApiResponse<boolean>