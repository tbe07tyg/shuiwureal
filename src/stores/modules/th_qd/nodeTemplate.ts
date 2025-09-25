import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TemplateNode {
  id: string
  name: string
  percent: number
  condition?: string
  deadline?: any
  attachments?: any[]
}

export interface NodeTemplateItem {
  id: string
  name: string
  nodes: TemplateNode[]
}

export const useNodeTemplateStore = defineStore('th_qd_node_template', () => {
  const templateList = ref<NodeTemplateItem[]>([])

  function addTemplate(item: { name: string; nodes: TemplateNode[] }) {
    const id = Math.random().toString(36).slice(2, 10)
    templateList.value.push({ id, name: item.name, nodes: item.nodes })
  }

  function updateTemplate(id: string, item: { name: string; nodes: TemplateNode[] }) {
    const index = templateList.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templateList.value[index] = { id, name: item.name, nodes: item.nodes }
    }
  }

  function deleteTemplate(id: string) {
    templateList.value = templateList.value.filter(t => t.id !== id)
  }

  return {
    templateList,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  }
})


