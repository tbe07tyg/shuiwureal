/**
 * 材料模板状态管理
 * 
 * 使用Pinia管理材料模板的全局状态
 * 提供缓存、批量操作、状态同步等功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  TechnologicalMaterialTemplateRespVO,
  TechnologicalMaterialTemplateSaveReqVO,
  MaterialTemplateConfig,
  GroupedTemplateConfig,
  MaterialTemplateStats,
  UseSource,
  IsRequired
} from '@/api/th_qd/material-template/types'
import {
  getMaterialTemplatePage,
  getMaterialTemplate,
  createMaterialTemplate,
  updateMaterialTemplate,
  deleteMaterialTemplate,
  deleteMaterialTemplateList,
  getMaterialTemplatesByUseSource,
  getAllMaterialTemplatesGrouped,
  getMaterialTemplateStats,
  copyMaterialTemplateToUseSource,
  batchUpdateMaterialTemplateSort,
  getUseSourceName,
  getIsRequiredName
} from '@/api/th_qd/material-template'

export const useMaterialTemplateStore = defineStore('th_qd_material_template', () => {
  // ========== 状态数据 ==========
  
  // 模板列表数据
  const templateList = ref<TechnologicalMaterialTemplateRespVO[]>([])
  
  // 分组模板配置
  const groupedTemplates = ref<GroupedTemplateConfig>({
    [UseSource.APPROVAL]: [],
    [UseSource.OPENING]: [],
    [UseSource.MIDTERM]: [],
    [UseSource.ACCEPTANCE]: []
  })
  
  // 统计信息
  const stats = ref<MaterialTemplateStats>({
    total: 0,
    requiredCount: 0,
    optionalCount: 0,
    byUseSource: {
      [UseSource.APPROVAL]: 0,
      [UseSource.OPENING]: 0,
      [UseSource.MIDTERM]: 0,
      [UseSource.ACCEPTANCE]: 0
    }
  })
  
  // 当前选中的模板
  const currentTemplate = ref<TechnologicalMaterialTemplateRespVO | null>(null)
  
  // 加载状态
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)
  
  // 分页信息
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  // 查询条件
  const queryParams = ref({
    categoryName: '',
    isRequired: undefined as IsRequired | undefined,
    useSource: undefined as UseSource | undefined,
    createTime: undefined as string[] | undefined
  })
  
  // 缓存时间戳
  const cacheTimestamp = ref<Record<string, number>>({})
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
  
  // ========== 计算属性 ==========
  
  /**
   * 按使用源分组的模板列表
   */
  const templatesByUseSource = computed(() => {
    const grouped: Record<UseSource, TechnologicalMaterialTemplateRespVO[]> = {
      [UseSource.APPROVAL]: [],
      [UseSource.OPENING]: [],
      [UseSource.MIDTERM]: [],
      [UseSource.ACCEPTANCE]: []
    }
    
    templateList.value.forEach(template => {
      grouped[template.useSource].push(template)
    })
    
    // 按排序字段排序
    Object.keys(grouped).forEach(key => {
      grouped[Number(key) as UseSource].sort((a, b) => a.sort - b.sort)
    })
    
    return grouped
  })
  
  /**
   * 必传模板列表
   */
  const requiredTemplates = computed(() => {
    return templateList.value.filter(template => template.isRequired === IsRequired.REQUIRED)
  })
  
  /**
   * 可选模板列表
   */
  const optionalTemplates = computed(() => {
    return templateList.value.filter(template => template.isRequired === IsRequired.OPTIONAL)
  })
  
  /**
   * 是否有数据
   */
  const hasData = computed(() => templateList.value.length > 0)
  
  /**
   * 是否正在操作
   */
  const isOperating = computed(() => creating.value || updating.value || deleting.value)
  
  // ========== 操作方法 ==========
  
  /**
   * 加载模板列表
   */
  const loadTemplateList = async (params: any = {}) => {
    try {
      loading.value = true
      
      const queryData = {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...queryParams.value,
        ...params
      }
      
      const response = await getMaterialTemplatePage(queryData)
      
      if (response.code === 0 && response.data) {
        templateList.value = response.data.list
        pagination.value.total = response.data.total
        
        // 更新缓存时间戳
        const cacheKey = `list_${JSON.stringify(queryData)}`
        cacheTimestamp.value[cacheKey] = Date.now()
        
        return true
      } else {
        console.warn('加载模板列表失败:', response.msg)
        return false
      }
    } catch (error) {
      console.error('加载模板列表异常:', error)
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 加载模板详情
   */
  const loadTemplateDetail = async (id: number) => {
    try {
      loading.value = true
      
      const response = await getMaterialTemplate(id)
      
      if (response.code === 0 && response.data) {
        currentTemplate.value = response.data
        return response.data
      } else {
        console.warn('加载模板详情失败:', response.msg)
        return null
      }
    } catch (error) {
      console.error('加载模板详情异常:', error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建模板
   */
  const createTemplateAction = async (data: TechnologicalMaterialTemplateSaveReqVO) => {
    try {
      creating.value = true
      
      const response = await createMaterialTemplate(data)
      
      if (response.code === 0) {
        // 重新加载列表
        await loadTemplateList()
        await loadStats()
        await loadGroupedTemplates()
        
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('创建模板异常:', error)
      return { success: false, message: '创建失败' }
    } finally {
      creating.value = false
    }
  }
  
  /**
   * 更新模板
   */
  const updateTemplateAction = async (data: TechnologicalMaterialTemplateSaveReqVO) => {
    try {
      updating.value = true
      
      const response = await updateMaterialTemplate(data)
      
      if (response.code === 0) {
        // 更新列表中的对应项
        const index = templateList.value.findIndex(item => item.id === data.id)
        if (index > -1 && data.id) {
          const updatedTemplate = await getMaterialTemplate(data.id)
          if (updatedTemplate.code === 0 && updatedTemplate.data) {
            templateList.value[index] = updatedTemplate.data
          }
        }
        
        // 更新当前模板
        if (currentTemplate.value && currentTemplate.value.id === data.id) {
          if (data.id) {
            const updatedTemplate = await getMaterialTemplate(data.id)
            if (updatedTemplate.code === 0 && updatedTemplate.data) {
              currentTemplate.value = updatedTemplate.data
            }
          }
        }
        
        await loadStats()
        await loadGroupedTemplates()
        
        return { success: true }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('更新模板异常:', error)
      return { success: false, message: '更新失败' }
    } finally {
      updating.value = false
    }
  }
  
  /**
   * 删除模板
   */
  const deleteTemplateAction = async (id: number) => {
    try {
      deleting.value = true
      
      const response = await deleteMaterialTemplate(id)
      
      if (response.code === 0) {
        // 从列表中移除
        const index = templateList.value.findIndex(item => item.id === id)
        if (index > -1) {
          templateList.value.splice(index, 1)
          pagination.value.total -= 1
        }
        
        // 清除当前模板
        if (currentTemplate.value && currentTemplate.value.id === id) {
          currentTemplate.value = null
        }
        
        await loadStats()
        await loadGroupedTemplates()
        
        return { success: true }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('删除模板异常:', error)
      return { success: false, message: '删除失败' }
    } finally {
      deleting.value = false
    }
  }
  
  /**
   * 批量删除模板
   */
  const batchDeleteTemplatesAction = async (ids: number[]) => {
    try {
      deleting.value = true
      
      const response = await deleteMaterialTemplateList(ids)
      
      if (response.code === 0) {
        // 从列表中移除
        templateList.value = templateList.value.filter(item => !ids.includes(item.id))
        pagination.value.total -= ids.length
        
        // 清除当前模板如果被删除
        if (currentTemplate.value && ids.includes(currentTemplate.value.id)) {
          currentTemplate.value = null
        }
        
        await loadStats()
        await loadGroupedTemplates()
        
        return { success: true }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('批量删除模板异常:', error)
      return { success: false, message: '批量删除失败' }
    } finally {
      deleting.value = false
    }
  }
  
  /**
   * 加载分组模板配置
   */
  const loadGroupedTemplates = async () => {
    try {
      const cacheKey = 'grouped_templates'
      const lastCacheTime = cacheTimestamp.value[cacheKey] || 0
      
      // 检查缓存是否有效
      if (Date.now() - lastCacheTime < CACHE_DURATION) {
        return groupedTemplates.value
      }
      
      const templates = await getAllMaterialTemplatesGrouped()
      groupedTemplates.value = templates
      
      cacheTimestamp.value[cacheKey] = Date.now()
      
      return templates
    } catch (error) {
      console.error('加载分组模板配置异常:', error)
      return groupedTemplates.value
    }
  }
  
  /**
   * 加载统计信息
   */
  const loadStats = async () => {
    try {
      const cacheKey = 'stats'
      const lastCacheTime = cacheTimestamp.value[cacheKey] || 0
      
      // 检查缓存是否有效
      if (Date.now() - lastCacheTime < CACHE_DURATION) {
        return stats.value
      }
      
      const templateStats = await getMaterialTemplateStats()
      stats.value = templateStats
      
      cacheTimestamp.value[cacheKey] = Date.now()
      
      return templateStats
    } catch (error) {
      console.error('加载统计信息异常:', error)
      return stats.value
    }
  }
  
  /**
   * 根据使用源获取模板配置
   */
  const getTemplatesByUseSource = async (useSource: UseSource, includeOptional: boolean = true) => {
    try {
      const cacheKey = `use_source_${useSource}_${includeOptional}`
      const lastCacheTime = cacheTimestamp.value[cacheKey] || 0
      
      // 检查缓存是否有效
      if (Date.now() - lastCacheTime < CACHE_DURATION) {
        return groupedTemplates.value[useSource] || []
      }
      
      const templates = await getMaterialTemplatesByUseSource(useSource, includeOptional)
      
      cacheTimestamp.value[cacheKey] = Date.now()
      
      return templates
    } catch (error) {
      console.error('获取使用源模板异常:', error)
      return []
    }
  }
  
  /**
   * 复制模板到其他使用源
   */
  const copyTemplateToUseSource = async (templateId: number, targetUseSource: UseSource) => {
    try {
      const success = await copyMaterialTemplateToUseSource(templateId, targetUseSource)
      
      if (success) {
        // 重新加载相关数据
        await loadTemplateList()
        await loadStats()
        await loadGroupedTemplates()
        
        return { success: true }
      } else {
        return { success: false, message: '复制失败' }
      }
    } catch (error) {
      console.error('复制模板异常:', error)
      return { success: false, message: '复制异常' }
    }
  }
  
  /**
   * 批量更新排序
   */
  const batchUpdateSort = async (sortData: Array<{ id: number; sort: number }>) => {
    try {
      const success = await batchUpdateMaterialTemplateSort(sortData)
      
      if (success) {
        // 重新加载列表
        await loadTemplateList()
        await loadGroupedTemplates()
        
        return { success: true }
      } else {
        return { success: false, message: '排序更新失败' }
      }
    } catch (error) {
      console.error('批量更新排序异常:', error)
      return { success: false, message: '排序更新异常' }
    }
  }
  
  /**
   * 设置查询参数
   */
  const setQueryParams = (params: Partial<typeof queryParams.value>) => {
    queryParams.value = { ...queryParams.value, ...params }
  }
  
  /**
   * 重置查询参数
   */
  const resetQueryParams = () => {
    queryParams.value = {
      categoryName: '',
      isRequired: undefined,
      useSource: undefined,
      createTime: undefined
    }
  }
  
  /**
   * 设置分页参数
   */
  const setPagination = (params: Partial<typeof pagination.value>) => {
    pagination.value = { ...pagination.value, ...params }
  }
  
  /**
   * 清除缓存
   */
  const clearCache = () => {
    cacheTimestamp.value = {}
  }
  
  /**
   * 重置状态
   */
  const resetState = () => {
    templateList.value = []
    currentTemplate.value = null
    groupedTemplates.value = {
      [UseSource.APPROVAL]: [],
      [UseSource.OPENING]: [],
      [UseSource.MIDTERM]: [],
      [UseSource.ACCEPTANCE]: []
    }
    stats.value = {
      total: 0,
      requiredCount: 0,
      optionalCount: 0,
      byUseSource: {
        [UseSource.APPROVAL]: 0,
        [UseSource.OPENING]: 0,
        [UseSource.MIDTERM]: 0,
        [UseSource.ACCEPTANCE]: 0
      }
    }
    pagination.value = {
      current: 1,
      pageSize: 10,
      total: 0
    }
    resetQueryParams()
    clearCache()
  }
  
  // ========== 工具方法 ==========
  
  /**
   * 获取使用源名称
   */
  const getUseSourceDisplayName = getUseSourceName
  
  /**
   * 获取是否必传名称
   */
  const getIsRequiredDisplayName = getIsRequiredName
  
  return {
    // 状态
    templateList,
    groupedTemplates,
    stats,
    currentTemplate,
    loading,
    creating,
    updating,
    deleting,
    pagination,
    queryParams,
    
    // 计算属性
    templatesByUseSource,
    requiredTemplates,
    optionalTemplates,
    hasData,
    isOperating,
    
    // 操作方法
    loadTemplateList,
    loadTemplateDetail,
    createTemplateAction,
    updateTemplateAction,
    deleteTemplateAction,
    batchDeleteTemplatesAction,
    loadGroupedTemplates,
    loadStats,
    getTemplatesByUseSource,
    copyTemplateToUseSource,
    batchUpdateSort,
    
    // 参数设置
    setQueryParams,
    resetQueryParams,
    setPagination,
    
    // 状态管理
    clearCache,
    resetState,
    
    // 工具方法
    getUseSourceDisplayName,
    getIsRequiredDisplayName
  }
})