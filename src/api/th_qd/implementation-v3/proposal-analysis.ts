import request from '@/config/axios'
import { apiLog } from '@/utils/apiLogger'

/**
 * 模块：申报书解析 / 文档获取
 * 维护人：科研管理系统
 * 日期：2025-09-09
 * 说明：封装“立项申报书文档”获取等接口；页面通过领域接口层调用，避免直接拼接 URL。
 */

// ===== 请求与响应类型定义 =====

export interface ListProposalDocumentsParams {
  pageNo: number
  pageSize: number
  researchId?: number
  taskId?: number
  fileName?: string
  fileExtension?: string // 建议传入 'docx'
}

export interface ProposalDocumentItem {
  id: number
  researchId?: number
  taskId?: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  fileExtension: string
  uploadTime: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface CommonResultPage<T> {
  code: number
  data: PageResult<T>
  msg?: string
}

// ===== 接口封装 =====

/**
 * 获取立项阶段上传的申报书/相关文档（分页）
 * GET /admin-api/technological/research-document/page （全局注入前缀，模块内写单前缀）
 */
export const listProposalDocuments = async (
  params: ListProposalDocumentsParams
): Promise<CommonResultPage<ProposalDocumentItem>> => {
  const url = '/technological/research-document/page'
  apiLog({ action: '获取项目申报书文档', api: 'listProposalDocuments', method: 'GET', url, params })
  const res = await request.get<{ data: PageResult<ProposalDocumentItem>; code: number; msg?: string }>({
    url,
    params
  })
  apiLog({ action: '获取项目申报书文档', api: 'listProposalDocuments', method: 'GET', url, params }, res)
  // 直接返回后端结构（保持通用结构）
  return res as unknown as CommonResultPage<ProposalDocumentItem>
}

// ===== 推荐项挑选工具（非网络调用） =====

/**
 * 从候选文档中挑选最可能的“正式申报书”
 * 策略：关键词评分（正式/定稿优先；草稿/模板降权）→ 上传时间降序
 */
export const pickBestProposalDocument = (candidates: ProposalDocumentItem[]): ProposalDocumentItem | undefined => {
  if (!Array.isArray(candidates) || candidates.length === 0) return undefined

  const positiveKeywords = ['正式', '最终', '定稿']
  const negativeKeywords = ['草稿', '初稿', '模板', '副本', '复制']

  const score = (name: string): number => {
    const normalized = String(name || '').toLowerCase()
    let s = 0
    positiveKeywords.forEach(k => {
      if (normalized.includes(k)) s += 10
    })
    negativeKeywords.forEach(k => {
      if (normalized.includes(k)) s -= 5
    })
    return s
  }

  const sorted = [...candidates]
    .map(item => ({ item, s: score(item.fileName), t: new Date(item.uploadTime).getTime() || 0 }))
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s
      return b.t - a.t
    })
    .map(x => x.item)

  return sorted[0]
}

export default {
  listProposalDocuments,
  pickBestProposalDocument
}



