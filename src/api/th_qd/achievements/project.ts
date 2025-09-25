import request from '@/config/axios'
import type { ApiResponse, PageResult } from './types'

// ========== 项目立项申请相关类型 ==========

/** 项目立项申请响应VO */
export interface TechnologicalProjectRespVO {
  id: number
  projectNo: string
  projectName: string
  yearly: number
  applicant: string
  applicantUnit: string
  projectCycle: number
  budget: number
  expectedProjectTime: string
  applicationDescription: string
  technicalApproach: string
  riskAnalysis: string
  remark: string
  status: number // 0-草稿, 1-材料审核中, 2-材料驳回, 3-会议待组织, 4-会议已安排, 5-会议进行中, 6-有条件通过, 7-整改中, 8-立项通过, 9-立项未通过
  materialReviewResult: number // 0-待处理, 1-通过, 2-驳回
  failedReason: string
  reviewComments: string
  createTime: string
}

/** 项目立项申请分页查询参数 */
export interface TechnologicalProjectPageReqVO {
  pageNo: number
  pageSize: number
  projectNo?: string
  projectName?: string
  yearly?: string
  applicant?: string
  applicantUnit?: string
  projectCycle?: string
  budget?: string
  expectedProjectTime?: string
  applicationDescription?: string
  technicalApproach?: string
  riskAnalysis?: string
  remark?: string
  status?: string
  materialReviewResult?: string
  failedReason?: string
  reviewComments?: string
  createTime?: string
}

// ========== 项目立项申请相关API ==========

/** 获得项目立项申请分页 */
export const getTechnologicalProjectPage = (params: TechnologicalProjectPageReqVO) => {
  return request.get<PageResult<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/page',
    params
  })
}

/** 获得项目立项申请详情 */
export const getTechnologicalProject = (id: number) => {
  return request.get<ApiResponse<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/get',
    params: { id }
  })
}

// ========== 业务逻辑封装API ==========

/** 获取可选项目列表（立项通过的项目） */
export const getAvailableProjectsForAchievements = async (keyword = '') => {
  try {
    const response = await getTechnologicalProjectPage({
      pageNo: 1,
      pageSize: 100,
      status: '8', // 立项通过的项目
      projectName: keyword
    })
    
    // 直接使用 response.list，因为API返回的是 {list, total} 结构
    if (response.list && response.list.length > 0) {
      return response.list.map(project => ({
        id: project.id,
        projectName: project.projectName,
        projectNo: project.projectNo,
        status: project.status,
        applicant: project.applicant,
        applicantUnit: project.applicantUnit
      }))
    }
    return []
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return []
  }
}
