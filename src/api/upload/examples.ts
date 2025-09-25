/**
 * 通用文件上传模块使用示例
 * @description 展示各种上传场景的使用方法
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-27
 */

import { message } from 'ant-design-vue'
import { 
  uploadTechnologicalFile,
  uploadTechnologicalFiles,
  uploadProjectMaterials,
  uploadMeetingMaterials,
  TechnologicalUploadService,
  formatFileSize,
  isImageFile
} from './index'
import { UploadPresets, FileTypePresets } from './types'
import type { UploadFileItem } from './types'

// ========== 基础使用示例 ==========

/**
 * 示例1: 简单的单文件上传
 */
export const simpleFileUpload = async (file: File) => {
  try {
    console.log('📤 开始上传文件:', file.name)
    
    const response = await uploadTechnologicalFile(file, 'temp')
    
    if (response.code === 0) {
      console.log('✅ 上传成功:', response.data)
      message.success(`文件 ${file.name} 上传成功`)
      return response.data.fileUrl
    } else {
      throw new Error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('❌ 上传失败:', error)
    message.error(`上传失败: ${error.message}`)
    throw error
  }
}

/**
 * 示例2: 批量文件上传
 */
export const batchFileUpload = async (files: File[]) => {
  try {
    console.log('📤 开始批量上传，文件数量:', files.length)
    
    const responses = await uploadTechnologicalFiles(files, 'project/materials')
    
    const successCount = responses.filter(r => r.code === 0).length
    const failCount = responses.length - successCount
    
    console.log(`✅ 批量上传完成: 成功 ${successCount} 个，失败 ${failCount} 个`)
    
    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`)
    }
    if (failCount > 0) {
      message.warning(`有 ${failCount} 个文件上传失败`)
    }
    
    return responses.filter(r => r.code === 0).map(r => r.data)
  } catch (error) {
    console.error('❌ 批量上传失败:', error)
    message.error('批量上传失败')
    throw error
  }
}

// ========== 高级服务类使用示例 ==========

/**
 * 示例3: 使用上传服务类进行项目材料上传
 */
export const projectMaterialUpload = async (files: File[]) => {
  // 创建专用的项目材料上传服务
  const uploadService = new TechnologicalUploadService(UploadPresets.PROJECT_MATERIAL)
  
  const fileItems: UploadFileItem[] = []
  
  // 验证并创建文件项
  for (const file of files) {
    const validation = uploadService.validateFile(file)
    if (!validation.valid) {
      message.error(`文件 ${file.name} 验证失败: ${validation.error}`)
      continue
    }
    
    const fileItem = uploadService.createFileItem(file)
    fileItems.push(fileItem)
    
    console.log('📝 创建文件项:', {
      name: fileItem.name,
      size: formatFileSize(fileItem.size),
      type: fileItem.type
    })
  }
  
  if (fileItems.length === 0) {
    message.warning('没有有效的文件可以上传')
    return []
  }
  
  try {
    console.log('🚀 开始上传项目材料，共', fileItems.length, '个文件')
    
    const results = await uploadService.uploadFiles(fileItems)
    
    const successFiles = results.filter(item => item.status === 'success')
    const errorFiles = results.filter(item => item.status === 'error')
    
    console.log(`✅ 项目材料上传完成: 成功 ${successFiles.length} 个，失败 ${errorFiles.length} 个`)
    
    // 显示详细结果
    successFiles.forEach(file => {
      console.log(`✅ ${file.name} -> ${file.response?.fileUrl}`)
    })
    
    errorFiles.forEach(file => {
      console.error(`❌ ${file.name} -> ${file.error}`)
    })
    
    if (successFiles.length > 0) {
      message.success(`项目材料上传成功: ${successFiles.length} 个文件`)
    }
    
    return successFiles
  } catch (error) {
    console.error('❌ 项目材料上传失败:', error)
    message.error('项目材料上传失败')
    throw error
  }
}

/**
 * 示例4: 会议资料上传，带进度显示
 */
export const meetingMaterialUploadWithProgress = async (
  files: File[],
  onProgress?: (file: string, percent: number) => void
) => {
  const uploadService = new TechnologicalUploadService(UploadPresets.MEETING_MATERIAL)
  
  const results: UploadFileItem[] = []
  
  for (const file of files) {
    try {
      console.log(`📤 开始上传会议资料: ${file.name}`)
      
      const fileItem = uploadService.createFileItem(file)
      
      // 监听上传进度
      const originalUpload = uploadService.uploadFile.bind(uploadService)
      uploadService.uploadFile = async (item: UploadFileItem) => {
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          if (item.percent && item.percent < 90) {
            item.percent += Math.random() * 10
            onProgress?.(item.name, item.percent)
          }
        }, 200)
        
        try {
          const result = await originalUpload(item)
          clearInterval(progressInterval)
          onProgress?.(item.name, 100)
          return result
        } catch (error) {
          clearInterval(progressInterval)
          throw error
        }
      }
      
      await uploadService.uploadFile(fileItem)
      results.push(fileItem)
      
      console.log(`✅ ${file.name} 上传成功`)
      
    } catch (error) {
      console.error(`❌ ${file.name} 上传失败:`, error)
    }
  }
  
  return results
}

// ========== 特定场景使用示例 ==========

/**
 * 示例5: 图片上传，带预览功能
 */
export const imageUploadWithPreview = async (
  imageFiles: File[]
): Promise<{ url: string; preview: string; name: string }[]> => {
  const results: { url: string; preview: string; name: string }[] = []
  
  for (const file of imageFiles) {
    // 验证是否为图片
    if (!isImageFile(file.name)) {
      message.warning(`${file.name} 不是有效的图片文件`)
      continue
    }
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)
    
    try {
      console.log('🖼️ 上传图片:', file.name)
      
      const response = await uploadTechnologicalFile(file, 'images')
      
      if (response.code === 0) {
        results.push({
          url: response.data.fileUrl,
          preview: previewUrl,
          name: file.name
        })
        
        console.log(`✅ 图片 ${file.name} 上传成功`)
      }
      
    } catch (error) {
      console.error(`❌ 图片 ${file.name} 上传失败:`, error)
      URL.revokeObjectURL(previewUrl) // 清理预览URL
    }
  }
  
  if (results.length > 0) {
    message.success(`成功上传 ${results.length} 张图片`)
  }
  
  return results
}

/**
 * 示例6: 模板文件上传，带文件类型检查
 */
export const templateFileUpload = async (file: File) => {
  const allowedTypes = FileTypePresets.DOCUMENT
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    message.error(`模板文件必须是以下格式之一: ${allowedTypes.join(', ')}`)
    return null
  }
  
  if (file.size > 20 * 1024 * 1024) { // 20MB限制
    message.error('模板文件大小不能超过20MB')
    return null
  }
  
  try {
    console.log('📄 上传模板文件:', file.name)
    
    const response = await uploadTechnologicalFile(file, 'templates')
    
    if (response.code === 0) {
      console.log('✅ 模板文件上传成功:', response.data)
      message.success(`模板 ${file.name} 上传成功`)
      
      return {
        id: response.data.requirementId,
        name: response.data.fileName,
        url: response.data.fileUrl,
        size: response.data.fileSize,
        type: response.data.fileType
      }
    } else {
      throw new Error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('❌ 模板文件上传失败:', error)
    message.error(`模板上传失败: ${error.message}`)
    throw error
  }
}

// ========== 组合使用示例 ==========

/**
 * 示例7: 完整的项目提交流程
 */
export const completeProjectSubmission = async (projectData: {
  projectName: string
  description: string
  materials: File[]
  images: File[]
}) => {
  console.log('🚀 开始完整的项目提交流程')
  
  try {
    // 第一步：上传项目材料
    console.log('📁 第一步：上传项目材料...')
    const materialResults = await projectMaterialUpload(projectData.materials)
    const materialUrls = materialResults.map(item => item.response?.fileUrl).filter(Boolean)
    
    // 第二步：上传项目图片
    console.log('🖼️ 第二步：上传项目图片...')
    const imageResults = await imageUploadWithPreview(projectData.images)
    const imageUrls = imageResults.map(item => item.url)
    
    // 第三步：组装提交数据
    const submissionData = {
      projectName: projectData.projectName,
      description: projectData.description,
      materialUrls: materialUrls,
      imageUrls: imageUrls,
      submissionTime: new Date().toISOString()
    }
    
    console.log('📋 项目提交数据准备完成:', submissionData)
    
    // 这里可以调用项目提交的API
    // await submitProject(submissionData)
    
    message.success('项目提交成功！')
    
    return submissionData
    
  } catch (error) {
    console.error('❌ 项目提交失败:', error)
    message.error('项目提交失败，请重试')
    throw error
  }
}

/**
 * 示例8: 文件上传状态监控
 */
export const fileUploadMonitor = async (files: File[]) => {
  const uploadService = new TechnologicalUploadService()
  
  // 创建文件项
  const fileItems = files.map(file => uploadService.createFileItem(file))
  
  // 状态统计
  const stats = {
    total: fileItems.length,
    pending: 0,
    uploading: 0,
    success: 0,
    error: 0
  }
  
  // 更新统计信息
  const updateStats = () => {
    stats.pending = fileItems.filter(item => item.status === 'pending').length
    stats.uploading = fileItems.filter(item => item.status === 'uploading').length
    stats.success = fileItems.filter(item => item.status === 'success').length
    stats.error = fileItems.filter(item => item.status === 'error').length
    
    console.log('📊 上传状态统计:', stats)
  }
  
  // 逐个上传并监控状态
  for (const fileItem of fileItems) {
    try {
      updateStats()
      console.log(`📤 正在上传: ${fileItem.name}`)
      
      await uploadService.uploadFile(fileItem)
      
      console.log(`✅ 上传成功: ${fileItem.name}`)
      
    } catch (error) {
      console.error(`❌ 上传失败: ${fileItem.name}`, error)
    }
    
    updateStats()
  }
  
  // 最终统计
  console.log('🏁 上传完成，最终统计:', stats)
  
  if (stats.success > 0) {
    message.success(`成功上传 ${stats.success} 个文件`)
  }
  if (stats.error > 0) {
    message.warning(`有 ${stats.error} 个文件上传失败`)
  }
  
  return {
    stats,
    successFiles: fileItems.filter(item => item.status === 'success'),
    errorFiles: fileItems.filter(item => item.status === 'error')
  }
}

// ========== 导出所有示例 ==========

export default {
  simpleFileUpload,
  batchFileUpload,
  projectMaterialUpload,
  meetingMaterialUploadWithProgress,
  imageUploadWithPreview,
  templateFileUpload,
  completeProjectSubmission,
  fileUploadMonitor
}
