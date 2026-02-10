/**
 * 音频缓存管理工具
 * 结合 IndexedDB 和内存缓存，优化音频加载性能
 */

import indexedDBStorage from './indexedDBStorage'

class AudioCache {
  constructor() {
    // 内存缓存（用于快速访问最近使用的音频）
    this.memoryCache = new Map()
    this.maxMemoryCacheSize = 20 // 最多缓存 20 个音频在内存中
  }

  /**
   * 从缓存或 IndexedDB 获取音频
   * @param {string} userName - 用户名
   * @param {string} messageId - 消息 ID
   */
  async getAudio(userName, messageId) {
    const cacheKey = `${userName}_${messageId}`

    // 1. 先检查内存缓存
    if (this.memoryCache.has(cacheKey)) {
      console.log('✅ 从内存缓存加载音频:', cacheKey)
      return this.memoryCache.get(cacheKey)
    }

    // 2. 从 IndexedDB 加载
    try {
      const data = await indexedDBStorage.getAudioMessage(userName, messageId)
      if (data && data.audioBlob) {
        // 确保 audioBlob 是一个有效的 Blob 对象
        if (!(data.audioBlob instanceof Blob)) {
          console.error('❌ audioBlob 不是有效的 Blob 对象:', typeof data.audioBlob)
          return null
        }

        // 创建 Blob URL
        const audioBlobUrl = URL.createObjectURL(data.audioBlob)

        // 添加到内存缓存
        this.addToMemoryCache(cacheKey, audioBlobUrl)

        return audioBlobUrl
      } else {
        console.warn('⚠️ IndexedDB 中没有找到音频数据')
      }
    } catch (error) {
      console.error('❌ 从 IndexedDB 加载音频失败:', error)
    }
    return null
  }

  /**
   * 添加到内存缓存（LRU 策略）
   */
  addToMemoryCache(key, value) {
    // 如果已存在，先删除（为了更新顺序）
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
    }

    // 如果缓存已满，删除最旧的项
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value
      const oldUrl = this.memoryCache.get(firstKey)

      // 释放 Blob URL
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl)
      }

      this.memoryCache.delete(firstKey)
    }

    // 添加新项
    this.memoryCache.set(key, value)
  }

  /**
   * 清空内存缓存
   */
  clearMemoryCache() {
    // 释放所有 Blob URL
    for (const url of this.memoryCache.values()) {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }
    this.memoryCache.clear()
  }

  /**
   * 预加载用户的音频消息
   * @param {string} userName - 用户名
   * @param {number} limit - 加载数量限制
   */
  async preloadUserAudios(userName, limit = 10) {
    try {
      const messages = await indexedDBStorage.getUserAudioMessages(userName)

      // 按时间戳排序，取最新的 N 条
      const recentMessages = messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)

      // 预加载到内存缓存
      for (const msg of recentMessages) {
        const cacheKey = `${userName}_${msg.messageId}`
        if (!this.memoryCache.has(cacheKey) && msg.audioBlob) {
          const audioBlobUrl = URL.createObjectURL(msg.audioBlob)
          this.addToMemoryCache(cacheKey, audioBlobUrl)
        }
      }

      console.log(`预加载了 ${recentMessages.length} 条音频消息`)
    } catch (error) {
      console.error('预加载音频失败:', error)
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo() {
    const estimate = await indexedDBStorage.getStorageEstimate()
    if (estimate) {
      const usedMB = (estimate.usage / 1024 / 1024).toFixed(2)
      const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2)
      const usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2)

      return {
        used: usedMB,
        quota: quotaMB,
        usagePercent,
        memoryCacheSize: this.memoryCache.size,
      }
    }
    return null
  }
}

// 创建单例
const audioCache = new AudioCache()

export default audioCache
