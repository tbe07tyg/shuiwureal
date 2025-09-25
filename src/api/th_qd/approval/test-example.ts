/**
 * 项目立项模块 - 联调测试示例
 * 
 * 这个文件提供了完整的API联调测试示例
 * 可以在浏览器控制台中直接执行这些函数来测试API
 */

import {
  getTechnologicalProjectPage,
  getTechnologicalProject,
  createTechnologicalProject,
  updateTechnologicalProject,
  deleteTechnologicalProject,
  submitTechnologicalProject,
  approveProjectMaterial,
  rejectProjectMaterial,
  approveProject,
  rejectProject
} from './index'

import type {
  TechnologicalProjectSaveReqVO,
  MaterialReviewResult
} from './types'
import { ProjectStatus } from '@/api/th_qd/approval/types'
// ========== 基础测试用例 ==========

/**
 * 测试1: 获取项目列表
 * 用法: await testGetProjectList()
 */
export const testGetProjectList = async () => {
  console.log('🧪 测试获取项目列表...')
  
  try {
    const response = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 10
    })
    
    console.log('✅ 获取项目列表成功:', response.data)
    
    if (response.data && response.data.code === 0) {
      console.log(`📊 共找到 ${response.data.data.total} 个项目`)
      console.log('📋 项目列表:', response.data.data.list)
      return response.data.data
    } else if (response.data) {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return null
    } else {
      console.error('❌ 响应数据格式异常:', response)
      return null
    }
  } catch (error) {
    console.error('❌ 获取项目列表失败:', error)
    return null
  }
}

/**
 * 测试2: 获取项目详情
 * 用法: await testGetProjectDetail(1)
 */
export const testGetProjectDetail = async (id: number) => {
  console.log(`🧪 测试获取项目详情 (ID: ${id})...`)
  
  try {
    const response = await getTechnologicalProject(id)
    
    console.log('✅ 获取项目详情成功:', response.data)
    
    if (response.data && response.data.code === 0) {
      console.log('📄 项目详情:', response.data.data)
      return response.data.data
    } else if (response.data) {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return null
    } else {
      console.error('❌ 响应数据格式异常:', response)
      return null
    }
  } catch (error) {
    console.error('❌ 获取项目详情失败:', error)
    return null
  }
}

/**
 * 测试3: 创建新项目
 * 用法: await testCreateProject()
 */
export const testCreateProject = async () => {
  console.log('🧪 测试创建新项目...')
  
  const newProject: TechnologicalProjectSaveReqVO = {
    projectNo: `TEST_${Date.now()}`,
    projectName: '测试项目 - API联调',
    yearly: new Date().getFullYear(),
    applicant: '测试申请人',
    applicantUnit: '测试申请单位',
    projectCycle: 12,
    budget: 50.5,
    status: ProjectStatus.DRAFT,
    applicationDescription: '这是一个通过API联调创建的测试项目',
    technicalApproach: '采用前后端分离架构，Vue3 + FastAPI',
    riskAnalysis: '主要风险包括技术选型和进度把控',
    remark: 'API联调测试数据，可以安全删除'
  }
  
  try {
    const response = await createTechnologicalProject(newProject)
    
    console.log('✅ 创建项目成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('🎉 项目创建成功！')
      
      // 获取最新的项目列表验证
      const projectList = await testGetProjectList()
      if (projectList) {
        const createdProject = projectList.list.find(p => p.projectNo === newProject.projectNo)
        if (createdProject) {
          console.log('✅ 验证成功，新项目已出现在列表中:', createdProject)
          return createdProject
        }
      }
      
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 创建项目失败:', error)
    return false
  }
}

/**
 * 测试4: 更新项目
 * 用法: await testUpdateProject(1)
 */
export const testUpdateProject = async (id: number) => {
  console.log(`🧪 测试更新项目 (ID: ${id})...`)
  
  try {
    // 先获取项目详情
    const projectDetail = await testGetProjectDetail(id)
    if (!projectDetail) {
      console.error('❌ 无法获取项目详情，更新测试终止')
      return false
    }
    
    // 更新项目信息
    const updateData: TechnologicalProjectSaveReqVO = {
      ...projectDetail,
      remark: `更新时间: ${new Date().toLocaleString()} - API联调测试`
    }
    
    const response = await updateTechnologicalProject(updateData)
    
    console.log('✅ 更新项目成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('🎉 项目更新成功！')
      
      // 验证更新结果
      const updatedProject = await testGetProjectDetail(id)
      if (updatedProject && updatedProject.remark === updateData.remark) {
        console.log('✅ 验证成功，项目信息已更新')
        return true
      }
      
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 更新项目失败:', error)
    return false
  }
}

/**
 * 测试5: 删除项目 (谨慎使用)
 * 用法: await testDeleteProject(1)
 */
export const testDeleteProject = async (id: number) => {
  console.log(`🧪 测试删除项目 (ID: ${id})...`)
  console.warn('⚠️ 注意：这将真实删除项目数据！')
  
  try {
    const response = await deleteTechnologicalProject(id)
    
    console.log('✅ 删除项目成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('🗑️ 项目删除成功！')
      
      // 验证删除结果
      const deletedProject = await testGetProjectDetail(id)
      if (!deletedProject) {
        console.log('✅ 验证成功，项目已被删除')
      }
      
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 删除项目失败:', error)
    return false
  }
}

// ========== 业务流程测试用例 ==========

/**
 * 测试6: 完整的项目流程测试
 * 用法: await testCompleteProjectFlow()
 */
export const testCompleteProjectFlow = async () => {
  console.log('🧪 测试完整的项目流程...')
  
  try {
    // 1. 创建项目
    console.log('📝 步骤1: 创建项目')
    const createdProject = await testCreateProject()
    if (!createdProject || typeof createdProject === 'boolean') {
      throw new Error('创建项目失败')
    }
    
    const projectId = createdProject.id
    console.log(`✅ 项目创建成功，ID: ${projectId}`)
    
    // 2. 提交项目申请
    console.log('📤 步骤2: 提交项目申请')
    const submitResult = await testSubmitProject(projectId)
    if (!submitResult) {
      throw new Error('提交项目申请失败')
    }
    
    // 3. 审核通过材料
    console.log('✅ 步骤3: 审核通过材料')
    const approveResult = await testApproveMaterial(projectId)
    if (!approveResult) {
      throw new Error('审核材料失败')
    }
    
    // 4. 项目立项通过
    console.log('🎉 步骤4: 项目立项通过')
    const finalApproveResult = await testApproveProject(projectId)
    if (!finalApproveResult) {
      throw new Error('项目立项失败')
    }
    
    console.log('🎊 完整流程测试成功！项目已完成立项')
    return true
    
  } catch (error) {
    console.error('❌ 完整流程测试失败:', error)
    return false
  }
}

/**
 * 测试7: 提交项目申请
 * 用法: await testSubmitProject(1)
 */
export const testSubmitProject = async (id: number) => {
  console.log(`🧪 测试提交项目申请 (ID: ${id})...`)
  
  try {
    const response = await submitTechnologicalProject(id)
    
    console.log('✅ 提交项目申请成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('📤 项目申请已提交，状态变更为"材料审核中"')
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 提交项目申请失败:', error)
    return false
  }
}

/**
 * 测试8: 审核通过材料
 * 用法: await testApproveMaterial(1)
 */
export const testApproveMaterial = async (id: number) => {
  console.log(`🧪 测试审核通过材料 (ID: ${id})...`)
  
  try {
    const reviewComments = '材料齐全，符合立项要求，建议通过审核。'
    const response = await approveProjectMaterial(id, reviewComments)
    
    console.log('✅ 审核通过材料成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('✅ 材料审核通过，状态变更为"会议待组织"')
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 审核材料失败:', error)
    return false
  }
}

/**
 * 测试9: 驳回材料
 * 用法: await testRejectMaterial(1)
 */
export const testRejectMaterial = async (id: number) => {
  console.log(`🧪 测试驳回材料 (ID: ${id})...`)
  
  try {
    const reviewComments = '材料不完整，需要补充技术方案说明。'
    const failedReason = '缺少关键技术文档'
    const response = await rejectProjectMaterial(id, reviewComments, failedReason)
    
    console.log('✅ 驳回材料成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('❌ 材料已驳回，状态变更为"材料驳回"')
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 驳回材料失败:', error)
    return false
  }
}

/**
 * 测试10: 项目立项通过
 * 用法: await testApproveProject(1)
 */
export const testApproveProject = async (id: number) => {
  console.log(`🧪 测试项目立项通过 (ID: ${id})...`)
  
  try {
    const reviewComments = '项目方案可行，预算合理，同意立项。'
    const response = await approveProject(id, reviewComments)
    
    console.log('✅ 项目立项通过成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('🎉 项目立项通过！状态变更为"立项通过"')
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 项目立项失败:', error)
    return false
  }
}

/**
 * 测试11: 项目立项未通过
 * 用法: await testRejectProject(1)
 */
export const testRejectProject = async (id: number) => {
  console.log(`🧪 测试项目立项未通过 (ID: ${id})...`)
  
  try {
    const reviewComments = '项目风险过高，不符合当前战略方向。'
    const failedReason = '项目风险评估不通过'
    const response = await rejectProject(id, reviewComments, failedReason)
    
    console.log('✅ 项目立项未通过成功:', response.data)
    
    if (response.data.code === 0) {
      console.log('❌ 项目立项未通过，状态变更为"立项未通过"')
      return true
    } else {
      console.warn('⚠️ API返回错误:', response.data.msg)
      return false
    }
  } catch (error) {
    console.error('❌ 项目立项操作失败:', error)
    return false
  }
}

// ========== 批量测试用例 ==========

/**
 * 运行所有基础API测试
 * 用法: await runAllBasicTests()
 */
export const runAllBasicTests = async () => {
  console.log('🚀 开始运行所有基础API测试...')
  
  const results = {
    getProjectList: false,
    getProjectDetail: false,
    createProject: false,
    updateProject: false,
    completeFlow: false
  }
  
  try {
    // 1. 测试获取项目列表
    console.log('\n=== 测试1: 获取项目列表 ===')
    const projectList = await testGetProjectList()
    results.getProjectList = !!projectList
    
    if (projectList && projectList.list.length > 0) {
      const firstProject = projectList.list[0]
      
      // 2. 测试获取项目详情
      console.log('\n=== 测试2: 获取项目详情 ===')
      const projectDetail = await testGetProjectDetail(firstProject.id)
      results.getProjectDetail = !!projectDetail
      
      // 3. 测试更新项目
      console.log('\n=== 测试3: 更新项目 ===')
      results.updateProject = await testUpdateProject(firstProject.id)
    }
    
    // 4. 测试创建项目
    console.log('\n=== 测试4: 创建项目 ===')
    results.createProject = await testCreateProject()
    
    // 5. 测试完整流程
    console.log('\n=== 测试5: 完整流程 ===')
    results.completeFlow = await testCompleteProjectFlow()
    
  } catch (error) {
    console.error('❌ 批量测试过程中发生错误:', error)
  }
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:')
  console.table(results)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`✅ 通过: ${passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！API联调成功！')
  } else {
    console.log('⚠️ 部分测试失败，请检查API配置和网络连接')
  }
  
  return results
}

// ========== 工具函数 ==========

/**
 * 快速连接测试
 * 用法: await quickConnectionTest()
 */
export const quickConnectionTest = async () => {
  console.log('🔗 快速连接测试...')
  
  try {
    const response = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 10
    })
    
    // 详细打印响应结构用于调试
    console.log('📡 API响应结构:', response)
    console.log('📊 响应数据:', response?.data)
    
    // 检查响应是否存在
    if (!response) {
      console.error('❌ 响应为空')
      return false
    }
    
    
    // 检查是否有code字段
    if (typeof response.data.code === 'undefined') {
      console.warn('⚠️ 响应数据没有code字段，可能是非标准格式:', response.data)
      // 如果没有code字段但有数据，可能是直接返回的数据
      if (response.data) {
        console.log('✅ API连接正常（非标准响应格式）')
        return true
      }
      return false
    }
    
    // 标准响应格式检查
    if (response.data.code === 0) {
      console.log('✅ API连接正常')
      console.log('🌐 服务器响应正常')
      console.log('📋 响应数据:', response.data.data)
      return true
    } else {
      console.warn('⚠️ API响应异常:', response.data.msg || '未知错误')
      console.warn('🔍 错误代码:', response.data.code)
      return false
    }
  } catch (error) {
    console.error('❌ API连接失败:', error)
    
    // 更详细的错误信息
    if (error instanceof Error) {
      console.error('🔍 错误类型:', error.constructor.name)
      console.error('📝 错误消息:', error.message)
      if (error.stack) {
        console.error('📍 错误堆栈:', error.stack)
      }
    }
    
    // 检查是否是网络错误
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any
      console.error('🌐 HTTP状态码:', axiosError.response?.status)
      console.error('📡 响应头:', axiosError.response?.headers)
      console.error('📄 响应数据:', axiosError.response?.data)
    }
    
    console.log('💡 请检查:')
    console.log('  1. 网络连接是否正常')
    console.log('  2. API服务器是否启动')
    console.log('  3. Authorization token是否有效')
    console.log('  4. 跨域设置是否正确')
    console.log('  5. 检查控制台网络面板查看具体错误')
    return false
  }
}

// ========== 使用说明 ==========

console.log(`
🎯 项目立项API联调测试工具

📖 使用方法:
1. 打开浏览器开发者工具
2. 在控制台中导入测试模块
3. 执行相应的测试函数

🔧 快速开始:
// 快速连接测试
await quickConnectionTest()

// 运行所有基础测试
await runAllBasicTests()

// 单个功能测试
await testGetProjectList()
await testCreateProject()
await testCompleteProjectFlow()

📝 注意事项:
- 请求头(Authorization, tenant-id)由axios拦截器自动处理
- 确保已正确登录，token会自动从缓存中获取
- 某些测试会创建真实数据，请在测试环境中使用
- 删除操作请谨慎执行
- 确保有足够的权限执行相关操作
`)

export default {
  // 基础测试
  testGetProjectList,
  testGetProjectDetail,
  testCreateProject,
  testUpdateProject,
  testDeleteProject,
  
  // 流程测试
  testCompleteProjectFlow,
  testSubmitProject,
  testApproveMaterial,
  testRejectMaterial,
  testApproveProject,
  testRejectProject,
  
  // 批量测试
  runAllBasicTests,
  
  // 工具函数
  quickConnectionTest
}