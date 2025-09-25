import request from '@/config/axios'

// ===================== 调研记录 =====================

export const apiGetResearchPage = (params: any) => {
  return request.get({
    url: '/technological/research/page',
    params
  })
}

export const apiGetResearchDetailPage = (params: any) => {
  return request.get({
    url: '/technological/research/researchDetailPage',
    params
  })
}

export const apiGetResearchDetail = (id: number | string) => {
  return request.get({
    url: '/technological/research/get',
    params: { id }
  })
}

export const apiCreateResearch = (data: any) => {
  return request.post({
    url: '/technological/research/create',
    data
  })
}

export const apiUpdateResearch = (data: any) => {
  return request.put({
    url: '/technological/research/update',
    data
  })
}

export const apiUpdateResearchStatus = (data: any) => {
  return request.put({
    url: '/technological/research/updateStatus',
    data
  })
}

export const apiDeleteResearch = (id: number | string) => {
  return request.delete({
    url: '/technological/research/delete',
    params: { id }
  })
}

export const apiDeleteResearchList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research/delete-list',
    params: { ids }
  })
}

export const apiExportResearch = (params: any) => {
  return request.download({
    url: '/technological/research/export-excel',
    params
  })
}

// ===================== 调研事项 =====================

export const apiListTasksByResearchId = (researchId: number | string) => {
  return request.get({
    url: '/technological/research/research-task/list-by-research-id',
    params: { researchId }
  })
}

export const apiGetResearchTaskPage = (params: any) => {
  return request.get({
    url: '/technological/research-task/page',
    params
  })
}

export const apiGetResearchTask = (id: number | string) => {
  return request.get({
    url: '/technological/research-task/get',
    params: { id }
  })
}

export const apiCreateResearchTask = (data: any) => {
  return request.post({
    url: '/technological/research-task/create',
    data
  })
}

export const apiUpdateResearchTask = (data: any) => {
  return request.put({
    url: '/technological/research-task/update',
    data
  })
}

export const apiDeleteResearchTask = (id: number | string) => {
  return request.delete({
    url: '/technological/research-task/delete',
    params: { id }
  })
}

export const apiDeleteResearchTaskList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research-task/delete-list',
    params: { ids }
  })
}

// ===================== 调研文档 =====================

export const apiGetResearchDocumentPage = (params: any) => {
  return request.get({
    url: '/technological/research-document/page',
    params
  })
}

export const apiGetResearchDocument = (id: number | string) => {
  return request.get({
    url: '/technological/research-document/get',
    params: { id }
  })
}

export const apiCreateResearchDocument = (data: any) => {
  return request.post({
    url: '/technological/research-document/create',
    data
  })
}

export const apiUpdateResearchDocument = (data: any) => {
  return request.put({
    url: '/technological/research-document/update',
    data
  })
}

export const apiDeleteResearchDocument = (id: number | string) => {
  return request.delete({
    url: '/technological/research-document/delete',
    params: { id }
  })
}

export const apiDeleteResearchDocumentList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research-document/delete-list',
    params: { ids }
  })
}

// ===================== 下拉（用户/部门） =====================

export const apiListAllSimpleUsers = () => {
  return request.get({
    url: '/system/user/list-all-simple'
  })
}

export const apiListAllSimpleDepts = () => {
  return request.get({
    url: '/system/dept/list-all-simple'
  })
}

// ===================== 需求池来源（可选，用于来源选择） =====================

export const apiGetRequirementPoolPage = (params: any) => {
  return request.get({
    url: '/technological/requirement-pool/page',
    params
  })
}


