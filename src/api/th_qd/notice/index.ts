import request from '@/config/axios'


export interface NoticeSaveReqVO {
    id?: number
    title: string
    type: number
    content: string
    status: number
}




//创建通知公告
export const thQdNoticeCreate = (data: NoticeSaveReqVO) => {
    return request.post({
    method: 'post',
    url: `/system/notice/create`,
    data
    });
}

//更新通知公告
export const thQdNoticeUpdate = (data: NoticeSaveReqVO) => {
    return request.post({
    method: 'put',
    url: `/system/notice/update`,
    data
    });
}

//删除通知公告
export const thQdNoticeDelete = (id: number) => {
    return request.post({
    method: 'delete',
    url: `/system/notice/delete`,
    params: { id }
    });
}

//获取通知公告详情
export const thQdNoticeGet = (id: number) => {
    return request.post({
    method: 'get',
    url: `/system/notice/get`,
    params: { id }
    });
}

//获取通知公告分页列表
export const thQdNoticePage = (data: PageParam) => {
    return request.post({
    method: 'get',
    url: `/system/notice/page`,
    data
    });
}

//thQdNoticePage,thQdNoticeGet,thQdNoticeDelete,thQdNoticeUpdate,thQdNoticeCreate