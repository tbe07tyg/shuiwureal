/**
 * 材料模板 API 测试示例
 * 
 * 演示如何使用材料模板 API 接口
 * 可用于开发调试和功能验证
 */

import {
  getMaterialTemplatePage,
  getMaterialTemplate,
  createMaterialTemplate,
  updateMaterialTemplate,
  deleteMaterialTemplate,
  getMaterialTemplatesByUseSource,
  getAllMaterialTemplatesGrouped,
  getMaterialTemplateStats,
  copyMaterialTemplateToUseSource,
  batchUpdateMaterialTemplateSort,
  getUseSourceName,
  getIsRequiredName,
  getUseSourceOptions,
  getIsRequiredOptions
} from './index'
import { UseSource, IsRequired } from './types'
import type { TechnologicalMaterialTemplateSaveReqVO } from './types'

// ========== 基础 CRUD 测试 ==========

/**
 * 测试分页查询
 */
export const testGetMaterialTemplatePage = async () => {
  console.log('🔍 测试分页查询材料模板...')
  
  try {
    const response = await getMaterialTemplatePage({
      pageNo: 1,
      pageSize: 10,
      useSource: UseSource.APPROVAL
    })
    
    if (response.code === 0) {
      console.log('✅ 分页查询成功:', {
        总数: response.data.total,
        当前页数据: response.data.list.length,
        数据预览: response.data.list.slice(0, 2)
      })
      return response.data
    } else {
      console.error('❌ 分页查询失败:', response.msg)
      return null
    }
  } catch (error) {
    console.error('❌ 分页查询异常:', error)
    return null
  }
}

/**
 * 测试创建材料模板
 */
export const testCreateMaterialTemplate = async () => {
  console.log('➕ 测试创建材料模板...')
  
  const testTemplate: TechnologicalMaterialTemplateSaveReqVO = {
    categoryName: `测试模板_${Date.now()}`,
    isRequired: IsRequired.REQUIRED,
    sort: 999,
    descriptionAndExplanation: '这是一个测试用的材料模板',
    useSource: UseSource.APPROVAL,
    templateFilePath: '/templates/test_template.pdf'
  }
  
  try {
    const response = await createMaterialTemplate(testTemplate)
    
    if (response.code === 0) {
      console.log('✅ 创建模板成功，ID:', response.data)
      return response.data
    } else {
      console.error('❌ 创建模板失败:', response.msg)
      return null
    }
  } catch (error) {
    console.error('❌ 创建模板异常:', error)
    return null
  }
}

/**
 * 测试获取模板详情
 */
export const testGetMaterialTemplate = async (templateId: number) => {
  console.log(`🔍 测试获取模板详情 (ID: ${templateId})...`)
  
  try {
    const response = await getMaterialTemplate(templateId)
    
    if (response.code === 0) {
      console.log('✅ 获取详情成功:', response.data)
      return response.data
    } else {
      console.error('❌ 获取详情失败:', response.msg)
      return null
    }
  } catch (error) {
    console.error('❌ 获取详情异常:', error)
    return null
  }
}

/**
 * 测试更新材料模板
 */
export const testUpdateMaterialTemplate = async (templateId: number) => {
  console.log(`✏️ 测试更新材料模板 (ID: ${templateId})...`)
  
  // 先获取现有模板
  const currentTemplate = await testGetMaterialTemplate(templateId)
  if (!currentTemplate) {
    console.error('❌ 无法获取当前模板，更新测试终止')
    return false
  }
  
  const updateData: TechnologicalMaterialTemplateSaveReqVO = {
    id: templateId,
    categoryName: `${currentTemplate.categoryName}_更新`,
    isRequired: currentTemplate.isRequired,
    sort: currentTemplate.sort,
    descriptionAndExplanation: `${currentTemplate.descriptionAndExplanation || ''} [已更新]`,
    useSource: currentTemplate.useSource,
    templateFilePath: currentTemplate.templateFilePath
  }
  
  try {
    const response = await updateMaterialTemplate(updateData)
    
    if (response.code === 0) {
      console.log('✅ 更新模板成功')
      return true
    } else {
      console.error('❌ 更新模板失败:', response.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 更新模板异常:', error)
    return false
  }
}

/**
 * 测试删除材料模板
 */
export const testDeleteMaterialTemplate = async (templateId: number) => {
  console.log(`🗑️ 测试删除材料模板 (ID: ${templateId})...`)
  
  try {
    const response = await deleteMaterialTemplate(templateId)
    
    if (response.code === 0) {
      console.log('✅ 删除模板成功')
      return true
    } else {
      console.error('❌ 删除模板失败:', response.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 删除模板异常:', error)
    return false
  }
}

// ========== 业务功能测试 ==========

/**
 * 测试根据使用源获取模板
 */
export const testGetMaterialTemplatesByUseSource = async () => {
  console.log('📋 测试根据使用源获取模板...')
  
  try {
    const approvalTemplates = await getMaterialTemplatesByUseSource(UseSource.APPROVAL)
    const openingTemplates = await getMaterialTemplatesByUseSource(UseSource.OPENING, false) // 只获取必传
    
    console.log('✅ 使用源模板获取成功:', {
      立项申请模板数量: approvalTemplates.length,
      开题必传模板数量: openingTemplates.length,
      立项申请预览: approvalTemplates.slice(0, 2),
      开题必传预览: openingTemplates.slice(0, 2)
    })
    
    return { approvalTemplates, openingTemplates }
  } catch (error) {
    console.error('❌ 获取使用源模板异常:', error)
    return null
  }
}

/**
 * 测试获取所有分组模板
 */
export const testGetAllMaterialTemplatesGrouped = async () => {
  console.log('📊 测试获取所有分组模板...')
  
  try {
    const groupedTemplates = await getAllMaterialTemplatesGrouped()
    
    console.log('✅ 分组模板获取成功:', {
      立项申请: groupedTemplates[UseSource.APPROVAL].length,
      项目开题: groupedTemplates[UseSource.OPENING].length,
      项目中期: groupedTemplates[UseSource.MIDTERM].length,
      项目验收: groupedTemplates[UseSource.ACCEPTANCE].length
    })
    
    return groupedTemplates
  } catch (error) {
    console.error('❌ 获取分组模板异常:', error)
    return null
  }
}

/**
 * 测试获取统计信息
 */
export const testGetMaterialTemplateStats = async () => {
  console.log('📈 测试获取统计信息...')
  
  try {
    const stats = await getMaterialTemplateStats()
    
    console.log('✅ 统计信息获取成功:', {
      总模板数: stats.total,
      必传模板数: stats.requiredCount,
      可选模板数: stats.optionalCount,
      各使用源分布: {
        立项申请: stats.byUseSource[UseSource.APPROVAL],
        项目开题: stats.byUseSource[UseSource.OPENING],
        项目中期: stats.byUseSource[UseSource.MIDTERM],
        项目验收: stats.byUseSource[UseSource.ACCEPTANCE]
      }
    })
    
    return stats
  } catch (error) {
    console.error('❌ 获取统计信息异常:', error)
    return null
  }
}

/**
 * 测试复制模板到其他使用源
 */
export const testCopyMaterialTemplateToUseSource = async (sourceTemplateId: number) => {
  console.log(`📋 测试复制模板到其他使用源 (源ID: ${sourceTemplateId})...`)
  
  try {
    const success = await copyMaterialTemplateToUseSource(sourceTemplateId, UseSource.OPENING)
    
    if (success) {
      console.log('✅ 模板复制成功')
      return true
    } else {
      console.error('❌ 模板复制失败')
      return false
    }
  } catch (error) {
    console.error('❌ 模板复制异常:', error)
    return false
  }
}

/**
 * 测试批量更新排序
 */
export const testBatchUpdateMaterialTemplateSort = async () => {
  console.log('🔢 测试批量更新排序...')
  
  // 先获取一些模板进行排序测试
  const pageData = await testGetMaterialTemplatePage()
  if (!pageData || pageData.list.length < 2) {
    console.log('⚠️ 模板数量不足，跳过排序测试')
    return false
  }
  
  const templates = pageData.list.slice(0, 2)
  const sortData = templates.map((template, index) => ({
    id: template.id,
    sort: template.sort + 10 + index // 新的排序值
  }))
  
  try {
    const success = await batchUpdateMaterialTemplateSort(sortData)
    
    if (success) {
      console.log('✅ 批量排序更新成功')
      return true
    } else {
      console.error('❌ 批量排序更新失败')
      return false
    }
  } catch (error) {
    console.error('❌ 批量排序更新异常:', error)
    return false
  }
}

// ========== 工具函数测试 ==========

/**
 * 测试工具函数
 */
export const testUtilityFunctions = () => {
  console.log('🔧 测试工具函数...')
  
  console.log('使用源名称映射:')
  Object.values(UseSource).forEach(useSource => {
    if (typeof useSource === 'number') {
      console.log(`  ${useSource}: ${getUseSourceName(useSource)}`)
    }
  })
  
  console.log('是否必传名称映射:')
  Object.values(IsRequired).forEach(isRequired => {
    if (typeof isRequired === 'number') {
      console.log(`  ${isRequired}: ${getIsRequiredName(isRequired)}`)
    }
  })
  
  console.log('使用源选项:', getUseSourceOptions())
  console.log('是否必传选项:', getIsRequiredOptions())
  
  console.log('✅ 工具函数测试完成')
}

// ========== 完整测试流程 ==========

/**
 * 运行完整的测试流程
 */
export const runCompleteTest = async () => {
  console.log('🚀 开始完整测试流程...')
  console.log('=' + '='.repeat(50))
  
  try {
    // 1. 测试查询功能
    console.log('\n📌 第一阶段：查询功能测试')
    await testGetMaterialTemplatePage()
    await testGetMaterialTemplatesByUseSource()
    await testGetAllMaterialTemplatesGrouped()
    await testGetMaterialTemplateStats()
    
    // 2. 测试创建功能
    console.log('\n📌 第二阶段：创建功能测试')
    const newTemplateId = await testCreateMaterialTemplate()
    
    if (newTemplateId) {
      // 3. 测试详情和更新功能
      console.log('\n📌 第三阶段：详情和更新功能测试')
      await testGetMaterialTemplate(newTemplateId)
      await testUpdateMaterialTemplate(newTemplateId)
      
      // 4. 测试复制功能
      console.log('\n📌 第四阶段：复制功能测试')
      await testCopyMaterialTemplateToUseSource(newTemplateId)
      
      // 5. 测试删除功能
      console.log('\n📌 第五阶段：删除功能测试')
      await testDeleteMaterialTemplate(newTemplateId)
    }
    
    // 6. 测试批量操作
    console.log('\n📌 第六阶段：批量操作测试')
    await testBatchUpdateMaterialTemplateSort()
    
    // 7. 测试工具函数
    console.log('\n📌 第七阶段：工具函数测试')
    testUtilityFunctions()
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 完整测试流程执行完毕！')
    
  } catch (error) {
    console.error('\n❌ 测试流程异常:', error)
  }
}

// ========== 快速连接测试 ==========

/**
 * 快速连接测试
 * 验证API是否可用
 */
export const quickConnectionTest = async () => {
  console.log('⚡ 快速连接测试...')
  
  try {
    const response = await getMaterialTemplatePage({
      pageNo: 1,
      pageSize: 1
    })
    
    if (response && typeof response === 'object') {
      if (response.code === 0) {
        console.log('✅ API连接正常，返回数据正常')
        return true
      } else {
        console.log(`⚠️ API连接正常，但返回业务错误: ${response.msg}`)
        return false
      }
    } else {
      console.log('❌ API返回数据格式异常')
      return false
    }
  } catch (error) {
    console.error('❌ API连接异常:', error)
    return false
  }
}

// 默认导出快速测试函数
export default {
  quickConnectionTest,
  runCompleteTest,
  testGetMaterialTemplatePage,
  testCreateMaterialTemplate,
  testGetMaterialTemplate,
  testUpdateMaterialTemplate,
  testDeleteMaterialTemplate,
  testGetMaterialTemplatesByUseSource,
  testGetAllMaterialTemplatesGrouped,
  testGetMaterialTemplateStats,
  testCopyMaterialTemplateToUseSource,
  testBatchUpdateMaterialTemplateSort,
  testUtilityFunctions
}