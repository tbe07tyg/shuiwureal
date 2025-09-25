import request from '@/config/axios'

// 需求池管理相关接口（仅供本页使用）

// 分页查询 需求池
export const apiGetRequirementPoolPage = (params: any) => {
  return request.get({
    url: '/technological/requirement-pool/page',
    params
  })
}

// 获取详情
export const apiGetRequirementPool = (id: number | string) => {
  return request.get({
    url: '/technological/requirement-pool/get',
    params: { id }
  })
}

// 创建
export const apiCreateRequirementPool = (data: any) => {
  return request.post({
    url: '/technological/requirement-pool/create',
    data
  })
}

// 更新
export const apiUpdateRequirementPool = (data: any) => {
  return request.put({
    url: '/technological/requirement-pool/update',
    data
  })
}

// 删除（单个）
export const apiDeleteRequirementPool = (id: number | string) => {
  return request.delete({
    url: '/technological/requirement-pool/delete',
    params: { id }
  })
}

// 批量删除
export const apiDeleteRequirementPoolList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/requirement-pool/delete-list',
    params: { ids }
  })
}

// 导出 Excel（GET，返回 blob）
export const apiExportRequirementPool = (params: any) => {
  return request.download({
    url: '/technological/requirement-pool/export-excel',
    params
  })
}

// 用户/部门精简列表（下拉）
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

// ===================== 调研记录（results 页面） =====================

// 分页查询 调研记录
export const apiGetResearchPage = (params: any) => {
  return request.get({
    url: '/technological/research/page',
    params
  })
}

// 详情
export const apiGetResearchDetail = (id: number | string) => {
  return request.get({
    url: '/technological/research/get',
    params: { id }
  })
}

// 创建
export const apiCreateResearch = (data: any) => {
  return request.post({
    url: '/technological/research/create',
    data
  })
}

// 更新
export const apiUpdateResearch = (data: any) => {
  return request.put({
    url: '/technological/research/update',
    data
  })
}

// 更新状态
export const apiUpdateResearchStatus = (data: any) => {
  return request.put({
    url: '/technological/research/updateStatus',
    data
  })
}

// 删除（单个）
export const apiDeleteResearch = (id: number | string) => {
  return request.delete({
    url: '/technological/research/delete',
    params: { id }
  })
}

// 批量删除
export const apiDeleteResearchList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research/delete-list',
    params: { ids }
  })
}

// 导出 Excel
export const apiExportResearch = (params: any) => {
  return request.download({
    url: '/technological/research/export-excel',
    params
  })
}

// ===================== 调研事项 =====================

// 按调研ID获取事项列表
export const apiListTasksByResearchId = (researchId: number | string) => {
  return request.get({
    url: '/technological/research/research-task/list-by-research-id',
    params: { researchId }
  })
}

// 事项分页
export const apiGetResearchTaskPage = (params: any) => {
  return request.get({
    url: '/technological/research-task/page',
    params
  })
}

// 事项详情
export const apiGetResearchTask = (id: number | string) => {
  return request.get({
    url: '/technological/research-task/get',
    params: { id }
  })
}

// 新建事项
export const apiCreateResearchTask = (data: any) => {
  return request.post({
    url: '/technological/research-task/create',
    data
  })
}

// 更新事项
export const apiUpdateResearchTask = (data: any) => {
  return request.put({
    url: '/technological/research-task/update',
    data
  })
}

// 删除事项
export const apiDeleteResearchTask = (id: number | string) => {
  return request.delete({
    url: '/technological/research-task/delete',
    params: { id }
  })
}

// 批量删除事项
export const apiDeleteResearchTaskList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research-task/delete-list',
    params: { ids }
  })
}

// ===================== 调研文档 =====================

// 文档分页
export const apiGetResearchDocumentPage = (params: any) => {
  return request.get({
    url: '/technological/research-document/page',
    params
  })
}

// 文档详情
export const apiGetResearchDocument = (id: number | string) => {
  return request.get({
    url: '/technological/research-document/get',
    params: { id }
  })
}

// 新建文档
export const apiCreateResearchDocument = (data: any) => {
  return request.post({
    url: '/technological/research-document/create',
    data
  })
}

// 更新文档
export const apiUpdateResearchDocument = (data: any) => {
  return request.put({
    url: '/technological/research-document/update',
    data
  })
}

// 删除文档
export const apiDeleteResearchDocument = (id: number | string) => {
  return request.delete({
    url: '/technological/research-document/delete',
    params: { id }
  })
}

// 批量删除文档
export const apiDeleteResearchDocumentList = (ids: Array<number | string>) => {
  return request.delete({
    url: '/technological/research-document/delete-list',
    params: { ids }
  })
}


