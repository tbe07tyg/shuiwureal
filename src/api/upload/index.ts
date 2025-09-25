/**
 * 通用文件上传API模块
 * @description 科研附件通用上传功能封装
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import request from '@/config/axios'
import type { 
  UploadResponse, 
  UploadOptions,
  UploadFileItem
} from './types'
import { UploadStatus } from './types'

// ========== 基础上传API ==========

/**
 * 科研附件通用上传
 * @param file 文件对象
 * @param directory 文件目录 (可选)
 * @returns Promise<UploadResponse>
 */
export const uploadTechnologicalFile = (file: File, directory?: string): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const params: Record<string, string> = {}
  if (directory) {
    params.directory = directory
  }
  
  return request.post<UploadResponse>({
    url: '/infra/file/uploadTechnological',
    data: formData,
    params,
    timeout: 1000000,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传文件
 * @param files 文件数组
 * @param directory 文件目录 (可选)
 * @returns Promise<UploadResponse[]>
 */
export const uploadTechnologicalFiles = async (
  files: File[], 
  directory?: string
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadTechnologicalFile(file, directory))
  return Promise.all(uploadPromises)
}

/**
 * 带进度的文件上传
 * @param file 文件对象
 * @param directory 文件目录
 * @param onProgress 进度回调
 * @returns Promise<UploadResponse>
 */
export const uploadTechnologicalFileWithProgress = (
  file: File, 
  directory?: string,
  onProgress?: (progressEvent: any) => void
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const params: Record<string, string> = {}
  if (directory) {
    params.directory = directory
  }
  
  return request.post<UploadResponse>({
    url: '/infra/file/uploadTechnological',
    data: formData,
    params,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  })
}

// ========== 高级上传功能 ==========

/**
 * 上传工具类
 */
export class TechnologicalUploadService {
  private options: UploadOptions
  
  constructor(options: UploadOptions = {}) {
    this.options = {
      maxSize: 50, // 默认50MB
      allowedTypes: ['*'],
      multiple: false,
      autoUpload: true,
      ...options
    }
  }
  
  /**
   * 验证文件
   * @param file 文件对象
   * @returns 验证结果
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    const maxSizeBytes = (this.options.maxSize || 50) * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `文件大小超过限制 ${this.options.maxSize}MB`
      }
    }
    
    // 检查文件类型
    const allowedTypes = this.options.allowedTypes || ['*']
    if (!allowedTypes.includes('*')) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return {
          valid: false,
          error: `不支持的文件类型，仅支持: ${allowedTypes.join(', ')}`
        }
      }
    }
    
    return { valid: true }
  }
  
  /**
   * 生成文件项
   * @param file 原始文件
   * @returns UploadFileItem
   */
  createFileItem(file: File): UploadFileItem {
    return {
      uid: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: UploadStatus.PENDING,
      percent: 0,
      file: file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }
  }
  
  /**
   * 上传单个文件
   * @param fileItem 文件项
   * @returns Promise<UploadFileItem>
   */
  async uploadFile(fileItem: UploadFileItem): Promise<UploadFileItem> {
    if (!fileItem.file) {
      throw new Error('文件对象不存在')
    }
    
    // 验证文件
    const validation = this.validateFile(fileItem.file)
    if (!validation.valid) {
      fileItem.status = UploadStatus.ERROR
      fileItem.error = validation.error
      throw new Error(validation.error)
    }
    
    try {
      fileItem.status = UploadStatus.UPLOADING
      fileItem.percent = 0
      
      const response = await uploadTechnologicalFileWithProgress(
        fileItem.file,
        this.options.directory,
        (progressEvent) => {
          if (progressEvent.total) {
            fileItem.percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      )
      
      if (response.code === 0) {
        fileItem.status = UploadStatus.SUCCESS
        fileItem.percent = 100
        fileItem.response = response.data
        fileItem.url = response.data.fileUrl
      } else {
        throw new Error(response.msg || '上传失败')
      }
      
      return fileItem
    } catch (error) {
      fileItem.status = UploadStatus.ERROR
      fileItem.error = error instanceof Error ? error.message : '上传失败'
      throw error
    }
  }
  
  /**
   * 批量上传文件
   * @param fileItems 文件项数组
   * @returns Promise<UploadFileItem[]>
   */
  async uploadFiles(fileItems: UploadFileItem[]): Promise<UploadFileItem[]> {
    const results: UploadFileItem[] = []
    
    for (const fileItem of fileItems) {
      try {
        const result = await this.uploadFile(fileItem)
        results.push(result)
      } catch (error) {
        console.error(`文件 ${fileItem.name} 上传失败:`, error)
        results.push(fileItem) // 即使失败也要返回，保持数组完整性
      }
    }
    
    return results
  }
}

// ========== 便捷方法 ==========

/**
 * 快速上传项目材料
 * @param files 文件数组
 * @returns Promise<UploadResponse[]>
 */
export const uploadProjectMaterials = (files: File[]): Promise<UploadResponse[]> => {
  return uploadTechnologicalFiles(files, 'project/materials')
}

/**
 * 快速上传会议资料
 * @param files 文件数组
 * @returns Promise<UploadResponse[]>
 */
export const uploadMeetingMaterials = (files: File[]): Promise<UploadResponse[]> => {
  return uploadTechnologicalFiles(files, 'meeting/materials')
}

/**
 * 快速上传审批文件
 * @param files 文件数组
 * @returns Promise<UploadResponse[]>
 */
export const uploadApprovalDocuments = (files: File[]): Promise<UploadResponse[]> => {
  return uploadTechnologicalFiles(files, 'approval/documents')
}

/**
 * 快速上传模板文件
 * @param file 文件对象
 * @returns Promise<UploadResponse>
 */
export const uploadTemplate = (file: File): Promise<UploadResponse> => {
  return uploadTechnologicalFile(file, 'templates')
}

// ========== 工具函数 ==========

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 检查是否为图片文件
 * @param filename 文件名
 * @returns 是否为图片
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

/**
 * 生成唯一文件ID
 * @returns 唯一ID
 */
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 导出默认的上传服务实例
export const defaultUploadService = new TechnologicalUploadService()

export default {
  uploadTechnologicalFile,
  uploadTechnologicalFiles,
  uploadTechnologicalFileWithProgress,
  TechnologicalUploadService,
  uploadProjectMaterials,
  uploadMeetingMaterials,
  uploadApprovalDocuments,
  uploadTemplate,
  formatFileSize,
  getFileExtension,
  isImageFile,
  generateFileId,
  defaultUploadService
}
