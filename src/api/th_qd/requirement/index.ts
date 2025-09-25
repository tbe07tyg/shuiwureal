import request from '@/config/axios'




//需求池管理相关附件
export interface TechnologicalRequirementAttachmentSaveReqVO {
    id: number,
    requirementId: number,
    requirementCode: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileType: string,
    uploadTime: string
}

//createTechnologicalRequirementPoolAttachment,updateTechnologicalRequirementPoolAttachment,deleteTechnologicalRequirementPoolAttachment,getTechnologicalRequirementPoolAttachmentPage,getTechnologicalRequirementPoolAttachmentInfo,exportTechnologicalRequirementPoolAttachmentExcel


//创建需求池管理相关附件
export function createTechnologicalRequirementPoolAttachment(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'post',
        url: '/technological/requirement-attachment/create',
        data
    })
}
//更新需求池管理相关附件
export function updateTechnologicalRequirementPoolAttachment(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'post',
        url: '/technological/requirement-attachment/update',
        data
    })
}
//获得需求池管理相关附件分页
export function getTechnologicalRequirementPoolAttachmentPage(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-attachment/page',
        params: data
    })
}

//获得需求池管理相关附件信息
export function getTechnologicalRequirementPoolAttachmentInfo(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-attachment/get',
        params: data
    })
}
//导出需求池管理相关附件 Excel
export function exportTechnologicalRequirementPoolAttachmentExcel(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-attachment/export-excel',
        params: data
    })
}
//删除需求池管理相关附件
export function deleteTechnologicalRequirementPoolAttachment(data: TechnologicalRequirementAttachmentSaveReqVO) {
    return request.post({
        method: 'delete',
        url: '/technological/requirement-attachment/delete',
        params: data
    })
}













//需求池管理
export interface TechnologicalRequirementPoolSaveReqVO {
    id: number,
    requirementCode: string,
    title: string,
    categoryCode: string,
    priority: number,
    proposeDepartment: string,
    description: string,
    expectedResult: string,
    status: number,
    creatorName: string,
    createTime: string,
    requirementAttachments: TechnologicalRequirementAttachmentSaveReqVO[]
}

//createTechnologicalRequirementPool,updateTechnologicalRequirementPool,deleteTechnologicalRequirementPool,getTechnologicalRequirementPoolPage,getTechnologicalRequirementPoolInfo,getTechnologicalRequirementPoolAttachmentList,exportTechnologicalRequirementPoolExcel
//创建需求池管理
export function createTechnologicalRequirementPool(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'post',
        url: '/technological/requirement-pool/create',
        data
    })
}
//修改需求池管理
export function updateTechnologicalRequirementPool(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'put',
        url: '/technological/requirement-pool/update',
        data
    })
}
//删除需求池管理
export function deleteTechnologicalRequirementPool(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'delete',
        url: '/technological/requirement-pool/delete',
        params: data
    })
}

//获得需求池管理分页
export function getTechnologicalRequirementPoolPage(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-pool/page',
        params: data
    })
}
//获得需求池管理信息
export function getTechnologicalRequirementPoolInfo(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-pool/get',
        params: data
    })
}


//获得需求池管理相关附件列表
export function getTechnologicalRequirementPoolAttachmentList(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-pool/requirement-attachment/list-by-requirement-id',
        params: data
    })
}

//导出需求池管理 Excel
export function exportTechnologicalRequirementPoolExcel(data: TechnologicalRequirementPoolSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technological/requirement-pool/export-excel',
        params: data
    })
}









