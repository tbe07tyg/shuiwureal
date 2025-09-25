import request from '@/config/axios'


export interface MidtermRectificationSaveReqVO {
    id: number,// 主键
    midtermApplicationId: number,// 中期申请id
    meetingConclusionId: number,// 关联的会议结论ID
    rectificationNo: string,// 整改编号
    rectificationRequirements: string,//整改要求
    rectificationDeadline: string,//整改截止日期
    applicantResponse: string,//申请人整改说明
    reviewResult: number,//审核结论（0-待处理, 1-通过, 2-驳回）
    reviewOpinion: string,//审核意见
    reviewer: string,//审核人
    reviewTime: string,//审核时间
}

//thQdMidRectificationCreate,thQdMidRectificationUpdate,thQdMidRectificationDelete,thQdMidRectificationPage,thQdMidRectificationDetail

//创建中期整改记录
export const thQdMidRectificationCreate = (data: MidtermRectificationSaveReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/midterm-rectification/create`,
    data
    });
};

//更新中期整改记录
export const thQdMidRectificationUpdate = (data: MidtermRectificationSaveReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/midterm-rectification/update`,
    data
    });
};

//删除中期整改记录
export const thQdMidRectificationDelete = (id: number) => {
    return request.post({
    method: 'delete',
    url: `/technological/midterm-rectification/delete`,
    data: { id }
    });
};

//获得中期整改记录分页
export const thQdMidRectificationPage = (params: {
    pageNo: number;
    pageSize: number;
    midtermApplicationId?: number; // 添加可选的midtermApplicationId参数
}): Promise<any> => {
    return request.post({
    method: 'get',
    url: `/technological/midterm-rectification/page`,
    params
    });
};

//获得中期整改记录详情
export const thQdMidRectificationDetail = (id: number) => {
    return request.post({
    method: 'get',
    url: `/technological/midterm-rectification/get`,
    params: { id }
    });
};