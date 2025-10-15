import request from '@/config/axios'




export interface MidtermRectificationSaveReqVO {
  "id": number,
  "midtermApplicationId": number,
  "meetingConclusionId": number,
  "rectificationNo": string,
  "rectificationRequirements": string,
  "rectificationDeadline": string,
  "applicantResponse": string,
  "reviewResult": number,//审核结论（0-待处理, 1-通过, 2-驳回）
  "reviewOpinion": string,
  "reviewer": string,
  "reviewTime": string
}


export interface PageResultMidtermRectificationRespVO {
  "id": number,
  "projectId": number,
  "applicationNo": string,
  "applicationType": number,
  "applicationStatus": number,
  "expectedMidtermTime": string,
  "applicationDescription": string,
  "notes": string,
  "createTime": string,
  "midtermRectificationList": Array<{
      "id": number,
      "midtermApplicationId": number,
      "meetingConclusionId": number,
      "rectificationNo": string,
      "rectificationRequirements": string,
      "rectificationDeadline": string,
      "applicantResponse": string,
      "reviewResult": number,//审核结论（0-待处理, 1-通过, 2-驳回）
      "reviewOpinion": string,
      "reviewer": string,
      "reviewTime": string
    }>,
  "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
  "sort": number
}


export interface MidtermRectificationSaveReqVO {
  "id": number,
  "midtermApplicationId": number,
  "meetingConclusionId": number,
  "rectificationNo": string,
  "rectificationRequirements": string,
  "rectificationDeadline": string,
  "applicantResponse": string,
  "reviewResult": number,//审核结论（0-待处理, 1-通过, 2-驳回）
  "reviewOpinion": string,
  "reviewer": string,
  "reviewTime": string
}





//更新中期整改记录
export const updateMidtermRectification = (data: MidtermRectificationSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-rectification/update`,
    data
  });
};



//创建中期整改记录
export const createMidtermRectification = (data: MidtermRectificationSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-rectification/create`,
    data
  });
};

//获得中期整改记录分页
export const getMidtermRectificationPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<PageResultMidtermRectificationRespVO> => {
  return request.get({
    url: `/technological/midterm-rectification/page`,
    params
  });
};

//获得中期整改记录
export const getMidtermRectification = (id: number): Promise<PageResultMidtermRectificationRespVO> => {
  return request.get({
    url: `/technological/midterm-rectification/get`,
    params: { id }
  });
};

//导出中期整改记录 Excel
export const exportMidtermRectificationExcel = (data: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.post({
    url: `/technological/midterm-rectification/export-excel`,
    data,
    responseType: 'blob' // 设置响应类型为 blob
  });
};
//删除中期整改记录
export const deleteMidtermRectification = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-rectification/delete`,
    params: { id }
  });
};
//批量删除中期整改记录
export const deleteMidtermRectificationBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-rectification/delete-batch`,
    params: { ids }
  });
};




























//管理后台 - [中期]中期申请材料
export interface MidtermMaterialSaveReqVO {
  "id": number,
  "projectId": number,
  "midtermApplicationId": number,
  "materialType": number,//材料类型(1:中期报告,2:技术方案,3:实施计划,4:调研报告,5:其他)
  "materialName": string,
  "fileUrl": string,//文件地址
  "fileSize": number,//文件大小
  "fileSuffix": string,//文件后缀
  "isRequired": boolean,//是否必填
  "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
  "sort": number
}

export interface PageResultMidtermMaterialRespVO {
  "id": number,
  "projectId": number,
  "midtermApplicationId": number,
  "materialType": number,//材料类型(1:中期报告,2:技术方案,3:实施计划,4:调研报告,5:其他)
  "materialName": string,
  "fileUrl": string,//文件地址
  "fileSize": number,//文件大小
  "fileSuffix": string,//文件后缀
  "isRequired": boolean,//是否必填
  "reviewStatus": number,//审核状态(0:待审核,1:审核通过,2:审核不通过)
  "sort": number
}

//更新中期申请材料
export const updateMidtermMaterial = (data: MidtermMaterialSaveReqVO) => {
  return request.put({
    url: `/technological/midterm-material/update`,
    data
  });
};
//创建中期申请材料
export const createMidtermMaterial = (data: MidtermMaterialSaveReqVO) => {
  return request.post({
    url: `/technological/midterm-material/create`,
    data
  });
};
//获得中期申请材料分页
export const getMidtermMaterialPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<PageResultMidtermMaterialRespVO> => {
  return request.get({
    url: `/technological/midterm-material/page`,
    params
  });
};

//获得中期申请材料
export const getMidtermMaterial = (id: number): Promise<PageResultMidtermMaterialRespVO> => {
  return request.get({
    url: `/technological/midterm-material/get`,
    params: { id }
  });
};

//导出中期申请材料 Excel
export const exportMidtermMaterialExcel = (data: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.post({
    url: `/technological/midterm-material/export-excel`,
    data,
    responseType: 'blob' // 设置响应类型为 blob
  });
};
//删除中期申请材料
export const deleteMidtermMaterial = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-material/delete`,
    params: { id }
  });
};
//批量删除中期申请材料
export const deleteMidtermMaterialBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-material/delete-batch`,
    params: { ids }
  });
};