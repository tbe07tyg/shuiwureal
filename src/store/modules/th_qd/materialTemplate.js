/**
 * @file 材料提交模板全局状态管理
 * @description 统一管理各业务环节的材料模板配置，实现配置的集中存储和实时同步
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
 */

import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  getMaterialTemplatePage,
  getMaterialTemplate,
  createMaterialTemplate,
  updateMaterialTemplate,
  deleteMaterialTemplate,
  deleteMaterialTemplateList
} from '@/api/th_qd/material-template'
import { UseSource, IsRequired } from '@/api/th_qd/material-template/types'
// 材料模板配置状态
const materialTemplateState = reactive({
  // 各业务环节的配置数据
  configs: {
    apply: [], // 立项申请
    opening: [], // 项目开题
    midterm: [], // 项目中期
    acceptance: [] // 项目验收
  },
  
  // 加载状态
  loading: false,
  
  // 最后更新时间
  lastUpdateTime: null,
  
  // 配置版本号
  version: '1.0.0'
})

// 业务类型映射
const businessTypeMap = {
  apply: '立项申请',
  opening: '项目开题', 
  midterm: '项目中期',
  acceptance: '项目验收'
}

// 业务类型与API UseSource枚举的映射
const businessTypeToUseSource = {
  apply: UseSource.APPROVAL,    // 0 - 立项申请
  opening: UseSource.OPENING,   // 1 - 项目开题
  midterm: UseSource.MIDTERM,   // 2 - 项目中期
  acceptance: UseSource.ACCEPTANCE // 3 - 项目验收
}

// UseSource枚举到业务类型的映射
const useSourceToBusinessType = {
  [UseSource.APPROVAL]: 'apply',
  [UseSource.OPENING]: 'opening', 
  [UseSource.MIDTERM]: 'midterm',
  [UseSource.ACCEPTANCE]: 'acceptance'
}

/**
 * 数据转换函数 - 将API数据转换为前端格式
 */
const convertApiDataToFrontend = (apiItem) => {
  return {
    id: apiItem.id,
    categoryName: apiItem.categoryName,
    isRequired: apiItem.isRequired === IsRequired.REQUIRED,
    templateFileName: apiItem.categoryName + '.docx', // 基于categoryName生成文件名
    templateFilePath: apiItem.templateFilePath || '',
    sortOrder: apiItem.sort,
    description: apiItem.descriptionAndExplanation || '',
    businessType: useSourceToBusinessType[apiItem.useSource] || 'apply',
    createdAt: apiItem.createTime || new Date().toISOString(),
    updatedAt: apiItem.createTime || new Date().toISOString()
  }
}

/**
 * 数据转换函数 - 将前端数据转换为API格式
 */
const convertFrontendDataToApi = (frontendItem, businessType) => {
  return {
    id: frontendItem.id,
    categoryName: frontendItem.categoryName,
    isRequired: frontendItem.isRequired ? IsRequired.REQUIRED : IsRequired.OPTIONAL,
    sort: frontendItem.sortOrder || 1,
    templateFilePath: frontendItem.templateFilePath || '',
    descriptionAndExplanation: frontendItem.description || '',
    useSource: businessTypeToUseSource[businessType] || UseSource.APPROVAL
  }
}

/**
 * 从后端API加载指定业务类型的配置
 */
const loadConfigsFromApi = async (businessType) => {
  try {
    const useSource = businessTypeToUseSource[businessType]
    if (useSource === undefined) {
      throw new Error(`未知的业务类型: ${businessType}`)
    }
    console.log(useSource)
    const response = await getMaterialTemplatePage({
      pageNo: 1,
      pageSize: 100,
      useSource: useSource
    })
    console.log(response)
    if (response) {
      return response.list.map(convertApiDataToFrontend)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    } else {
      console.warn(`加载${businessType}配置失败:`, response.msg)
      return []
    }
  } catch (error) {
    console.error(`加载${businessType}配置异常:${error}`)
    return []
  }
}

const initDefaultConfigs = () => {
  const defaultConfigs = {
    apply: [
      {
        id: 1,
        categoryName: '项目申请书',
        isRequired: true,
        templateFileName: '项目申请书模板.docx',
        templateFilePath: '/templates/apply/project_application.docx',
        sortOrder: 1,
        description: '详细的项目申请信息，包含项目背景、目标、实施方案等',
        businessType: 'apply',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        categoryName: '可行性研究报告',
        isRequired: true,
        templateFileName: '可行性研究报告模板.docx',
        templateFilePath: '/templates/apply/feasibility_study.docx',
        sortOrder: 2,
        description: '项目技术可行性、经济可行性分析报告',
        businessType: 'apply',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    opening: [
      {
        id: 11,
        categoryName: '开题报告',
        isRequired: true,
        templateFileName: '开题报告模板.docx',
        templateFilePath: '/templates/opening/opening_report.docx',
        sortOrder: 1,
        description: '项目开题报告，说明研究方案和计划',
        businessType: 'opening',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    midterm: [
      {
        id: 21,
        categoryName: '中期报告',
        isRequired: true,
        templateFileName: '中期报告模板.docx',
        templateFilePath: '/templates/midterm/midterm_report.docx',
        sortOrder: 1,
        description: '项目中期进展报告',
        businessType: 'midterm',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    acceptance: [
      {
        id: 31,
        categoryName: '验收报告',
        isRequired: true,
        templateFileName: '验收报告模板.docx',
        templateFilePath: '/templates/acceptance/acceptance_report.docx',
        sortOrder: 1,
        description: '项目验收报告',
        businessType: 'acceptance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
  
  return defaultConfigs
}

// 页面更新监听器
const pageUpdateListeners = new Map()

/**
 * 获取指定业务类型的配置
 */
const getConfigsByBusinessType = (businessType) => {
  return materialTemplateState.configs[businessType] || []
}

/**
 * 获取所有配置的统计信息
 */
const getConfigsStats = computed(() => {
  const stats = {}
  Object.keys(materialTemplateState.configs).forEach(businessType => {
    const configs = materialTemplateState.configs[businessType] || []
    stats[businessType] = {
      total: configs.length,
      required: configs.filter(item => item.isRequired).length,
      optional: configs.filter(item => !item.isRequired).length
    }
  })
  return stats
})

/**
 * 从本地存储加载配置
 */
const loadConfigsFromStorage = () => {
  try {
    const stored = localStorage.getItem('materialTemplateConfigs')
    if (stored) {
      const parsed = JSON.parse(stored)
      materialTemplateState.configs = parsed.configs || {}
      materialTemplateState.version = parsed.version || '1.0.0'
      materialTemplateState.lastUpdateTime = parsed.lastUpdateTime
      return true
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
  return false
}

/**
 * 保存配置到本地存储
 */
const saveConfigsToStorage = () => {
  try {
    const configData = {
      configs: materialTemplateState.configs,
      version: materialTemplateState.version,
      lastUpdateTime: materialTemplateState.lastUpdateTime
    }
    localStorage.setItem('materialTemplateConfigs', JSON.stringify(configData))
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    return false
  }
}

/**
 * 初始化配置数据 - 从API加载所有业务类型的配置
 */
const initConfigs = async () => {
  materialTemplateState.loading = true
  
  try {
    console.log('🔄 开始从API加载材料模板配置...')
    
    // 并行加载所有业务类型的配置
    const [applyConfigs, openingConfigs, midtermConfigs, acceptanceConfigs] = await Promise.all([
      loadConfigsFromApi('apply'),
      loadConfigsFromApi('opening'),
      loadConfigsFromApi('midterm'),
      loadConfigsFromApi('acceptance')
    ])
    
    // 更新状态
    materialTemplateState.configs = {
      apply: applyConfigs,
      opening: openingConfigs,
      midterm: midtermConfigs,
      acceptance: acceptanceConfigs
    }
    
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    console.log('✅ 配置加载成功:', {
      apply: applyConfigs.length,
      opening: openingConfigs.length,
      midterm: midtermConfigs.length,
      acceptance: acceptanceConfigs.length
    })
    
    message.success('配置加载成功')
  } catch (error) {
    console.error('❌ 初始化配置失败:', error)
    message.error('配置加载失败')
    
    // 如果API加载失败，使用默认配置作为备用
    materialTemplateState.configs = initDefaultConfigs()
    materialTemplateState.lastUpdateTime = new Date().toISOString()
  } finally {
    materialTemplateState.loading = false
  }
}

/**
 * 刷新指定业务类型的配置
 */
const refreshConfigsByBusinessType = async (businessType) => {
  try {
    console.log(`🔄 刷新${businessType}配置...`)
    const configs = await loadConfigsFromApi(businessType)
    materialTemplateState.configs[businessType] = configs
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 通知相关页面更新
    notifyBusinessPageUpdate(businessType)
    
    console.log(`✅ ${businessType}配置刷新成功，共${configs.length}项`)
    return configs
  } catch (error) {
    console.error(`❌ 刷新${businessType}配置失败:`, error)
    throw error
  }
}

/**
 * 添加新配置 - 调用后端API创建
 */
const addConfig = async (businessType, configData) => {
  try {
    console.log(`➕ 创建${businessType}配置:`, configData)
    
    // 转换为API格式
    const apiData = convertFrontendDataToApi(configData, businessType)
    delete apiData.id // 创建时不需要ID
    
    // 调用后端API创建
    const response = await createMaterialTemplate(apiData)
    console.log(response)
    if (response) {
      console.log('✅ 后端创建成功，ID:', response.data)
      
      // 刷新该业务类型的配置列表
      await refreshConfigsByBusinessType(businessType)
      
      message.success('添加配置成功')
      
      // 返回创建成功的配置（从最新列表中找到）
      const configs = materialTemplateState.configs[businessType] || []
      const newConfig = configs.find(config => config.id === response.data)
      return newConfig || configs[configs.length - 1]
    } else {
      throw new Error(response.msg || '创建失败')
    }
  } catch (error) {
    console.error('❌ 添加配置失败:', error)
    message.error(`添加配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 更新配置 - 调用后端API更新
 */
const updateConfig = async (businessType, configId, configData) => {
  try {
    console.log(`✏️ 更新${businessType}配置 ID:${configId}:`, configData)
    
    // 找到当前配置
    const configs = materialTemplateState.configs[businessType] || []
    const currentConfig = configs.find(item => item.id === configId)
    
    if (!currentConfig) {
      throw new Error('配置项不存在')
    }
    
    // 合并配置数据并转换为API格式
    const mergedConfig = { ...currentConfig, ...configData }
    const apiData = convertFrontendDataToApi(mergedConfig, businessType)
    console.log(apiData)
    // 调用后端API更新
    const response = await updateMaterialTemplate(apiData)
    console.log(response)
    if (response) {
      console.log('✅ 后端更新成功')
      
      // 刷新该业务类型的配置列表
      await refreshConfigsByBusinessType(businessType)
      
      message.success('更新配置成功')
      
      // 返回更新后的配置
      const updatedConfigs = materialTemplateState.configs[businessType] || []
      const updatedConfig = updatedConfigs.find(config => config.id === configId)
      return updatedConfig
    } else {
      throw new Error(response.msg || '更新失败')
    }
  } catch (error) {
    console.error('❌ 更新配置失败:', error)
    message.error(`更新配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 删除配置 - 调用后端API删除
 */
const deleteConfig = async (businessType, configId) => {
  try {
    console.log(`🗑️ 删除${businessType}配置 ID:${configId}`)
    
    // 检查配置是否存在
    const configs = materialTemplateState.configs[businessType] || []
    const configExists = configs.find(item => item.id === configId)
    
    if (!configExists) {
      throw new Error('配置项不存在')
    }
    
    // 调用后端API删除
    const response = await deleteMaterialTemplate(configId)
    
    if (response) {
      console.log(response)
      console.log('✅ 后端删除成功')
      
      // 刷新该业务类型的配置列表
      await refreshConfigsByBusinessType(businessType)
      
      message.success('删除配置成功')
      return true
    } else {
      throw new Error(response.msg || '删除失败')
    }
  } catch (error) {
    console.error('❌ 删除配置失败:', error)
    message.error(`删除配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 批量更新配置 - 逐个调用后端API更新
 */
const batchUpdateConfigs = async (businessType, configsList) => {
  try {
    console.log(`📝 批量更新${businessType}配置，共${configsList.length}项`)
    
    // 逐个更新配置
    const updatePromises = configsList.map(async (config) => {
      const apiData = convertFrontendDataToApi(config, businessType)
      return updateMaterialTemplate(apiData)
    })
    
    const results = await Promise.allSettled(updatePromises)
    
    // 检查结果
    const failedCount = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && result.value.code !== 0)
    ).length
    
    if (failedCount === 0) {
      console.log('✅ 批量更新全部成功')
      
      // 刷新该业务类型的配置列表
      await refreshConfigsByBusinessType(businessType)
      
      message.success('批量更新配置成功')
      return true
    } else {
      console.warn(`⚠️ 批量更新部分失败，失败数量: ${failedCount}`)
      
      // 仍然刷新列表，获取最新状态
      await refreshConfigsByBusinessType(businessType)
      
      message.warning(`批量更新完成，但有${failedCount}项更新失败`)
      return false
    }
  } catch (error) {
    console.error('❌ 批量更新配置失败:', error)
    message.error(`批量更新配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 批量删除配置 - 调用后端API批量删除
 */
const batchDeleteConfigs = async (businessType, configIds) => {
  try {
    console.log(`🗑️ 批量删除${businessType}配置，共${configIds.length}项`)
    
    // 调用后端API批量删除
    const response = await deleteMaterialTemplateList(configIds)
    
    if (response) {
      console.log('✅ 批量删除成功')
      
      // 刷新该业务类型的配置列表
      await refreshConfigsByBusinessType(businessType)
      
      message.success('批量删除配置成功')
      return true
    } else {
      throw new Error(response.msg || '批量删除失败')
    }
  } catch (error) {
    console.error('❌ 批量删除配置失败:', error)
    message.error(`批量删除配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 重置为默认配置 - 刷新指定业务类型或所有配置
 */
const resetToDefault = async (businessType) => {
  try {
    console.log(`🔄 重置${businessType || '所有'}配置为默认状态`)
    
    if (businessType) {
      // 重置指定业务类型 - 重新从API加载
      await refreshConfigsByBusinessType(businessType)
    } else {
      // 重置所有配置 - 重新初始化
      await initConfigs()
    }
    
    message.success('重置配置成功')
    return true
  } catch (error) {
    console.error('❌ 重置配置失败:', error)
    message.error(`重置配置失败: ${error.message}`)
    throw error
  }
}

/**
 * 通知业务页面更新
 */
const notifyBusinessPageUpdate = (businessType) => {
  const listeners = pageUpdateListeners.get(businessType)
  if (listeners && listeners.size > 0) {
    const configs = getConfigsByBusinessType(businessType)
    listeners.forEach(callback => {
      try {
        callback(configs, businessType)
      } catch (error) {
        console.error('页面更新回调执行失败:', error)
      }
    })
  }
}

/**
 * 注册页面更新监听器
 */
const registerPageUpdateListener = (businessType, callback) => {
  if (!pageUpdateListeners.has(businessType)) {
    pageUpdateListeners.set(businessType, new Set())
  }
  pageUpdateListeners.get(businessType).add(callback)
  
  // 返回取消注册的函数
  return () => {
    const listeners = pageUpdateListeners.get(businessType)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        pageUpdateListeners.delete(businessType)
      }
    }
  }
}

/**
 * 使用Pinia风格导出store
 */
export const useMaterialTemplateStore = () => {
  return {
    // 状态
    state: materialTemplateState,
    businessTypeMap,
    businessTypeToUseSource,
    useSourceToBusinessType,
    
    // 计算属性
    getConfigsStats,
    
    // 初始化方法
    initConfigs,
    
    // CRUD方法
    getConfigsByBusinessType,
    addConfig,
    updateConfig,
    deleteConfig,
    batchUpdateConfigs,
    batchDeleteConfigs,
    resetToDefault,
    
    // 刷新方法
    refreshConfigsByBusinessType,
    loadConfigsFromApi,
    
    // 数据转换方法
    convertApiDataToFrontend,
    convertFrontendDataToApi,
    
    // 页面同步方法
    registerPageUpdateListener,
    notifyBusinessPageUpdate,
    
    // 存储方法（保留用于备用）
    saveConfigsToStorage,
    loadConfigsFromStorage
  }
}
