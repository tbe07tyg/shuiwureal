import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listProjectMembers, listActiveMembersByProject, addMemberToProject } from '@/api/th_qd/implementation-v3'
import { apiLog } from '@/utils/apiLogger'

export interface TeamMember { id: string; name: string; role?: string }

export const useTeamMembersStore = defineStore('th_qd_team_members', () => {
  const members = ref<TeamMember[]>([])
  const loading = ref(false)
  const lastProjectId = ref<string | null>(null)

  // 活跃成员（当前项目中）的ID集合
  const activeMemberIds = ref<Set<string>>(new Set())
  const activeRefreshVersion = ref(0)

  const extractList = (res: any): any[] => {
    const data = res?.data ?? res
    return data?.list || data?.records || data?.items || data || []
  }

  const loadMembers = async (projectId: string) => {
    if (!projectId) return
    loading.value = true
    try {
      const res = await listProjectMembers(projectId)
      const list = extractList(res)
      members.value = (list || []).map((m: any) => ({
        id: String(m.id ?? m.memberId ?? m.userId ?? ''),
        name: m.name ?? m.memberName ?? m.nickname ?? m.username ?? '',
        role: m.role ?? m.memberRole ?? ''
      }))
      apiLog({ action: 'Store加载项目成员', api: 'listProjectMembers', method: 'GET', url: '/technological/team-member/list-by-project', params: { projectId } }, { size: members.value.length })
      lastProjectId.value = projectId
    } finally {
      loading.value = false
    }
  }

  // 读取当前项目“活跃成员”列表（高亮用）- 带版本守卫，避免并发覆盖
  const loadActiveMembers = async (projectId: string) => {
    if (!projectId) return
    const ver = ++activeRefreshVersion.value
    const res = await listActiveMembersByProject(projectId)
    const list = extractList(res)
    // 允许后端返回 id/memberId/userId 三种
    const ids = (list || []).map((m: any) => String(m.id ?? m.memberId ?? m.userId ?? m))
    apiLog({ action: '加载活跃成员', api: 'listActiveMembersByProject', method: 'GET', url: '/technological/team-member/list-active-by-project', params: { projectId } }, { size: ids.length })
    // 仅处理最新响应
    if (ver === activeRefreshVersion.value) {
      activeMemberIds.value = new Set(ids)
    }
  }

  const refresh = async () => {
    if (lastProjectId.value) {
      await Promise.all([
        loadMembers(lastProjectId.value),
        loadActiveMembers(lastProjectId.value)
      ])
    }
  }

  const hasMember = (userId: string): boolean => {
    const id = String(userId)
    return members.value.some(m => String(m.id) === id)
  }

  // 计算属性：高亮成员详情数组
  const activeMembers = computed(() => {
    const ids = activeMemberIds.value
    return members.value.filter(m => ids.has(String(m.id)))
  })

  // 乐观加入：立即高亮，随后与服务端结果对齐
  const optimisticAddToProject = (memberId: string) => {
    const id = String(memberId)
    const next = new Set(activeMemberIds.value)
    next.add(id)
    activeMemberIds.value = next
  }

  const addMemberToCurrentProject = async (projectId: string, memberId: string) => {
    optimisticAddToProject(memberId)
    let ok = false
    try {
      await addMemberToProject({ projectId, userId: memberId, memberName: members.value.find(m => m.id === memberId)?.name || '', role: '' })
      ok = true
      apiLog({ action: '加入当前项目', api: 'addMemberToProject', method: 'POST', url: '/technological/team-member/add-to-project', params: { projectId, memberId } })
    } catch (e) {
      console.error('加入当前项目失败，将回滚本地高亮：', e)
    } finally {
      // 与数据库对齐
      const ver = ++activeRefreshVersion.value
      const res = await listActiveMembersByProject(projectId)
      const list = extractList(res)
      const serverIds = new Set((list || []).map((m: any) => String(m.id ?? m.memberId ?? m.userId ?? m)))
      if (ver === activeRefreshVersion.value) {
        if (ok) {
          // 成功：以并集写回，避免并发覆盖
          const union = new Set<string>([...serverIds, ...activeMemberIds.value])
          activeMemberIds.value = union
        } else {
          // 失败：回滚本地乐观高亮，以服务端为准
          const current = new Set(activeMemberIds.value)
          current.delete(String(memberId))
          const union = new Set<string>([...serverIds, ...current])
          activeMemberIds.value = union
        }
      }
    }
  }

  return {
    members,
    loading,
    lastProjectId,
    activeMemberIds,
    activeMembers,
    loadMembers,
    loadActiveMembers,
    refresh,
    hasMember,
    optimisticAddToProject,
    addMemberToCurrentProject
  }
})


