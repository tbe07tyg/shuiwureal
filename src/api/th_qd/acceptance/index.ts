// 验收系统 API 统一导出

export * from './types'
export * from './acceptance'
export * from './project'
export * from './management'
export * from './conclusion'

import * as acceptanceApi from './acceptance'
import * as projectApi from './project'
import * as managementApi from './management'
import * as conclusionApi from './conclusion'

export const acceptanceSystemApi = {
  ...acceptanceApi,
  ...projectApi,
  ...managementApi,
  ...conclusionApi
}

export default acceptanceSystemApi


