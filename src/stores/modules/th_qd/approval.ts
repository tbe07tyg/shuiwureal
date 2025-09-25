import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTechnologicalProjectPage,
  getTechnologicalProject,
  createTechnologicalProject,
  updateTechnologicalProject,
  deleteTechnologicalProject,
  deleteTechnologicalProjectList,
  submitTechnologicalProject,
  approveProjectMaterial,
  rejectProjectMaterial,
  approveProject,
  rejectProject,
  getTechnologicalMeetingPage,
  getTechnologicalRectificationPage,
  getTechnologicalProjectTimelinePage
} from '@/api/th_qd/approval'
import {
  TechnologicalProjectRespVO,
  TechnologicalProjectSaveReqVO,
  TechnologicalProjectPageReqVO,
  TechnologicalMeetingRespVO,
  TechnologicalRectificationRespVO,
  TechnologicalProjectTimelineRespVO,
  ProjectStatus,
  MaterialReviewResult
} from '@/api/th_qd/approval/types'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useApprovalStore = defineStore('th_qd_approval', () => {
  // ========== 状态定义 ==========
  
  // 项目列表数据
  const projectList = ref<TechnologicalProjectRespVO[]>([])
  const projectTotal = ref(0)
  const projectLoading = ref(false)
  
  // 当前选中的项目
  const currentProject = ref<TechnologicalProjectRespVO | null>(null)
  const currentProjectLoading = ref(false)
  
  // 相关数据
  const projectMeetings = ref<TechnologicalMeetingRespVO[]>([])
  const projectRectifications = ref<TechnologicalRectificationRespVO[]>([])
  const projectTimeline = ref<TechnologicalProjectTimelineRespVO[]>([])
  
  // 查询条件
  const searchParams = ref<TechnologicalProjectPageReqVO>({
    pageNo: 1,
    pageSize: 10
  })

  // ========== 计算属性 ==========
  
  // 项目状态标签映射
  const projectStatusLabels = computed(() => ({
    [ProjectStatus.DRAFT]: '草稿',
    [ProjectStatus.MATERIAL_REVIEWING]: '材料审核中',
    [ProjectStatus.MATERIAL_REJECTED]: '材料驳回',
    [ProjectStatus.MEETING_PENDING]: '会议待组织',
    [ProjectStatus.MEETING_SCHEDULED]: '会议已安排',
    [ProjectStatus.MEETING_IN_PROGRESS]: '会议进行中',
    [ProjectStatus.CONDITIONALLY_PASSED]: '有条件通过',
    [ProjectStatus.RECTIFYING]: '整改中',
    [ProjectStatus.PROJECT_APPROVED]: '立项通过',
    [ProjectStatus.PROJECT_REJECTED]: '立项未通过'
  }))
  
  // 项目状态颜色映射
  const projectStatusColors = computed(() => ({
    [ProjectStatus.DRAFT]: 'info',
    [ProjectStatus.MATERIAL_REVIEWING]: 'warning',
    [ProjectStatus.MATERIAL_REJECTED]: 'danger',
    [ProjectStatus.MEETING_PENDING]: 'primary',
    [ProjectStatus.MEETING_SCHEDULED]: 'primary',
    [ProjectStatus.MEETING_IN_PROGRESS]: 'warning',
    [ProjectStatus.CONDITIONALLY_PASSED]: 'success',
    [ProjectStatus.RECTIFYING]: 'warning',
    [ProjectStatus.PROJECT_APPROVED]: 'success',
    [ProjectStatus.PROJECT_REJECTED]: 'danger'
  }))
  
  // 材料审核结果标签映射
  const materialReviewLabels = computed(() => ({
    [MaterialReviewResult.PENDING]: '待处理',
    [MaterialReviewResult.PASSED]: '通过',
    [MaterialReviewResult.REJECTED]: '驳回'
  }))
  
  // 获取项目状态标签
  const getProjectStatusLabel = (status: ProjectStatus) => {
    return projectStatusLabels.value[status] || '未知状态'
  }
  
  // 获取项目状态颜色
  const getProjectStatusColor = (status: ProjectStatus) => {
    return projectStatusColors.value[status] || 'info'
  }
  
  // 获取材料审核结果标签
  const getMaterialReviewLabel = (result: MaterialReviewResult) => {
    return materialReviewLabels.value[result] || '未知'
  }

  // ========== 项目管理操作 ==========
  
  /**
   * 获取项目列表
   */
  const fetchProjectList = async (params?: Partial<TechnologicalProjectPageReqVO>) => {
    try {
      projectLoading.value = true
      
      const queryParams = {
        ...searchParams.value,
        ...params
      }
      
      const { data } = await getTechnologicalProjectPage(queryParams)
      
      if (data.code === 0) {
        projectList.value = data.data.list
        projectTotal.value = data.data.total
        
        // 更新搜索参数
        Object.assign(searchParams.value, queryParams)
      } else {
        ElMessage.error(data.msg || '获取项目列表失败')
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
      ElMessage.error('获取项目列表失败')
    } finally {
      projectLoading.value = false
    }
  }
  
  /**
   * 获取项目详情
   */
  const fetchProjectDetail = async (id: number) => {
    try {
      currentProjectLoading.value = true
      
      const { data } = await getTechnologicalProject(id)
      
      if (data.code === 0) {
        currentProject.value = data.data
        return data.data
      } else {
        ElMessage.error(data.msg || '获取项目详情失败')
        return null
      }
    } catch (error) {
      console.error('获取项目详情失败:', error)
      ElMessage.error('获取项目详情失败')
      return null
    } finally {
      currentProjectLoading.value = false
    }
  }
  
  /**
   * 创建项目
   */
  const createProject = async (projectData: TechnologicalProjectSaveReqVO) => {
    try {
      const { data } = await createTechnologicalProject(projectData)
      
      if (data.code === 0) {
        ElMessage.success('创建项目成功')
        await fetchProjectList() // 刷新列表
        return true
      } else {
        ElMessage.error(data.msg || '创建项目失败')
        return false
      }
    } catch (error) {
      console.error('创建项目失败:', error)
      ElMessage.error('创建项目失败')
      return false
    }
  }
  
  /**
   * 更新项目
   */
  const updateProject = async (projectData: TechnologicalProjectSaveReqVO) => {
    try {
      const { data } = await updateTechnologicalProject(projectData)
      
      if (data.code === 0) {
        ElMessage.success('更新项目成功')
        await fetchProjectList() // 刷新列表
        
        // 如果当前选中的项目被更新，刷新详情
        if (currentProject.value && currentProject.value.id === projectData.id) {
          await fetchProjectDetail(projectData.id!)
        }
        
        return true
      } else {
        ElMessage.error(data.msg || '更新项目失败')
        return false
      }
    } catch (error) {
      console.error('更新项目失败:', error)
      ElMessage.error('更新项目失败')
      return false
    }
  }
  
  /**
   * 删除项目
   */
  const deleteProject = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除这个项目吗？', '确认删除', {
        type: 'warning'
      })
      
      const { data } = await deleteTechnologicalProject(id)
      
      if (data.code === 0) {
        ElMessage.success('删除项目成功')
        await fetchProjectList() // 刷新列表
        
        // 如果删除的是当前选中的项目，清空详情
        if (currentProject.value && currentProject.value.id === id) {
          currentProject.value = null
        }
        
        return true
      } else {
        ElMessage.error(data.msg || '删除项目失败')
        return false
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除项目失败:', error)
        ElMessage.error('删除项目失败')
      }
      return false
    }
  }
  
  /**
   * 批量删除项目
   */
  const batchDeleteProjects = async (ids: number[]) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${ids.length} 个项目吗？`,
        '确认批量删除',
        { type: 'warning' }
      )
      
      const { data } = await deleteTechnologicalProjectList(ids)
      
      if (data.code === 0) {
        ElMessage.success('批量删除项目成功')
        await fetchProjectList() // 刷新列表
        
        // 如果删除的项目中包含当前选中的项目，清空详情
        if (currentProject.value && ids.includes(currentProject.value.id)) {
          currentProject.value = null
        }
        
        return true
      } else {
        ElMessage.error(data.msg || '批量删除项目失败')
        return false
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除项目失败:', error)
        ElMessage.error('批量删除项目失败')
      }
      return false
    }
  }

  // ========== 项目流程操作 ==========
  
  /**
   * 提交项目申请
   */
  const submitProject = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要提交项目申请吗？', '确认提交', {
        type: 'info'
      })
      
      const { data } = await submitTechnologicalProject(id)
      
      if (data.code === 0) {
        ElMessage.success('提交项目申请成功')
        await fetchProjectList() // 刷新列表
        await fetchProjectDetail(id) // 刷新详情
        return true
      } else {
        ElMessage.error(data.msg || '提交项目申请失败')
        return false
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('提交项目申请失败:', error)
        ElMessage.error('提交项目申请失败')
      }
      return false
    }
  }
  
  /**
   * 审核通过材料
   */
  const approveMaterial = async (id: number, reviewComments: string) => {
    try {
      const { data } = await approveProjectMaterial(id, reviewComments)
      
      if (data.code === 0) {
        ElMessage.success('材料审核通过')
        await fetchProjectList() // 刷新列表
        await fetchProjectDetail(id) // 刷新详情
        return true
      } else {
        ElMessage.error(data.msg || '材料审核失败')
        return false
      }
    } catch (error) {
      console.error('材料审核失败:', error)
      ElMessage.error('材料审核失败')
      return false
    }
  }
  
  /**
   * 驳回材料
   */
  const rejectMaterial = async (id: number, reviewComments: string, failedReason: string) => {
    try {
      const { data } = await rejectProjectMaterial(id, reviewComments, failedReason)
      
      if (data.code === 0) {
        ElMessage.success('材料已驳回')
        await fetchProjectList() // 刷新列表
        await fetchProjectDetail(id) // 刷新详情
        return true
      } else {
        ElMessage.error(data.msg || '材料驳回失败')
        return false
      }
    } catch (error) {
      console.error('材料驳回失败:', error)
      ElMessage.error('材料驳回失败')
      return false
    }
  }
  
  /**
   * 项目立项通过
   */
  const approveProjectFinal = async (id: number, reviewComments: string) => {
    try {
      const { data } = await approveProject(id, reviewComments)
      
      if (data.code === 0) {
        ElMessage.success('项目立项通过')
        await fetchProjectList() // 刷新列表
        await fetchProjectDetail(id) // 刷新详情
        return true
      } else {
        ElMessage.error(data.msg || '项目立项失败')
        return false
      }
    } catch (error) {
      console.error('项目立项失败:', error)
      ElMessage.error('项目立项失败')
      return false
    }
  }
  
  /**
   * 项目立项未通过
   */
  const rejectProjectFinal = async (id: number, reviewComments: string, failedReason: string) => {
    try {
      const { data } = await rejectProject(id, reviewComments, failedReason)
      
      if (data.code === 0) {
        ElMessage.success('项目已标记为未通过')
        await fetchProjectList() // 刷新列表
        await fetchProjectDetail(id) // 刷新详情
        return true
      } else {
        ElMessage.error(data.msg || '操作失败')
        return false
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
      return false
    }
  }

  // ========== 相关数据获取 ==========
  
  /**
   * 获取项目相关会议
   */
  const fetchProjectMeetings = async (projectId: number) => {
    try {
      const { data } = await getTechnologicalMeetingPage({
        pageNo: 1,
        pageSize: 100,
        projectId
      })
      
      if (data.code === 0) {
        projectMeetings.value = data.data.list
      }
    } catch (error) {
      console.error('获取项目会议失败:', error)
    }
  }
  
  /**
   * 获取项目整改记录
   */
  const fetchProjectRectifications = async (projectId: number) => {
    try {
      const { data } = await getTechnologicalRectificationPage({
        pageNo: 1,
        pageSize: 100,
        projectId
      })
      
      if (data.code === 0) {
        projectRectifications.value = data.data.list
      }
    } catch (error) {
      console.error('获取项目整改记录失败:', error)
    }
  }
  
  /**
   * 获取项目时间线
   */
  const fetchProjectTimeline = async (projectId: number) => {
    try {
      const { data } = await getTechnologicalProjectTimelinePage({
        pageNo: 1,
        pageSize: 100,
        projectId
      })
      
      if (data.code === 0) {
        projectTimeline.value = data.data.list
      }
    } catch (error) {
      console.error('获取项目时间线失败:', error)
    }
  }
  
  /**
   * 获取项目完整信息（包括详情和相关数据）
   */
  const fetchProjectFullInfo = async (id: number) => {
    await fetchProjectDetail(id)
    await Promise.all([
      fetchProjectMeetings(id),
      fetchProjectRectifications(id),
      fetchProjectTimeline(id)
    ])
  }

  // ========== 重置和清理 ==========
  
  /**
   * 重置搜索条件
   */
  const resetSearchParams = () => {
    searchParams.value = {
      pageNo: 1,
      pageSize: 10
    }
  }
  
  /**
   * 清空当前项目
   */
  const clearCurrentProject = () => {
    currentProject.value = null
    projectMeetings.value = []
    projectRectifications.value = []
    projectTimeline.value = []
  }

  return {
    // 状态
    projectList,
    projectTotal,
    projectLoading,
    currentProject,
    currentProjectLoading,
    projectMeetings,
    projectRectifications,
    projectTimeline,
    searchParams,
    
    // 计算属性
    projectStatusLabels,
    projectStatusColors,
    materialReviewLabels,
    getProjectStatusLabel,
    getProjectStatusColor,
    getMaterialReviewLabel,
    
    // 基础操作
    fetchProjectList,
    fetchProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    batchDeleteProjects,
    
    // 流程操作
    submitProject,
    approveMaterial,
    rejectMaterial,
    approveProjectFinal,
    rejectProjectFinal,
    
    // 相关数据
    fetchProjectMeetings,
    fetchProjectRectifications,
    fetchProjectTimeline,
    fetchProjectFullInfo,
    
    // 工具方法
    resetSearchParams,
    clearCurrentProject
  }
})