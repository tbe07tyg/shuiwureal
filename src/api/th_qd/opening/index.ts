// 项目开题系统 API 统一导出文件

// 导出所有类型定义
export * from './types'

// 导出主要API接口
export * from './opening'

// 导出项目选择相关API
export * from './project'

// 导出会议结论管理相关API

// 导出默认API对象（方便统一使用）
import * as openingApi from './opening'
import * as projectApi from './project'
import * as conclusionApi from './conclusion'

export const openingSystemApi = {
  ...openingApi,
  ...projectApi,
  ...conclusionApi
}

// 默认导出
export default openingSystemApi
