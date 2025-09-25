import request from '@/config/axios'

export interface TaskSubmissionCreateReqVO {
  taskId: number;
  projectId: number;
  templateId: number;
  submissionTitle: string;
  submissionContent: string;//提交内容JSON,示例值({"workContent":"完成需求分析","completionStatus":"100%"})
  submissionType: number;
  attachmentCount: number;
  submitterName: string;
  submissionNotes?: string;
  taskFileDO:[{
    systemFileDO:{
      fileName: string;
      fileSize: number;
      fileType: string;
      fileUrl: string;
      filePath: string;
    };
  }]
}


export interface TaskSubmissionUpdateReqVO{
  id?: number;
  submissionTitle?: string;
  submissionContent?: string;//提交内容JSON,示例值({"workContent":"完成需求分析","completionStatus":"100%"})
  attachmentCount?: number;
  submissionNotes?: string;
}


export interface TaskReviewReqVO{
  submissionId?: number;
  reviewStatus?: number;
  reviewerId?: number;
  reviewerName?: string;
  reviewComment?: string;
  reviewRequirements?: string;
}














export const thQdProjectTaskAssignmentUpdateStatus = (data: {
    id: number
    taskStatus: number
}) => {
    return request.post({
    method: 'put',
    url: `/technological/task/updateTaskStatus`,
    data
    });
}





//创建任务提交
export const thQdProjectTaskSubmissionCreate = (data: TaskSubmissionCreateReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/submission/create`,
    data
    });
}

//更新任务提交记录
export const thQdProjectTaskSubmissionUpdate = (data: TaskSubmissionUpdateReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/submission/update`,
    data
    });
}
//获取提交统计
export const thQdProjectTaskSubmissionGetStatistics = (projectId: number) => {
    return request.post({
    method: 'get',
    url: `/technological/submission/statistics`,
    params: { projectId }
    });
}

//获取待审核的提交记录
export const thQdProjectTaskSubmissionGetReviewList = (reviewerId: number) => {
    return request.post({
    method: 'get',
    url: `/technological/submission/pending-review`,
    params: { reviewerId }
    });
}

//获得任务提交记录分页
export const thQdProjectTaskSubmissionGetPage = (params: any) => {
    return request.post({
    method: 'get',
    url: `/technological/submission/page`,
    params
    });
}

//审核任务提交
export const thQdProjectTaskSubmissionReview = (data: TaskReviewReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/submission/review`,
    data
    });
}