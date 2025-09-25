import request from '@/config/axios'

export interface ProjectTaskAssignmentSaveReqVO {
    id?: number
    projectId: number
    taskId: number
    assigneeMemberId: number
    assigneeName: string
    collaboratorMemberIds: number[]
    collaboratorNames: string[]
    assignmentType: number
    assignmentNotes: string
    workloadScore: number
    difficultyLevel: number
    skillMatchScore: number
}







//更新任务分配记录.
export const thQdProjectTaskAssignmentUpdate = (data: ProjectTaskAssignmentSaveReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/task-assignment/update`,
    data
    });
}
//创建任务分配记录
export const thQdProjectTaskAssignmentCreate = (data: ProjectTaskAssignmentSaveReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/task-assignment/create`,
    data
    });
}


//更新状态
//更新状态
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







//获得任务分配记录分页
export const thQdProjectTaskAssignmentPage = (params: PageParam & {
    pageNo ?: number
    pageSize?: number
}) => {
    return request.post({
    method: 'get',
    url: `/technological/task-assignment/page`,
    params
    });
}

//获得项目任务
export const thQdProjectTaskAssignmentGet = (id: number) => {
    return request.post({
    method: 'get',
    url: `/technological/task/get`,
    params: { id }
    });
}










//删除任务分配记录
export const thQdProjectTaskAssignmentDelete = (id: number) => {
    return request.post({
    method: 'delete',
    url: `/technological/task-assignment/delete`,
    params: { id }
    });
}