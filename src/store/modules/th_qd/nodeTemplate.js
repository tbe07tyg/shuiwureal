import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNodeTemplateStore = defineStore('nodeTemplate', () => {
  // 模板列表
  const templateList = ref([
    { id: 'T001', name: '标准科研项目模板', nodes: [
      { id: 'N1', name: '首付款', percent: 30, condition: '合同签订后7日内', dependency: '', deadline: null, attachments: [] },
      { id: 'N2', name: '中期款', percent: 40, condition: '项目进度过半', dependency: 'N1', deadline: null, attachments: [] },
      { id: 'N3', name: '尾款', percent: 30, condition: '项目验收合格', dependency: 'N2', deadline: null, attachments: [] }
    ] }
  ])

  // 新增模板
  function addTemplate(tpl) {
    templateList.value.push({ ...tpl, id: `T${Date.now()}` })
  }
  // 编辑模板
  function updateTemplate(id, tpl) {
    const idx = templateList.value.findIndex(t => t.id === id)
    if (idx !== -1) templateList.value[idx] = { ...tpl, id }
  }
  // 删除模板
  function deleteTemplate(id) {
    templateList.value = templateList.value.filter(t => t.id !== id)
  }

  return {
    templateList,
    addTemplate,
    updateTemplate,
    deleteTemplate
  }
}) 