import { defineStore } from 'pinia'
import { store } from '../index'
// @ts-ignore
import { DictDataVO } from '@/api/system/dict/types'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache('sessionStorage')
import { getSimpleDictDataList } from '@/api/system/dict/dict.data'

export interface DictValueType {
  value: any
  label: string
  clorType?: string
  cssClass?: string
}
export interface DictTypeType {
  dictType: string
  dictValue: DictValueType[]
}
export interface DictState {
  dictMap: Map<string, any>
  isSetDict: boolean
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, any>(),
    isSetDict: false
  }),
  getters: {
    getDictMap(): Recordable {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
      }
      return this.dictMap
    },
    getIsSetDict(): boolean {
      return this.isSetDict
    }
  },
  actions: {
    async setDictMap() {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
        this.isSetDict = true
      } else {
        try {
          const res = await getSimpleDictDataList()
          // 检查返回数据是否有效
          if (!res || !Array.isArray(res)) {
            console.warn('字典数据API返回无效数据:', res)
            this.dictMap = new Map<string, any>()
            this.isSetDict = true
            return
          }
          // 设置数据
          const dictDataMap = new Map<string, any>()
          res.forEach((dictData: DictDataVO) => {
            // 获得 dictType 层级
            const enumValueObj = dictDataMap[dictData.dictType]
            if (!enumValueObj) {
              dictDataMap[dictData.dictType] = []
            }
            // 处理 dictValue 层级
            dictDataMap[dictData.dictType].push({
              value: dictData.value,
              label: dictData.label,
              colorType: dictData.colorType,
              cssClass: dictData.cssClass
            })
          })
          this.dictMap = dictDataMap
          this.isSetDict = true
          wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
        } catch (error) {
          console.error('获取字典数据失败:', error)
          this.dictMap = new Map<string, any>()
          this.isSetDict = true
        }
      }
    },
    getDictByType(type: string) {
      if (!this.isSetDict) {
        this.setDictMap()
      }
      return this.dictMap[type]
    },
    async resetDict() {
      wsCache.delete(CACHE_KEY.DICT_CACHE)
      try {
        const res = await getSimpleDictDataList()
        // 检查返回数据是否有效
        if (!res || !Array.isArray(res)) {
          console.warn('字典数据API返回无效数据:', res)
          this.dictMap = new Map<string, any>()
          this.isSetDict = true
          return
        }
        // 设置数据
        const dictDataMap = new Map<string, any>()
        res.forEach((dictData: DictDataVO) => {
          // 获得 dictType 层级
          const enumValueObj = dictDataMap[dictData.dictType]
          if (!enumValueObj) {
            dictDataMap[dictData.dictType] = []
          }
          // 处理 dictValue 层级
          dictDataMap[dictData.dictType].push({
            value: dictData.value,
            label: dictData.label,
            colorType: dictData.colorType,
            cssClass: dictData.cssClass
          })
        })
        this.dictMap = dictDataMap
        this.isSetDict = true
        wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
      } catch (error) {
        console.error('重置字典数据失败:', error)
        this.dictMap = new Map<string, any>()
        this.isSetDict = true
      }
    }
  }
})

export const useDictStoreWithOut = () => {
  return useDictStore(store)
}
