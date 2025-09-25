import request from '@/config/axios'


export  interface ProjectTaskSaveReqVO {
    id?: number;
    projectId?: number;
    parentTaskId?: number;
    taskTitle?: string;
    taskDescription?: string;
    taskType?: number;
    taskLevel?: number;
    taskOrder?: number;
    objectives?: string;
    activities?: string;
    keyTechnologies?: string;
    deliverables?: string;
    budget?: number;
    estimatedHours?: number;
    plannedStartDate?: string;
    plannedEndDate?: string;
    deadline?: string;
    priority?: string;
    submissionFormat?: string;
    needAttachment?: boolean;
    templateConfig?: string;
    sourceType?: number;
    sourceAnalysisId?: number;
}

//更新项目任务
export const thQdProjectTaskUpdate = (data: ProjectTaskSaveReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/task/update`,
    data
    });
};

//创建项目任务
export const thQdProjectTaskCreate = (data: ProjectTaskSaveReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/task/create`,
    data
    });
};

//获得项目任务分页
export const thQdProjectTaskPage = (params: {
    pageNo: number;
    pageSize: number;
    projectId?: number; // 添加可选的projectId参数
}): Promise<any> => {
    return request.post({
    method: 'get',
    url: `/technological/task/page`,
    params
    });
};

//获得项目任务
export const thQdProjectTaskGet = (id: number) => {
    return request.post({
    method: 'get',
    url: `/technological/task/get`,
    params: { id }
    });
};

//删除项目任务
export const thQdProjectTaskDelete = (id: number) => {
    return request.post({
    method: 'delete',
    url: `/technological/task/delete`,
    params: { id }
    });
};

//[团队成员工作台-我的待办事项]获得我的待办事项分页
export const thQdProjectTaskMyTodoPage = (params: {
    pageNo: number;
    pageSize: number;
    projectId?: number; // 添加可选的projectId参数
}): Promise<any> => {
    return request.post({
    method: 'get',
    url: `/technological/task/my-todo/page`,
    params
    });
};





//分配任务
export interface TaskAssignReqVO {
    taskId: number;
    assigneeMemberId?: number;
    assigneeName?: string;
    collaboratorMemberIds?: string;
    collaboratorNames?: string;
    assignmentNotes?: string;
    workloadScore?: number;
    difficultyLevel?: number;
    skillMatchScore?: number;
}
//任务协作人员
export interface TaskCollaboratorReqVO {
    taskId: number;
    collaboratorMemberIds?: number[];
    collaboratorNames?: string;
}
//更新任务协作人员
export const thQdProjectTaskCollaboratorUpdate = (data: TaskCollaboratorReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/task/update-collaborators`,
    data
    });
};




//分配任务
export const thQdProjectTaskAssign = (data: TaskAssignReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/task/assign`,
    data
    });
};
//取消任务分配
export const thQdProjectTaskCancelAssign = (taskId: number) => {
    return request.post({
    method: 'post',
    url: `/technological/task/unassign`,
    params: { taskId }
    });
}

//获取任务分配信息
export const thQdProjectTaskGetAssignInfo = (taskId: number) => {
    return request.post({
    method: 'get',
    url: `/technological/task/get-assignment`,
    params: { taskId }
    });
}


//thQdProjectTaskUpdate,thQdProjectTaskCreate,thQdProjectTaskPage,thQdProjectTaskGet,thQdProjectTaskDelete,thQdProjectTaskMyTodoPage,thQdProjectTaskCollaboratorUpdate,thQdProjectTaskAssign,thQdProjectTaskCancelAssign,thQdProjectTaskGetAssignInfo