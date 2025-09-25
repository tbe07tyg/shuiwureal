// 获取成员任务统计（通过API调用获取真实数据）
const getMemberTaskStats = async (member) => {
  // 默认值
  let currentTasks = 0
  let completedTasks = 0
  let pendingTasks = 0

  try {
    // 准备请求参数
    const params = {
      pageNo: 1,
      pageSize: 100, // 获取足够多的数据
      assigneeName: member.name, // 使用成员名称作为查询条件
    }

    // 如果选择了特定项目，则添加项目ID过滤条件
    if (manualProjectId.value && manualProjectId.value !== 'ALL_PROJECTS') {
      params.projectId = manualProjectId.value
    }

    // 调用API获取任务分配数据
    const response = await thQdProjectTaskAssignmentPage(params)

    // 处理响应数据
    const taskList = response?.list || response?.data?.list || response?.data?.records || []

    // 统计不同状态的任务数量
    if (Array.isArray(taskList) && taskList.length > 0) {
      taskList.forEach(task => {
        const taskStatus = task.projectTaskDO?.taskStatus || task.taskStatus || 1

        // 根据任务状态统计
        if (taskStatus === 1) { // 待开始
          pendingTasks++
        } else if (taskStatus === 2 || taskStatus === 3) { // 进行中
          currentTasks++
        } else if (taskStatus === 4) { // 已完成
          completedTasks++
        }
      })
    }
  } catch (error) {
    console.error(`获取成员 ${member.name} 的任务统计数据失败:`, error)
    // 如果API调用失败，返回默认值
  }

  return {
    currentTasks,
    completedTasks,
    pendingTasks
  }
}