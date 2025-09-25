/**
 * 通用文件上传模块类型定义
 * @description 科研附件通用上传相关类型
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

// ========== 通用文件上传类型 ==========

// 上传文件响应 VO
export interface TechnologicalRequirementAttachmentReqVO {
  requirementId?: number                        // 关联的需求ID
  requirementCode?: string                      // 关联的需求编号
  fileName: string                              // 文件名称
  fileUrl: string                               // 文件访问地址
  fileSize?: number                             // 文件大小(字节)
  fileType?: string                             // 文件类型
  fileMd5?: string                              // 文件MD5
  uploadTime?: string                           // 上传时间
  uploader?: string                             // 上传人
  description?: string                          // 文件描述
}

// 通用上传响应格式
export interface UploadResponse {
  code: number
  data: TechnologicalRequirementAttachmentReqVO
  msg: string
}

// 上传配置选项
export interface UploadOptions {
  directory?: string                            // 文件目录
  maxSize?: number                              // 最大文件大小(MB)
  allowedTypes?: string[]                       // 允许的文件类型
  multiple?: boolean                            // 是否允许多文件上传
  autoUpload?: boolean                          // 是否自动上传
}

// 文件上传状态
export enum UploadStatus {
  PENDING = 'pending',    // 待上传
  UPLOADING = 'uploading', // 上传中
  SUCCESS = 'success',    // 上传成功
  ERROR = 'error',        // 上传失败
  CANCELLED = 'cancelled' // 已取消
}

// 上传文件项
export interface UploadFileItem {
  uid: string                                   // 唯一标识
  name: string                                  // 文件名
  size: number                                  // 文件大小
  type: string                                  // 文件类型
  status: UploadStatus                          // 上传状态
  percent?: number                              // 上传进度
  response?: TechnologicalRequirementAttachmentReqVO // 服务器响应
  error?: string                                // 错误信息
  file?: File                                   // 原始文件对象
  url?: string                                  // 预览URL
}

// 上传事件回调
export interface UploadCallbacks {
  onProgress?: (percent: number, file: UploadFileItem) => void
  onSuccess?: (response: TechnologicalRequirementAttachmentReqVO, file: UploadFileItem) => void
  onError?: (error: Error, file: UploadFileItem) => void
  onRemove?: (file: UploadFileItem) => void
  onChange?: (fileList: UploadFileItem[]) => void
  beforeUpload?: (file: File) => boolean | Promise<boolean>
}

// 预设的文件类型配置
export const FileTypePresets = {
  // 文档类型
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  // 图片类型
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  // 压缩包类型
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  // 视频类型
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
  // 音频类型
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'm4a'],
  // 所有类型
  ALL: ['*']
}

// 预设的目录配置
export const DirectoryPresets = {
  PROJECT_MATERIALS: 'project/materials',       // 项目材料
  MEETING_MATERIALS: 'meeting/materials',       // 会议材料
  APPROVAL_DOCUMENTS: 'approval/documents',     // 审批文件
  TEMPLATES: 'templates',                       // 模板文件
  TEMPORARY: 'temp',                            // 临时文件
  REPORTS: 'reports',                           // 报告文件
  ATTACHMENTS: 'attachments'                    // 通用附件
}

// 常用的上传配置预设
export const UploadPresets = {
  // 项目材料上传
  PROJECT_MATERIAL: {
    directory: DirectoryPresets.PROJECT_MATERIALS,
    maxSize: 50, // 50MB
    allowedTypes: [...FileTypePresets.DOCUMENT, ...FileTypePresets.ARCHIVE],
    multiple: true,
    autoUpload: false
  } as UploadOptions,
  
  // 会议资料上传
  MEETING_MATERIAL: {
    directory: DirectoryPresets.MEETING_MATERIALS,
    maxSize: 100, // 100MB
    allowedTypes: FileTypePresets.ALL,
    multiple: true,
    autoUpload: false
  } as UploadOptions,
  
  // 图片上传
  IMAGE_UPLOAD: {
    directory: DirectoryPresets.ATTACHMENTS,
    maxSize: 10, // 10MB
    allowedTypes: FileTypePresets.IMAGE,
    multiple: false,
    autoUpload: true
  } as UploadOptions,
  
  // 模板上传
  TEMPLATE_UPLOAD: {
    directory: DirectoryPresets.TEMPLATES,
    maxSize: 20, // 20MB
    allowedTypes: FileTypePresets.DOCUMENT,
    multiple: false,
    autoUpload: false
  } as UploadOptions
}
