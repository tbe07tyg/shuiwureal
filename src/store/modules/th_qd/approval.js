import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 立项流程节点顺序
 */
export const nodeOrder = ['materials', 'review', 'decision']

/**
 * 立项项目全局store
 * @see 立项中心与流程自动流转方案.txt
 */
export const useApprovalStore = defineStore('approval', () => {
  /**
   * 立项项目清单（全局响应式）
   * @type {import('vue').Ref<Array<{id:string,title:string,applicant:string,department:string,year:number,duration:number,status:string,budget:number,node:string,fileList?:Array,nodeHistory?:Array}>}>
   */
  const approvalList = ref([
    { 
      id: 'A001', 
      title: '智能水表项目立项', 
      applicant: '王五', 
      department: '技术部', 
      year: 2024, 
      duration: 18, 
      status: '未通过', 
      budget: 200, 
      applyTime: '2024-01-15',
      fileList: [
        { uid: '1', name: '项目申请书.pdf', status: 'done' },
        { uid: '2', name: '技术方案.docx', status: 'done' }
      ]
    },
    { 
      id: 'A002', 
      title: '管网监测优化立项', 
      applicant: '赵六', 
      department: '工程部', 
      year: 2024, 
      duration: 12, 
      status: '通过', 
      budget: 150, 
      applyTime: '2024-02-20',
      fileList: [
        { uid: '3', name: '立项申请表.pdf', status: 'done' },
        { uid: '4', name: '预算明细.xlsx', status: 'done' },
        { uid: '5', name: '可行性报告.docx', status: 'done' }
      ]
    },
    { 
      id: 'A003', 
      title: '水厂自动化改造', 
      applicant: '李明', 
      department: '自动化部', 
      year: 2024, 
      duration: 24, 
      status: '未通过', 
      budget: 180, 
      applyTime: '2024-03-10',
      fileList: []
    },
    { 
      id: 'A004', 
      title: '管网智能监控平台', 
      applicant: '王强', 
      department: '信息部', 
      year: 2024, 
      duration: 15, 
      status: '通过', 
      budget: 220, 
      applyTime: '2024-03-25',
      fileList: [
        { uid: '6', name: '项目计划书.pdf', status: 'done' }
      ]
    }
  ])

  /**
   * 推进项目到下一个流程节点
   * @param {string} projectId 项目ID
   * @returns {string|null} 新节点key，或null（流程已结束）
   */
  function submitAndNext(projectId) {
    const project = approvalList.value.find(p => p.id === projectId)
    if (!project) return null
    const idx = nodeOrder.indexOf(project.node)
    if (idx < nodeOrder.length - 1) {
      project.node = nodeOrder[idx + 1]
      if (!project.nodeHistory) project.nodeHistory = []
      project.nodeHistory.push({ node: project.node, time: Date.now() })
      return project.node
    } else {
      return null // 流程已结束
    }
  }

  return {
    approvalList,
    submitAndNext
  }
}) 