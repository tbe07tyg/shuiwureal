import request from '@/config/axios'






export interface ProjectTeamMemberSaveReqVO {
    id?: number,//主键
    projectId: number,//项目id
    memberId: number,//成员id
    memberName: string,//成员名称
    memberRole: string,//成员角色
    memberSkills: string,//成员技能
    isProjectManager: boolean,//是否为项目负责人
    isActiveMember: boolean,//是否为活跃成员
    avatarUrl: string,//头像url
    joinDate: string,//加入日期
}

//更新项目团队成员
export const thQdProjectTeamMemberUpdate = (data: ProjectTeamMemberSaveReqVO) => {
    return request.post({
    method: 'put',
    url: `/technological/team-member/update`,
    data
    });
};

//创建团队成员
export const thQdProjectTeamMemberCreate = (data: ProjectTeamMemberSaveReqVO) => {
    return request.post({
    method: 'post',
    url: `/technological/team-member/create`,
    data
    });
};

//删除团队成员
export const thQdProjectTeamMemberDelete = (id: number) => {
    return request.post({
    method: 'delete',
    url: `/technological/team-member/delete`,
    params: { id }
    });
}

//获得项目团队成员分页
export const thQdProjectTeamMemberPage = (params: {
    pageNo: number;
    pageSize: number;
    projectId?: number; // 添加可选的projectId参数
}): Promise<any> => {
    return request.post({
    method: 'get',
    url: `/technological/team-member/page`,
    params
    });
};

//获得项目团队成员列表
export const thQdProjectTeamMemberList = (params: {
    projectId?: number; // 添加可选的projectId参数
}): Promise<any> => {
    return request.post({
    method: 'get',
    url: `/technological/team-member/list`,
    params
    });
};

//thQdProjectTeamMemberUpdate,hQdProjectTeamMemberCreate,thQdProjectTeamMemberDelete,thQdProjectTeamMemberPage,thQdProjectTeamMemberList