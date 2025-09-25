import request from '@/config/axios'


export interface  TechnologicalRectificationSaveReqVO {
    id: number,///主键ID
    projectId: number,//项目ID
    meetingConclusionId: number,//会议结论ID
    rectificationNo: string,//整改编号
    rectificationRequirements: string,//整改要求
    rectificationDeadline: string,//整改截止时间
    applicantResponse: string,//申请人响应
    reviewResult: boolean,//审核结果
    reviewOpinion: string,//审核意见
    reviewer: string,//审核人
    reviewTime: string//审核时间
}

//createTechnologicalRectification,updateTechnologicalRectification,deleteTechnologicalRectification,getTechnologicalRectificationInfo,getTechnologicalRectificationPage

//创建整改记录
export function createTechnologicalRectification(data: TechnologicalRectificationSaveReqVO) {
    return request.post({
        method: 'post',
        url: '/technologicalrectification/technological-rectification/create',
        data
    })
}

//更新整改记录
export function updateTechnologicalRectification(data: TechnologicalRectificationSaveReqVO) {
    return request.post({
        method: 'put',
        url: '/technologicalrectification/technological-rectification/update',
        data
    })
}

//删除整改记录
export function deleteTechnologicalRectification(data: TechnologicalRectificationSaveReqVO) {
    return request.post({
        method: 'delete',
        url: '/technologicalrectification/technological-rectification/delete',
        params: data
    })
}

//获得整改记录详情
export function getTechnologicalRectificationInfo(data: TechnologicalRectificationSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technologicalrectification/technological-rectification/get',
        params: data
    })
}

//获得整改记录分页
export function getTechnologicalRectificationPage(data: TechnologicalRectificationSaveReqVO) {
    return request.post({
        method: 'get',
        url: '/technologicalrectification/technological-rectification/page',
        params: data
    })
}