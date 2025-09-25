// 工具：任务状态与统计

export enum TaskStatus {
  PENDING = 0,
  PLANNING = 1,
  IN_PROGRESS = 2,
  EXECUTING = 3,
  COMPLETED = 4,
  FINISHED = 5
}

export interface MemberTaskStats {
  currentTasks: number
  completedTasks: number
  pendingTasks: number
}

export const calculateMemberTaskStats = (tasks: any[]): MemberTaskStats => {
  if (!Array.isArray(tasks)) {
    return { currentTasks: 0, completedTasks: 0, pendingTasks: 0 }
  }
  const stats = tasks.reduce((acc, task) => {
    const status = Number(task.taskStatus)
    if (status === TaskStatus.IN_PROGRESS || status === TaskStatus.EXECUTING) acc.currentTasks++
    else if (status === TaskStatus.COMPLETED || status === TaskStatus.FINISHED) acc.completedTasks++
    else if (status === TaskStatus.PENDING || status === TaskStatus.PLANNING) acc.pendingTasks++
    return acc
  }, { currentTasks: 0, completedTasks: 0, pendingTasks: 0 } as MemberTaskStats)
  return stats
}


