import request from '@/config/axios'

export interface MidtermMeetingSaveReqVO {
  "id": number,
  "midtermApplicationId": number,
  "meetingNo": string,
  "meetingName": string,
  "meetingTime": string,
  "meetingPlace": string,
  "meetingType": number,//会议形式（0-现场会议, 1-线上会议, 2-混合会议）
  "meetingStatus": number,//会议状态（0-待组织, 1-已安排, 2-进行中, 3-已结束）
  "meetingMinutes": string,//会议纪要
  "meetingInstructions": string,//会议说明
  "midtermMeetingParticipantDOList": [//会议参与人列表
    {
      "createTime": string,
      "updateTime": string,
      "creator": string,
      "updater": string,
      "deleted": boolean,
      "id": number,
      "meetingId": number,
      "userId": number,
      "participantRole": number,
      "participantName": string,
      "participantTitle": string,
      "participantOrganization": string,
      "attendanceStatus": number,
      "sort": number
    }
  ],
  "midtermMeetingMaterialDOList": [//会议资料列表
    {
      "createTime": string,
      "updateTime": string,
      "creator": string,
      "updater": string,
      "deleted": boolean,
      "id": number,
      "meetingId": number,
      "materialSource": boolean,
      "materialName": string,
      "fileUrl": string,
      "fileSize": number,
      "fileSuffix": string,
      "sort": number
    }
  ]
}

export interface PageResultMidtermMeetingRespVO {
				"id": number,
				"midtermApplicationId": number,
				"meetingNo": string,
				"meetingName": string,
				"meetingTime": string,
				"meetingPlace": string,
				"meetingType": number,//会议形式（0-现场会议, 1-线上会议, 2-混合会议）
				"meetingStatus": number,//会议状态（0-待组织, 1-已安排, 2-进行中, 3-已结束）
				"meetingMinutes": string,
				"meetingInstructions": string,
				"createTime": string
}

export interface MidtermMeetingRespVO {
				"id": number,
				"midtermApplicationId": number,
				"meetingNo": string,
				"meetingName": string,
				"meetingTime": string,
				"meetingPlace": string,
				"meetingType": number,//会议形式（0-现场会议, 1-线上会议, 2-混合会议）
				"meetingStatus": number,//会议状态（0-待组织, 1-已安排, 2-进行中, 3-已结束）
				"meetingMinutes": string,
				"meetingInstructions": string,
				"createTime": string
}




export interface PageResultMidtermMeetingRemindRespVO {
  "id": number,
  "meetingId": number,
  "meetingTitle": string,
  "startTime": string,
  "remindPersonnel": string,
  "reminderType": number,//提醒类型 0 HOUR小时 或 1 DAY天 2 MINUTE 分钟
  "reminderValue": number,
  "inAdvanceTime": string
}




//更新中期会议
export function updateMidtermMeeting(data: MidtermMeetingSaveReqVO): Promise<any> {
    return request.put({
      url: `/technological/midterm-meeting/update`,
      data
    });
  }

//创建中期会议
export function createMidtermMeeting(data: MidtermMeetingSaveReqVO): Promise<any> {
    return request.post({
      url: `/technological/midterm-meeting/create`,
      data
    });
}
//获得中期会议分页
export const getMidtermMeetingPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<PageResultMidtermMeetingRespVO> => {
  return request.get({
    url: `/technological/midterm-meeting/page`,
    params
  });
};

export function getMidtermRectificationPage1(params: { pageNo: number; pageSize: number; id?: number }) {
  return request.get({
    url: '/api/midterm/material/page',
    params
  })
}



//获得中期会议详情
export const getMidtermMeetingDetail = (id: number): Promise<MidtermMeetingRespVO> => {
  return request.get({
    url: `/technological/midterm-meeting/get`,
    params: { id }
  });
};

//导出会议excel
export const exportMidtermMeetingExcel = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting/export-excel`,
    params
  });
};
//删除中期会议
export const deleteMidtermMeeting = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting/delete`,
    params: { id }
  });
};
//批量删除
export const deleteMidtermMeetingBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting/delete-batch`,
    params: { ids }
  });
};




























//中期会议相关接口



export interface MidtermMeetingRemindSaveReqVO {
  "id": number,
  "meetingId": number,
  "meetingTitle": string,
  "startTime": string,
  "remindPersonnel": string,
  "reminderType": number,//提醒类型 0 HOUR小时 或 1 DAY天 2 MINUTE 分钟
  "reminderValue": number,
  "inAdvanceTime": string
}

export interface PageResultMidtermMeetingRemindRespVO {
  "id": number,
  "meetingId": number,
  "meetingTitle": string,
  "startTime": string,
  "remindPersonnel": string,
  "reminderType": number,//提醒类型 0 HOUR小时 或 1 DAY天 2 MINUTE 分钟
  "reminderValue": number,
  "inAdvanceTime": string
}

//更新中期会议提前提醒
export function updateMidtermMeetingRemind(data: MidtermMeetingRemindSaveReqVO): Promise<any> {
  return request.put({
    url: `/technological/midterm-meeting/remind/update`,
    data
  });
}

//创建中期会议提前提醒
export function createMidtermMeetingRemind(data: MidtermMeetingRemindSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-meeting/remind/create`,
    data
  });
}

//创建会议前提醒 定时任务
export function createMidtermMeetingRemindTask(data: MidtermMeetingRemindSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-meeting/remind/createMeetingRemind`,
    data
  });
}

//获得中期会议提前提醒分页
export const getMidtermMeetingRemindPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<PageResultMidtermMeetingRemindRespVO> => {
  return request.get({
    url: `/technological/midterm-meeting/remind/page`,
    params
  });
};

//获得中期会议提前提醒
export const getMidtermMeetingRemind = (id: number): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting/remind/get`,
    params: { id }
  });
};
//导出中期会议提前提醒 Excel
export const exportMidtermMeetingRemindExcel = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting/remind/export-excel`,
    params
  });
};

//删除中期会议提前提醒
export const deleteMidtermMeetingRemind = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting/remind/delete`,
    params: { id }
  });
};
//批量删除中期会议提前提醒
export const deleteMidtermMeetingRemindBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting/remind/delete-batch`,
    params: { ids }
  });
};














//管理后台 - [中期]中期会议参与人

export interface MidtermMeetingParticipantSaveReqVO {
  "id": number,
  "meetingId": number,
  "userId": number,
  "participantRole": number,//参与者角色（0-主持人, 1-专家, 2-记录员, 3-观察员）
  "participantName": string,
  "participantTitle": string,
  "participantOrganization": string,
  "attendanceStatus": number,//出席状态（0-已邀请, 1-已确认, 2-已出席, 3-缺席）
  "sort": number
}


export interface PageResultMidtermMeetingParticipantRespVO {
  "id": number,
  "meetingId": number,
  "userId": number,
  "participantRole": number,//参与者角色（0-主持人, 1-专家, 2-记录员, 3-观察员）
  "participantName": string,
  "participantTitle": string,
  "participantOrganization": string,
  "attendanceStatus": number,//出席状态（0-已邀请, 1-已确认, 2-已出席, 3-缺席）
  "sort": number
}


//更新中期会议参与人
export function updateMidtermMeetingParticipant(data: MidtermMeetingParticipantSaveReqVO): Promise<any> {
  return request.put({
    url: `/technological/midterm-meeting-participant/update`,
    data
  });
}
//创建中期会议参与人
export function createMidtermMeetingParticipant(data: MidtermMeetingParticipantSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-meeting-participant/create`,
    data
  });
}
//获得中期会议参与人分页
export const getMidtermMeetingParticipantPage = (params: {
  pageNo: number;
  pageSize: number;
  meetingId?: number; // 添加会议ID参数，可选
}): Promise<PageResultMidtermMeetingParticipantRespVO> => {
  return request.get({
    url: `/technological/midterm-meeting-participant/page`,
    params
  });
};

//获得中期会议参与人
export const getMidtermMeetingParticipant = (id: number): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting-participant/get`,
    params: { id }
  });
};
//导出中期会议参与人 Excel
export const exportMidtermMeetingParticipantExcel = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting-participant/export-excel`,
    params
  });
};

//删除中期会议参与人
export const deleteMidtermMeetingParticipant = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting-participant/delete`,
    params: { id }
  });
};
//批量删除中期会议参与人
export const deleteMidtermMeetingParticipantBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting-participant/delete-batch`,
    params: { ids }
  });
};














//管理后台 - [中期]中期会议资料


export interface MidtermMeetingMaterialSaveReqVO {
  "id": number,
  "meetingId": number,
  "materialSource": number,//材料来源（0-申报单位提交, 1-专家预审意见, 2-会议记录, 3-其他）
  "materialName": string,
  "fileUrl": string,
  "fileSize": number,//文件大小(字节)
  "fileSuffix": string,//文件后缀
  "sort": number
}

export interface PageResultMidtermMeetingMaterialRespVO {
  "id": number,
  "meetingId": number,
  "materialSource": number,//材料来源（0-申报单位提交, 1-专家预审意见, 2-会议记录, 3-其他）
  "materialName": string,
  "fileUrl": string,
  "fileSize": number,//文件大小(字节)
  "fileSuffix": string,//文件后缀
}

//更新中期会议资料
export function updateMidtermMeetingMaterial(data: MidtermMeetingMaterialSaveReqVO): Promise<any> {
  return request.put({
    url: `/technological/midterm-meeting-material/update`,
    data
  });
}
//创建中期会议资料
export function createMidtermMeetingMaterial(data: MidtermMeetingMaterialSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-meeting-material/create`,
    data
  });
}
//获得中期会议资料分页
export const getMidtermMeetingMaterialPage = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<PageResultMidtermMeetingMaterialRespVO> => {
  return request.get({
    url: `/technological/midterm-meeting-material/page`,
    params
  });
};

//获得中期会议资料
export const getMidtermMeetingMaterial = (id: number): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting-material/get`,
    params: { id }
  });
};
//导出中期会议资料 Excel
export const exportMidtermMeetingMaterialExcel = (params: {
  pageNo: number;
  pageSize: number;
}): Promise<any> => {
  return request.get({
    url: `/technological/midterm-meeting-material/export-excel`,
    params
  });
};

//删除中期会议资料
export const deleteMidtermMeetingMaterial = (id: number): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting-material/delete`,
    params: { id }
  });
};
//批量删除中期会议资料
export const deleteMidtermMeetingMaterialBatch = (ids: number[]): Promise<any> => {
  return request.delete({
    url: `/technological/midterm-meeting-material/delete-batch`,
    params: { ids }
  });
};




//中期验收结论

export interface MidtermConclusionSaveReqVO {
  "id": number,
  "midtermApplicationId": number,
  "meetingId": number,
  "conclusionType": number,
  "conclusionResult": number,
  "conclusionScore": number,
  "conclusionDescription": string
}




//createMidtermConclusion,createMidtermConclusionFile

//创建中期验收结论
export function createMidtermConclusion(data: MidtermConclusionSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-acceptance-conclusion-review/create`,
    data
  });
}
//更新中期验收结论
export function updateMidtermConclusion(data: MidtermConclusionSaveReqVO): Promise<any> {
  return request.put({
    url: `/technological/midterm-acceptance-conclusion-review/update`,
    data
  });
}
//删除中期验收结论
export function deleteMidtermConclusion(id: number): Promise<any> {
  return request.delete({
    url: `/technological/midterm-acceptance-conclusion-review/delete`,
    params: { id }
  });
}
//批量删除中期验收结论
export function deleteMidtermConclusionBatch(ids: number[]): Promise<any> {
  return request.delete({
    url: `/technological/midterm-acceptance-conclusion-review/delete-batch`,
    params: { ids }
  });
}
//获得中期验收结论
export function getMidtermConclusion(id: number): Promise<any> {
  return request.get({
    url: `/technological/midterm-acceptance-conclusion-review/get`,
    params: { id }
  });
}
//获得中期验收结论分页
export function getMidtermConclusionPage(
  params: { 
    pageNo: number; 
    pageSize: number;
  }): Promise<any> {
  return request.get({
    url: `/technological/midterm-acceptance-conclusion-review/page`,
    params
  });
}








//创建中期结论文件
export interface MidtermConclusionFileSaveReqVO {
  "id": number,
  "conclusionId": number,
  "fileName": string,
  "fileUrl": string,
  "fileSize": number,
  "fileSuffix": string,
  "sort": number
}





//createMidtermConclusionFile,updateMidtermConclusionFile,getMidtermConclusionFile,getMidtermConclusionFilePage






//创建中期结论文件
export function createMidtermConclusionFile(data: MidtermConclusionFileSaveReqVO): Promise<any> {
  return request.post({
    url: `/technological/midterm-conclusion-file/create`,
    data
  });
}

//更新中期结论文件
export function updateMidtermConclusionFile(data: MidtermConclusionFileSaveReqVO): Promise<any> {
  return request.put({
    url: `/technological//midterm-conclusion-file/update`,
    data
  });
}


// deleteMidtermConclusionFile,updateMidtermConclusionFile
//删除中期结论文件
export function deleteMidtermConclusionFile(id: number): Promise<any> {
  return request.delete({
    url: `/technological/midterm-conclusion-file/delete`,
    params: { id }
  });
}

//批量删除中期结论文件
export function deleteMidtermConclusionFileBatch(ids: number[]): Promise<any> {
  return request.delete({
    url: `/technological//midterm-conclusion-file/delete-batch`,
    params: { ids }
  });
}

//获得中期结论文件
export function getMidtermConclusionFile(id: number): Promise<any> {
  return request.get({
    url: `/technological//midterm-conclusion-file/get`,
    params: { id }
  });
}

//获得中期结论文件分页
export function getMidtermConclusionFilePage(params: { pageNo: number; pageSize: number; conclusionId: number }): Promise<any> {
  return request.get({
    url: `/technological/midterm-conclusion-file/page`,
    params
  });
}
