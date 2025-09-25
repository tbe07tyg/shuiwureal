// 项目开题系统 API 使用示例
// 展示如何使用各种API接口

import {
  // 开题申请相关
  createProposalApplication,
  saveProposalApplicationDraft,
  checkProjectOpeningStatus,
  submitProposalApplication,
  withdrawProposalApplication,
  getMyProposalApplications,
  
  // 材料相关
  uploadProposalMaterialFile,
  getProposalApplicationMaterials,
  validateProposalMaterials,
  
  // 项目相关
  getAvailableProjectsForOpening,
  getProjectDetailForOpening
} from './index'

import type {
  ProposalApplicationSaveReqVO,
  ProposalApplicationStatus
} from './types'

// ========== 开题申请流程示例 ==========

/**
 * 示例1: 完整的开题申请流程
 */
export const exampleCompleteOpeningProcess = async () => {
  try {
    // 1. 检查项目是否可以申请开题
    const projectId = 123
    const statusCheck = await checkProjectOpeningStatus(projectId)
    
    if (!statusCheck.data.canSubmit) {
      console.log('项目不符合开题条件:', statusCheck.data.reason)
      return
    }
    
    // 2. 保存草稿
    const draftData: ProposalApplicationSaveReqVO = {
      projectId: projectId,
      applicationType: 1, // 初步开题
      expectedProposalTime: '2024-12-31',
      applicationDescription: '这是一个示例开题申请',
      notes: '备注信息'
    }
    
    const draftResult = await saveProposalApplicationDraft(draftData)
    const applicationId = draftResult.data
    
    console.log('草稿保存成功，申请ID:', applicationId)
    
    // 3. 上传材料
    const materialData = {
      proposalApplicationId: applicationId,
      materialType: 'proposal_report',
      fileName: '开题报告.pdf',
      fileUrl: 'https://example.com/file.pdf',
      fileSize: 1024000,
      isRequired: true
    }
    
    const materialResult = await uploadProposalMaterialFile(materialData)
    console.log('材料上传成功，材料ID:', materialResult.data)
    
    // 4. 验证材料完整性
    const validationResult = await validateProposalMaterials(applicationId)
    
    if (validationResult.data.isValid) {
      // 5. 提交申请
      const submitResult = await submitProposalApplication(applicationId)
      
      if (submitResult.data) {
        console.log('开题申请提交成功！')
      }
    } else {
      console.log('材料不完整，缺失:', validationResult.data.missingMaterials)
    }
    
  } catch (error) {
    console.error('开题申请流程失败:', error)
  }
}

/**
 * 示例2: 获取用户的开题申请列表
 */
export const exampleGetMyApplications = async () => {
  try {
    const response = await getMyProposalApplications({
      pageNo: 1,
      pageSize: 20,
      status: [ProposalApplicationStatus.MATERIAL_REVIEWING, ProposalApplicationStatus.MEETING_PENDING]
    })
    
    console.log('我的开题申请:', response.data.list)
    console.log('总数:', response.data.total)
    
  } catch (error) {
    console.error('获取申请列表失败:', error)
  }
}

/**
 * 示例3: 项目选择和详情获取
 */
export const exampleProjectSelection = async () => {
  try {
    // 获取可选项目列表
    const projectsResponse = await getAvailableProjectsForOpening({
      pageNo: 1,
      pageSize: 50
    })
    
    console.log('可选项目:', projectsResponse.list)
    
    if (projectsResponse.list.length > 0) {
      // 获取第一个项目的详情
      const firstProject = projectsResponse.list[0]
      const projectDetail = await getProjectDetailForOpening(firstProject.id)
      
      console.log('项目详情:', projectDetail.data)
    }
    
  } catch (error) {
    console.error('项目选择失败:', error)
  }
}

/**
 * 示例4: 材料管理
 */
export const exampleMaterialManagement = async (applicationId: number) => {
  try {
    // 获取申请的材料列表
    const materialsResponse = await getProposalApplicationMaterials(applicationId)
    
    console.log('申请材料:', materialsResponse.data)
    
    // 验证材料完整性
    const validationResult = await validateProposalMaterials(applicationId)
    
    if (validationResult.data.isValid) {
      console.log('材料完整，可以提交申请')
    } else {
      console.log('材料不完整，缺失:', validationResult.data.missingMaterials)
      console.log(`已上传: ${validationResult.data.totalUploaded}/${validationResult.data.totalRequired}`)
    }
    
  } catch (error) {
    console.error('材料管理失败:', error)
  }
}

/**
 * 示例5: 申请状态管理
 */
export const exampleApplicationStatusManagement = async (applicationId: number) => {
  try {
    // 提交申请
    const submitResult = await submitProposalApplication(applicationId)
    
    if (submitResult.data) {
      console.log('申请已提交，状态变更为材料审核中')
    }
    
    // 如果需要撤回申请
    // const withdrawResult = await withdrawProposalApplication(applicationId)
    // if (withdrawResult.data) {
    //   console.log('申请已撤回，状态变更为草稿')
    // }
    
  } catch (error) {
    console.error('申请状态管理失败:', error)
  }
}

// ========== 错误处理示例 ==========

/**
 * 示例6: 错误处理最佳实践
 */
export const exampleErrorHandling = async () => {
  try {
    const response = await createProposalApplication({
      projectId: 123,
      applicationType: 1,
      applicationStatus: 2,
      expectedProposalTime: '',
      applicationDescription: '随便',
      notes: ''
    })
    
    // 检查响应状态
    if (response.code === 200) {
      console.log('操作成功:', response.data)
    } else {
      console.warn('操作失败:', response.msg)
    }
    
  } catch (error: any) {
    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应了错误状态码
      console.error('服务器错误:', error.response.status, error.response.data)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误:', error.message)
    } else {
      // 其他错误
      console.error('其他错误:', error.message)
    }
  }
}

// ========== 批量操作示例 ==========

/**
 * 示例7: 批量检查多个项目
 */
export const exampleBatchProjectCheck = async (projectIds: number[]) => {
  try {
    const checkPromises = projectIds.map(id => checkProjectOpeningStatus(id))
    const checkResults = await Promise.all(checkPromises)
    
    const eligibleProjects = checkResults
      .map((result, index) => ({
        projectId: projectIds[index],
        canSubmit: result.data.canSubmit,
        reason: result.data.reason
      }))
      .filter(project => project.canSubmit)
    
    console.log('符合条件的项目:', eligibleProjects)
    
  } catch (error) {
    console.error('批量检查失败:', error)
  }
}

export default {
  exampleCompleteOpeningProcess,
  exampleGetMyApplications,
  exampleProjectSelection,
  exampleMaterialManagement,
  exampleApplicationStatusManagement,
  exampleErrorHandling,
  exampleBatchProjectCheck
}


