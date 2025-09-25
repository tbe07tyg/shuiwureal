// 成果管理 API 统一导出文件

// 导出所有类型定义
export * from './types'

// 导出主要API接口
export * from './apis'

// 导出项目选择相关API
export * from './project'

// 重新导出关键函数，确保能正确导入
export {
  getProjectAchievementPage,
  getProjectAchievement,
  createProjectAchievement,
  updateProjectAchievement,
  deleteProjectAchievement,
  deleteProjectAchievementList,
  exportProjectAchievementExcel,
  getProjectAchievementStatistics,
  getProjectAchievementFilePage,
  getProjectAchievementFile,
  createProjectAchievementFile,
  updateProjectAchievementFile,
  deleteProjectAchievementFile,
  deleteProjectAchievementFileList,
  exportProjectAchievementFileExcel
} from './apis'

export {
  getTechnologicalProjectPage,
  getTechnologicalProject,
  getAvailableProjectsForAchievements
} from './project'

// 导出默认API对象（方便统一使用）
import * as achievementsFns from './apis'
import * as projectFns from './project'

export const achievementsApi = {
  ...achievementsFns,
  ...projectFns
}

// 默认导出
export default achievementsApi