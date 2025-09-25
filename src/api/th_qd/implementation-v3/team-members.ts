import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

// ===== 团队成员相关 =====
export const addMemberToProject = async (data: { projectId: string | number; userId: number | string; memberName: string; role: string; skills?: string[] | string }) => {
  const url = '/technological/team-member/add-to-project'
  const payload = {
    projectId: Number(data.projectId),
    memberId: Number(data.userId),
    memberName: data.memberName || '',
    memberRole: data.role,
    memberSkills: Array.isArray(data.skills)
      ? (data.skills as string[]).join(', ')
      : (data.skills || '')
  }
  apiLog({ action: '添加成员到项目', api: 'addMemberToProject', method: 'POST', url, params: payload })
  const res = await request.post({ url, data: payload })
  apiLog({ action: '添加成员到项目', api: 'addMemberToProject', method: 'POST', url, params: payload }, res)
  return res
}

export const listProjectMembers = async (projectId: string) => {
  const url = '/technological/team-member/list-by-project'
  const params = { projectId }
  apiLog({ action: '获取项目成员列表', api: 'listProjectMembers', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获取项目成员列表', api: 'listProjectMembers', method: 'GET', url, params }, res)
  return res
}

export const listAllTeamMembers = async (params?: { pageNo?: number; pageSize?: number; keyword?: string; memberRole?: string }) => {
  const url = '/technological/team-member/page'
  const mappedParams = {
    pageNo: params?.pageNo ?? 1,
    pageSize: params?.pageSize ?? 20,
    memberName: params?.keyword ?? undefined,
    memberRole: params?.memberRole ?? undefined
  }
  apiLog({ action: '获取全局成员池', api: 'listAllTeamMembers', method: 'GET', url, params: mappedParams })
  const res = await request.get({ url, params: mappedParams })
  apiLog({ action: '获取全局成员池', api: 'listAllTeamMembers', method: 'GET', url, params: mappedParams }, res)
  return res
}

export const removeMemberFromProject = async (data: { projectId: number | string; memberId: number | string }) => {
  const url = '/technological/team-member/remove-from-project'
  apiLog({ action: '移除成员出项目', api: 'removeMemberFromProject', method: 'POST', url, params: data })
  const res = await request.post({ url, params: data })
  apiLog({ action: '移除成员出项目', api: 'removeMemberFromProject', method: 'POST', url, params: data }, res)
  return res
}

export const createTeamMember = async (data: { userId: number | string; memberName: string; memberRole?: string; memberSkills?: string | string[] }) => {
  const url = '/technological/team-member/create'
  const payload = {
    userId: Number(data.userId),
    memberName: data.memberName,
    memberRole: data.memberRole,
    memberSkills: Array.isArray(data.memberSkills) ? (data.memberSkills as string[]).join(', ') : (data.memberSkills || '')
  }
  apiLog({ action: '创建成员（成员池）', api: 'createTeamMember', method: 'POST', url, params: payload })
  const res = await request.post({ url, data: payload })
  apiLog({ action: '创建成员（成员池）', api: 'createTeamMember', method: 'POST', url, params: payload }, res)
  return res
}

export const updateTeamMember = async (data: { 
  id: number | string; 
  memberId?: number | string;
  memberName?: string; 
  memberRole?: string; 
  memberSkills?: string | string[];
  projectId?: number | string;
  isProjectManager?: boolean;
}) => {
  const url = '/technological/team-member/update'
  const payload: any = {
    id: Number(data.id),
    memberId: data.memberId ? Number(data.memberId) : undefined,
    memberName: data.memberName,
    memberRole: data.memberRole,
    memberSkills: Array.isArray(data.memberSkills) 
      ? (data.memberSkills as string[]).join(', ')
      : (data.memberSkills || ''),
    projectId: data.projectId ? Number(data.projectId) : undefined,
    isProjectManager: data.isProjectManager || false
  }
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key]
  })
  apiLog({ action: '更新成员信息', api: 'updateTeamMember', method: 'PUT', url, params: payload })
  const res = await request.put({ url, data: payload })
  apiLog({ action: '更新成员信息', api: 'updateTeamMember', method: 'PUT', url, params: payload }, res)
  return res
}

export const deleteTeamMember = async (id: number | string) => {
  const url = '/technological/team-member/delete'
  const params = { id }
  apiLog({ action: '删除成员（成员池）', api: 'deleteTeamMember', method: 'DELETE', url, params })
  const res = await request.delete({ url, params })
  apiLog({ action: '删除成员（成员池）', api: 'deleteTeamMember', method: 'DELETE', url, params }, res)
  return res
}

export const listActiveMembersByProject = async (projectId: string | number) => {
  const url = '/technological/team-member/list-active-by-project'
  const params = { projectId }
  apiLog({ action: '获取活跃团队成员', api: 'listActiveMembersByProject', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获取活跃团队成员', api: 'listActiveMembersByProject', method: 'GET', url, params }, res)
  return res
}

export const fetchTeamMemberStatistics = async (projectId: string | number) => {
  const url = '/technological/team-member/statistics'
  const params = { projectId }
  apiLog({ action: '获取团队成员统计', api: 'fetchTeamMemberStatistics', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获取团队成员统计', api: 'fetchTeamMemberStatistics', method: 'GET', url, params }, res)
  return res
}

/**
 * 根据负责人ID获取任务列表
 * GET /admin-api/technological/task/list-by-assignee
 */
export const fetchMemberTasks = async (assigneeId: string | number, projectId?: string | number) => {
  const url = '/technological/task/list-by-assignee'
  const params: any = { assigneeId }
  
  // 如果提供了项目ID，可以在前端过滤（后端接口不支持项目ID参数）
  apiLog({ action: '获取成员任务列表', api: 'fetchMemberTasks', method: 'GET', url, params })
  const res = await request.get({ url, params })
  apiLog({ action: '获取成员任务列表', api: 'fetchMemberTasks', method: 'GET', url, params }, res)
  
  // 如果指定了项目ID，在前端过滤任务
  if (projectId && res?.data?.list) {
    const filteredTasks = res.data.list.filter((task: any) => task.projectId == projectId)
    return {
      ...res,
      data: {
        ...res.data,
        list: filteredTasks
      }
    }
  }
  
  return res
}


