/**
 * @file 文件上传服务
 * @description 统一的文件上传服务，支持MaterialTemplateSync组件的文件上传需求
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import request from '@/config/axios'

// 文件上传进度回调类型
export interface UploadProgressCallback {
  (progress: { percent: number }): void
}

// 文件上传成功回调类型
export interface UploadSuccessCallback {
  (response: any, file: File): void
}

// 文件上传失败回调类型
export interface UploadErrorCallback {
  (error: Error, file: File): void
}

// 文件上传选项
export interface FileUploadOptions {
  onProgress?: UploadProgressCallback
  onSuccess?: UploadSuccessCallback
  onError?: UploadErrorCallback
  maxSize?: number // 最大文件大小(MB)
  allowedTypes?: string[] // 允许的文件类型
}

// 文件上传结果
export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
  originalFile: File
}

/**
 * 文件上传服务类
 */
export class FileUploadService {
  
  /**
   * 默认配置
   */
  private static defaultConfig = {
    maxSize: 50, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
  }

  /**
   * 验证文件是否符合要求
   */
  static validateFile(file: File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
    const config = { ...this.defaultConfig, ...options }
    
    // 文件大小验证
    const maxSizeBytes = config.maxSize! * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `文件大小不能超过 ${config.maxSize}MB`
      }
    }
    
    // 文件类型验证
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      const allowedExtensions = config.allowedTypes
        .map(type => {
          const typeMap: Record<string, string> = {
            'application/pdf': 'PDF',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
            'application/vnd.ms-excel': 'XLS',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
            'application/vnd.ms-powerpoint': 'PPT',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
            'text/plain': 'TXT',
            'image/jpeg': 'JPG',
            'image/png': 'PNG',
            'image/gif': 'GIF'
          }
          return typeMap[type] || type
        })
        .join('、')
      
      return {
        valid: false,
        error: `只支持以下格式文件: ${allowedExtensions}`
      }
    }
    
    return { valid: true }
  }

  /**
   * 上传单个文件
   */
  static async uploadFile(file: File, options: FileUploadOptions = {}): Promise<FileUploadResult> {
    // 文件验证
    const validation = this.validateFile(file, options)
    if (!validation.valid) {
      const error = new Error(validation.error!)
      options.onError?.(error, file)
      return {
        success: false,
        error: validation.error,
        originalFile: file
      }
    }

    try {
      // 创建FormData
      const formData = new FormData()
      formData.append('file', file)

      // 模拟进度回调
      options.onProgress?.({ percent: 30 })

      // 调用系统文件上传API
      const response = await request.upload({
        url: '/infra/file/upload',
        data: formData
      })

      options.onProgress?.({ percent: 80 })

      if (response.code === 0 && response.data) {
        options.onProgress?.({ percent: 100 })
        options.onSuccess?.(response, file)
        
        return {
          success: true,
          url: response.data,
          originalFile: file
        }
      } else {
        throw new Error(response.msg || '上传失败')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('上传失败')
      options.onError?.(err, file)
      
      return {
        success: false,
        error: err.message,
        originalFile: file
      }
    }
  }

  /**
   * 批量上传文件
   */
  static async uploadFiles(files: File[], options: FileUploadOptions = {}): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 为每个文件创建独立的进度回调
      const fileOptions: FileUploadOptions = {
        ...options,
        onProgress: (progress) => {
          // 计算总体进度
          const totalProgress = ((i + progress.percent / 100) / files.length) * 100
          options.onProgress?.({ percent: Math.round(totalProgress) })
        }
      }
      
      const result = await this.uploadFile(file, fileOptions)
      results.push(result)
    }
    
    return results
  }

  /**
   * 取消上传（预留接口）
   */
  static cancelUpload(uploadId: string): void {
    // TODO: 实现上传取消功能
    console.log('取消上传:', uploadId)
  }

  /**
   * 获取文件扩展名
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

/**
 * 默认导出文件上传服务
 */
export default FileUploadService