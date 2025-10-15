/**
 * 模板服务
 * @description 处理材料模板的获取、下载和管理
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import request from '@/config/axios'

/**
 * 模板服务类
 */
export class TemplateService {
  /**
   * 获取材料模板配置
   * @param {string|number} configId - 模板配置ID
   * @returns {Promise<Object>} 模板配置信息
   */
  static async getMaterialTemplate(configId) {
    try {
      console.log('📋 获取材料模板配置:', configId)
      
      const response = await request.get({
        url: '/admin-api/technologicalmaterialtemplate/technological-material-template/get',
        params: { id: configId }
      })
      
      if (response.code === 0) {
        console.log('✅ 模板配置获取成功:', response.data)
        return response.data
      } else {
        throw new Error(response.msg || '获取模板配置失败')
      }
    } catch (error) {
      console.error('❌ 获取模板配置失败:', error)
      throw new Error(`获取模板配置失败: ${error.message}`)
    }
  }
  
  /**
   * 下载模板文件
   * @param {string} templateFilePath - 模板文件路径
   * @returns {Promise<Blob>} 模板文件Blob对象
   */
  static async downloadTemplate(templateFilePath) {
    try {
      console.log('📥 下载模板文件:', templateFilePath)
      
      if (!templateFilePath) {
        throw new Error('模板文件路径不能为空')
      }
      
      // 构建完整的文件URL
      const fileUrl = this.buildFileUrl(templateFilePath)
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,*/*'
        }
      })
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('✅ 模板文件下载成功:', {
        size: blob.size,
        type: blob.type
      })
      
      return blob
      
    } catch (error) {
      console.error('❌ 下载模板文件失败:', error)
      throw new Error(`下载模板文件失败: ${error.message}`)
    }
  }
  
  /**
   * 构建完整的文件URL
   * @param {string} templateFilePath - 模板文件路径
   * @returns {string} 完整的文件URL
   */
  static buildFileUrl(templateFilePath) {
    // 如果已经是完整URL，直接返回
    if (templateFilePath.startsWith('http://') || templateFilePath.startsWith('https://')) {
      return templateFilePath
    }
    
    // 如果是相对路径，构建完整URL
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8080'
    return `${baseUrl}${templateFilePath.startsWith('/') ? '' : '/'}${templateFilePath}`
  }
  
  /**
   * 验证模板文件
   * @param {Blob} blob - 文件Blob对象
   * @returns {Object} 验证结果
   */
  static validateTemplate(blob) {
    const validation = {
      valid: false,
      errors: []
    }
    
    // 检查文件大小
    if (blob.size === 0) {
      validation.errors.push('文件为空')
    } else if (blob.size > 50 * 1024 * 1024) { // 50MB限制
      validation.errors.push('文件大小超过50MB限制')
    }
    
    // 检查文件类型
    const validTypes = [
      // Word文档
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      // Excel文档
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      // PowerPoint文档
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ]
    
    if (!validTypes.includes(blob.type)) {
      validation.errors.push('不支持的文件类型，仅支持Office文档(.doc/.docx/.xls/.xlsx/.ppt/.pptx)')
    }
    
    validation.valid = validation.errors.length === 0
    
    return validation
  }
  
  /**
   * 获取模板预览信息
   * @param {Blob} blob - 文件Blob对象
   * @returns {Object} 预览信息
   */
  static getTemplateInfo(blob) {
    return {
      size: blob.size,
      type: blob.type,
      lastModified: new Date().toISOString(),
      sizeFormatted: this.formatFileSize(blob.size)
    }
  }
  
  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  /**
   * 检查是否支持在线填报
   * @param {Object} templateConfig - 模板配置
   * @returns {boolean} 是否支持在线填报
   */
  static supportsOnlineFill(templateConfig) {
    if (!templateConfig) return false
    
    // 检查文件类型
    const fileName = templateConfig.templateFileName || ''
    const supportedExtensions = ['.doc', '.docx']
    const hasValidExtension = supportedExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    )
    
    // 检查类目名称（可以根据需要扩展）
    const supportedCategories = [
      '研发项目申请书',
      '项目申请书',
      '申请书',
      '申报书'
    ]
    
    const categoryName = templateConfig.categoryName || ''
    const hasSupportedCategory = supportedCategories.some(category =>
      categoryName.includes(category)
    )
    
    return hasValidExtension && hasSupportedCategory
  }
}

export default TemplateService
