import request from '@/config/axios'
import { ApprovalApiResponse, ApprovalPageResponse, TechnologicalProjectPageReqVO, TechnologicalProjectRespVO } from '../../approval/types';








// export interface midtermApplicationSaveReqVO {
//   "id": number,
//   "projectId": number,
//   "applicationNo": string,
//   "applicationType": number,//申请类型(1:中期检查,2:专项检查)
//   "applicationStatus": number,//申请状态(1:材料审核中,2:会议待组织,3:会议已安排,4:检查通过,5:有条件通过,6:检查未通过)
//   "expectedMidtermTime": string,
//   "applicationDescription": string,
//   "notes": string,
//   "midtermMaterialDOList": [
//     {
//         "id": number,
//         "projectId": number,
//         "midtermApplicationId": number,
//         "materialType": number, //材料类型(1:中期报告,2:技术方案,3:实施计划,4:调研报告,5:其他)
//         "materialName": string,//材料名称
//         "fileUrl": string,//文件URL
//         "fileSize": number,
//         "fileSuffix": string,//文件后缀
//         "isRequired": boolean,//是否必填
//         "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
//         "sort": number
//     }
//   ]
// }

export interface midtermApplicationSaveReqVO {
  "id": number,
  "projectId": number,
  "applicationNo": string,
  "applicationType": number,//申请类型(1:中期检查,2:专项检查)
  "applicationStatus": number,//申请状态(1:材料审核中,2:会议待组织,3:会议已安排,4:检查通过,5:有条件通过,6:检查未通过)
  "expectedMidtermTime": string,
  "applicationDescription": string,
  "notes": string,
}

//创建中期申请
export interface midtermApplicationSaveReqVO {
  "id": number,
  "projectId": number,
  "applicationNo": string,
  "applicationType": number,//申请类型(1:中期检查,2:专项检查)
  "applicationStatus": number,//申请状态(1:材料审核中,2:会议待组织,3:会议已安排,4:检查通过,5:有条件通过,6:检查未通过)
  "expectedMidtermTime": string,
  "applicationDescription": string,
  "notes": string,
  "midtermMaterialDOList": midtermMaterialSaveReqVO[]
}

export interface midtermMaterialDOList {
  "id": number,
  "projectId": number,
  "midtermApplicationId": number,
  "materialType": number, //材料类型(1:中期报告,2:技术方案,3:实施计划,4:调研报告,5:其他)
  "materialName": string,//材料名称
  "fileUrl": string,//文件URL
  "fileSize": number,
  "fileSuffix": string,//文件后缀
  "isRequired": boolean,//是否必填
  "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
  "sort": number
}



//创建中期申请材料

export interface midtermMaterialSaveReqVO {
  "id": number,
  "projectId": number,
  "midtermApplicationId": number,
  "materialType": number, //材料类型(1:中期报告,2:技术方案,3:实施计划,4:调研报告,5:其他)
  "materialName": string,//材料名称
  "fileUrl": string,//文件URL
  "fileSize": number,
  "fileSuffix": string,//文件后缀
  "isRequired": boolean,//是否必填
  "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
  "sort": number
}



//分页
export interface ThQdMidPageReqVO {
  "id": number,
  "projectId": number,
  "applicationNo": string,
  "applicationType": number,
  "applicationStatus": number,
  "expectedMidtermTime": string,
  "applicationDescription": string,
  "notes": string,
  "createTime": string
}











// 创建中期申
// **接口地址**:`/admin-api/technological/midterm-material/create`
export const thQdMidAdd = (data: midtermApplicationSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-application/create`,
    data
  });
};

// 更新中期申请材料
export const thQdMidUpdate = (data: midtermApplicationSaveReqVO) => {
  return request.put({
    url: `/technological/midterm-application/update`,
    data
  });
};

//获得中期申请分页
export const thQdMidPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-application/page`,
    params
  });
};

//获得中期申请详情
export const thQdMidDetail = (id: number) => {
  return request.get({
    url: `/technological/midterm-application/get`,
    params: { id }
  });
};
//导出中期申请
export const thQdMidExport = (data: ThQdMidPageReqVO) => {
  return request.post({
    url: `/technological/midterm-application/export-excel`,
    data
  });
};

//获得项目中期申请统计
export const thQdMidStatistics = () => {
  return request.get({
    url: `/technological/midterm-application/getMidtermApplicationStatistics`
  });
};

//删除中期申请
export const thQdMidDelete = (id: number) => {
  return request.post({
    method: 'delete',
    url: `/technological/midterm-application/delete`,
    params: { id }
  });
};


//批量删除中期申请
export const thQdMidBatchDelete = (ids: number[]) => {
  return request.post({
    method: 'delete',
    url: `/technological/midterm-application/batch-delete`,
    data: { ids }
  });
};









/**
 * 获得项目立项申请分页
 */
export const getTechnologicalProjectPage = (params: TechnologicalProjectPageReqVO) => {
  return request.get<ApprovalPageResponse<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/page',
    params
  })
}

/**
 * 获得项目立项申请详情
 */
export const getTechnologicalProject = (id: number) => {
  return request.get<ApprovalApiResponse<TechnologicalProjectRespVO>>({
    url: '/technologicalproject/technological-project/get',
    params: { id }
  })
}






//创建中期申请材料
export const thQdMidMaterialAdd = (data: midtermMaterialSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-material/create`,
    data
  });
};
//更新中期申请材料
export const thQdMidMaterialUpdate = (data: midtermMaterialSaveReqVO) => {
  return request.put({
    url: `/technological/midterm-material/update`,
    data
  });
};
//获得中期申请材料分页
export const thQdMidMaterialPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-material/page`,
    params
  });
};

export function thQdMidMaterialPage1(params: { pageNo: number; pageSize: number; midtermApplicationId?: number }) {
  return request.get({
    url: '/api/midterm/material/page',
    params
  })
}

//获得中期申请材料详情
export const thQdMidMaterialDetail = (id: number) => {
  return request.get({
    url: `/technological/midterm-material/get`,
    params: { id }
  });
};
//导出中期申请材料
export const thQdMidMaterialExport = (data: ThQdMidPageReqVO) => {
  return request.post({
    url: `/technological/midterm-material/export-excel`,
    data
  });
};
//删除中期申请材料
export const thQdMidMaterialDelete = (id: number) => {
  return request.post({
    url: `/technological/midterm-material/delete`,
    data: { id }
  });
};
//批量删除中期申请材料
export const thQdMidMaterialBatchDelete = (ids: number[]) => {
  return request.post({
    url: `/technological/midterm-material/batch-delete`,
    data: { ids }
  });
};























//管理后台 - [中期]中期材料审核记录

export interface MidtermMaterialReviewSaveReqVO{
  "id": number,
  "midtermApplicationId": number,
  "materialId": number,
  "reviewResult": number,//审核结果（0-待审核 1-通过, 2-驳回）
  "reviewOpinion": string,//审核意见
  "reviewer": string,
  "reviewTime": string,//审核时间(date-time)
  "isFinalReview": boolean//是否最终审核结论
}

//更新中期材料审核记录
export const thQdMidMaterialReviewUpdate = (data: MidtermMaterialReviewSaveReqVO) => {
  return request.put({
    url: `/technological/midterm-material-review/update`,
    data
  });
};
//创建中期材料审核记录
export const thQdMidMaterialReviewCreate = (data: MidtermMaterialReviewSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-material-review/create`,
    data
  });
};
//获得中期材料审核记录分页
export const thQdMidMaterialReviewPage = (params: {
  pageNo: number;
  pageSize: number;
  midtermApplicationId?: number; // 添加可选的midtermApplicationId参数
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-material-review/page`,
    params
  });
};
//获得中期材料审核记录详情
export const thQdMidMaterialReviewDetail = (id: number) => {
  return request.get({
    url: `/technological/midterm-material-review/get`,
    params: { id }
  });
};
//导出中期材料审核记录
export const thQdMidMaterialReviewExport = (data: ThQdMidPageReqVO) => {
  return request.post({
    url: `/technological/midterm-material-review/export-excel`,
    data
  });
};
//删除中期材料审核记录
export const thQdMidMaterialReviewDelete = (id: number) => {
  return request.post({
    url: `/technological/midterm-material-review/delete`,
    data: { id }
  });
};
//批量删除中期材料审核记录
export const thQdMidMaterialReviewBatchDelete = (ids: number[]) => {
  return request.post({
    url: `/technological/midterm-material-review/batch-delete`,
    data: { ids }
  });
};