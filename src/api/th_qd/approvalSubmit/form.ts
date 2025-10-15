import request from '@/config/axios'

export interface ResearchProjectProposalsSaveReqVO {

  id?: number //主键ID(研发项目申请书ID)
  projectId?: number //项目ID
  projectName?: string //项目名称
  expectedOutcomeFormat?: number //预期成果格式(1、论文论著 2、研究报告 3、新设备 4、新材料5、新工艺或方法 6、软件 7、其他)
  totalBudget?: number //总预算
  organizationName?: string //单位名称
  projectLeader?: string //项目负责人
  contactPhone?: string //联系电话
  mainResearchDevelopmentContent?: string //主要研发内容
  projectBasisAndSignificance?: string //申请项目的依据和意义		
  projectResearch?: string  //项目研究开发内容及目标（实施方案、技术关键、技术路线和技术经济指标等）
  existingConditions?: string //实施本项目已具备的条件
  expectedBenefits?: string //项目实施的经济、社会和环境预期效益
  projectSchedule?: string //项目实施进度安排
  organizationOpinion?: string //单位意见
  organizationLeader?: string //单位负责人
  submissionDate?: string //提交日期
  status?: boolean //状态（ 0-草稿, 1-提交）
  researchDocuments?: ResearchDocuments[] //研发经费总预算表列表
}

export interface ResearchDocuments { //研发经费总预算表列表
  id?: number //主键ID
  projectId?: number //项目ID
  budgetItem?: string //预算项目
  budgetAmount?: number //预算金额
  totalBudgetPercentage?: number //总预算百分比
  itemDescription?: string //项目描述
  researchProjectProposalsId?: number //研发项目申请书ID
  rdBudgetCategoriesId?: number //研发经费预算详细说明表ID
  sort?: number //排序
}

//创建研发项目申请书
export const thQdResearchProjectProposalsCreate = (data: ResearchProjectProposalsSaveReqVO) => {
    return request.post({
    method: 'POST',
    url: `/technological/research-project-proposals/create`,
    data
    });
};
//更新研发项目申请书
export const thQdResearchProjectProposalsUpdate = (data: ResearchProjectProposalsSaveReqVO) => {
    return request.post({
    method: 'PUT',
    url: `/technological/research-project-proposals/update`,
    data
    });
};
//获取研发项目申请书详情
export const thQdResearchProjectProposalsDetail = (id: number) => {
    return request.post({
    method: 'GET',
    url: `/technological/research-project-proposals/get`,
    params: { id }
    });
};
//获取研发项目申请书列表
export const thQdResearchProjectProposalsPage = (params: {
    pageNo: number;
    pageSize: number;
  projectId?: number; // 添加可选的projectId参数
}): Promise<any> => {
    return request.post({
    method: 'GET',
    url: `/technological/research-project-proposals/page`,
    params
    });
};
//删除研发项目申请书
export const thQdResearchProjectProposalsDelete = (id: number) => {
    return request.post({
    method: 'DELETE',
    url: `/technological/research-project-proposals/delete`,
    data: { id }
    });
};

//获得研发经费总预算分页
export const thQdBudgetTotalPage = (params: {
    pageNo: number;
    pageSize: number;
    projectId?: number; // 添加可选的projectId参数
    }): Promise<any> => {
    return request.get({
        url: `/technological/rd-budget-summary/page`,
        params
    });
};

//获得研发经费总预算详情
export const thQdBudgetTotalDetail = (id: number) => {
    return request.get({
        method: 'GET',
        url: `/technological/rd-budget-summary/get`,
        params: { id }
    });
};

//更新研发经费总预算
export const thQdBudgetTotalUpdate = (data: ResearchDocuments[]) => {
    return request.post({
    method: 'PUT',
    url: `/technological/rd-budget-summary/update`,
    data
    });
};

//thQdBudgetTotalPage,thQdBudgetTotalDetail
//thQdResearchProjectProposalsCreate,thQdResearchProjectProposalsUpdate,thQdResearchProjectProposalsDetail,thQdResearchProjectProposalsPage,thQdResearchProjectProposalsDelete