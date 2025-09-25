import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

// ===== 立项项目相关 =====

/**
 * 获取立项项目分页列表
 * GET /admin-api/technologicalproject/technological-project/page
 */
export const fetchProjectPage = async (params?: { 
  pageNo?: number; 
  pageSize?: number; 
  projectName?: string; 
  projectNo?: string;
  status?: number; // 项目状态编码，8=立项通过
}) => {
  const url = '/technologicalproject/technological-project/page'
  apiLog({ action: '获取立项项目分页', api: 'fetchProjectPage', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获取立项项目分页', api: 'fetchProjectPage', method: 'GET', url, params }, res)
  return res
}

/**
 * 获取项目列表（用于任务计划页面）
 * GET /admin-api/technologicalproject/technological-project/page
 */
export const fetchProjects = async (params?: { 
  pageNo?: number; 
  pageSize?: number; 
  projectName?: string; 
  status?: number; // 项目状态编码，8=立项通过
}) => {
  const url = '/technologicalproject/technological-project/page'
  
  try {
    apiLog({ 
      action: '获取项目列表', 
      api: 'fetchProjects', 
      method: 'GET', 
      url, 
      params 
    })
    
    const res = await request.get({ url, params })
    
    apiLog({ 
      action: '获取项目列表', 
      api: 'fetchProjects', 
      method: 'GET', 
      url, 
      params 
    }, res)
    
    return res
  } catch (error: any) {
    console.error('❌ fetchProjects 接口调用失败:', error)
    apiLog({ 
      action: '获取项目列表', 
      api: 'fetchProjects', 
      method: 'GET', 
      url, 
      params 
    }, { error: error?.message || error })
    throw error
  }
}

/**
 * 获取项目详细信息
 * GET /admin-api/technologicalproject/technological-project/get
 */
export const fetchProjectInfo = async (projectId: string | number) => {
  const url = '/technologicalproject/technological-project/get'
  const params = { id: projectId }
  
  try {
    apiLog({ 
      action: '获取项目详情', 
      api: 'fetchProjectInfo', 
      method: 'GET', 
      url, 
      params 
    })
    
    const res = await request.get({ url, params })
    
    apiLog({ 
      action: '获取项目详情', 
      api: 'fetchProjectInfo', 
      method: 'GET', 
      url, 
      params 
    }, res)
    
    return res
  } catch (error: any) {
    console.error('❌ fetchProjectInfo 接口调用失败:', error)
    apiLog({ 
      action: '获取项目详情', 
      api: 'fetchProjectInfo', 
      method: 'GET', 
      url, 
      params 
    }, { error: error?.message || error })
    throw error
  }
}


