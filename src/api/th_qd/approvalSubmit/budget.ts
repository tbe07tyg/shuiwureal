import request from '@/config/axios'

export interface RdBudgetCategoriesSaveReqVO {
    id: number,
    projectId: number,
    laborCosts: string, //人员人工费详情
    directInputCosts: string, //直接投入费用详情
    depreciationCosts: string, //折旧费用详情
    amortizationCosts: string, //摊销费用详情
    designCosts: string, //设计费用详情
    equipmentTestingCosts: string, //装备调试费用与试验费用详情
    externalRdCosts: string, //外部RD费用详情
    otherCosts: string, //其他费用详情
    dateSubmission: string, //提交日期
    researchDocuments: ResearchDocuments[] //研发经费预算详细说明列表
}
export interface ResearchDocuments { //研发经费预算详细说明
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

//创建研发经费预算详细说明
export const thQdBudgetResearchDocumentsCreate = (data: ResearchDocuments) => {
    return request.post({
    method: 'POST',
    url: `/technological/rd-budget-categories/create`,
    data
    });
};
//更新研发经费预算详细说明
export const thQdBudgetResearchDocumentsUpdate = (data: ResearchDocuments) => {
    return request.put({
    method: 'PUT',
    url: `/technological/rd-budget-categories/update`,
    data
    });
};
//删除研发经费预算详细说明
export const thQdBudgetResearchDocumentsDelete = (id: number) => {
    return request.post({
    method: 'DELETE',
    url: `/technological/rd-budget-categories/delete`,
    data: { id }
    });
};
//获得研发经费预算详细说明分页
export const thQdBudgetResearchDocumentsPage = (params: {
    pageNo: number;
    pageSize: number;
    projectId?: number; // 添加可选的projectId参数
    }): Promise<any> => {
    return request.get({
        url: `/technological/rd-budget-categories/page`,
        params
    });
};
//获得研发经费预算详细说明详情
export const thQdBudgetResearchDocumentsDetail = (id: number) => {
    return request.get({
        method: 'GET',
        url: `/technological/rd-budget-categories/get`,
        params: { id }
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

//thQdBudgetResearchDocumentsCreate,thQdBudgetResearchDocumentsUpdate,thQdBudgetResearchDocumentsDelete,thQdBudgetResearchDocumentsPage,thQdBudgetResearchDocumentsDetail,thQdBudgetTotalPage,thQdBudgetTotalDetail