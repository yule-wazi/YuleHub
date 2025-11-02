import { sessionCache } from '@/utils/cacheStorage'
import myCache from '@/utils/cacheStorage'

/**
 * 查询缓存管理工具
 * 用于管理基于查询参数（tag/uid等）的 sessionStorage 缓存
 */

/**
 * 创建查询缓存管理器
 * @param {Object} options 配置选项
 * @param {string} options.prefix 缓存 key 前缀（如 'COMICS_CACHE:'）
 * @param {Function} options.getR18Flag 获取 R18 标志的函数，返回 true/false
 * @param {Function} options.formatKey 自定义 key 格式化函数 (tag, uid, r18Flag) => string
 * @returns {Object} 返回缓存操作方法
 */
export function createQueryCache(options) {
  const { prefix, getR18Flag, formatKey } = options

  /**
   * 生成存储 key
   * @param {string} tag 标签
   * @param {string|number} uid 用户ID
   * @returns {string} 存储 key
   */
  const getStorageKey = (tag, uid) => {
    if (formatKey) {
      const isR18 = getR18Flag ? getR18Flag() : false
      return formatKey(tag, uid, isR18)
    }

    const isR18 = getR18Flag ? getR18Flag() : false
    const r18Flag = isR18 ? 'R18' : 'SFW'

    if (uid) {
      return `${prefix}AUTHOR_${uid}_${r18Flag}`
    }
    if (tag) {
      return `${prefix}SEARCH_${tag}_${r18Flag}`
    }
    return ''
  }

  /**
   * 保存数据到 sessionStorage
   * @param {string} tag 标签
   * @param {string|number} uid 用户ID
   * @param {Object} data 要保存的数据
   * @param {Array} data.list 列表数据
   * @param {number} data.page 当前页码
   * @param {string|null} data.date 日期
   * @param {number} data.scrollTop 滚动位置
   */
  const saveToCache = (tag, uid, data) => {
    const storageKey = getStorageKey(tag, uid)
    if (storageKey && data.list && data.list.length > 0) {
      const cacheData = {
        list: [...data.list],
        page: data.page || 1,
        date: data.date || null,
        scrollTop: data.scrollTop || 0,
        timestamp: Date.now(),
      }
      sessionCache.set(storageKey, cacheData)
    }
  }

  /**
   * 从 sessionStorage 恢复数据
   * @param {string} tag 标签
   * @param {string|number} uid 用户ID
   * @returns {Object|null} 缓存的数据，不存在返回 null
   */
  const restoreFromCache = (tag, uid) => {
    const storageKey = getStorageKey(tag, uid)
    if (!storageKey) return null

    const cached = sessionCache.get(storageKey)
    if (cached && cached.list && cached.list.length > 0) {
      return cached
    }
    return null
  }

  /**
   * 移除缓存
   * @param {string} tag 标签
   * @param {string|number} uid 用户ID
   */
  const removeCache = (tag, uid) => {
    const storageKey = getStorageKey(tag, uid)
    if (storageKey) {
      sessionCache.remove(storageKey)
    }
  }

  /**
   * 清空所有相关缓存（通过前缀匹配）
   */
  const clearAllCache = () => {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(prefix)) {
          sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  }

  return {
    getStorageKey,
    saveToCache,
    restoreFromCache,
    removeCache,
    clearAllCache,
  }
}
