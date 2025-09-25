import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImplementationStore = defineStore('implementation', () => {
  // 项目节点配置
  const projectNodes = ref({})
  
  // 保存节点配置
  function saveProjectNodes(projectId, nodes) {
    projectNodes.value[projectId] = nodes
  }
  
  // 获取项目节点配置
  function getProjectNodes(projectId) {
    return projectNodes.value[projectId] || []
  }
  
  // 更新项目节点状态
  function updateProjectNodeStatus(projectId, nodeId, status) {
    const nodes = projectNodes.value[projectId]
    if (nodes) {
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        node.status = status
      }
    }
  }

  return {
    projectNodes,
    saveProjectNodes,
    getProjectNodes,
    updateProjectNodeStatus
  }
}) 