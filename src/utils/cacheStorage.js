class myCache {
  constructor(storageType = 'localStorage') {
    // 默认使用 localStorage，也可以传入 'sessionStorage'
    this.cache = storageType === 'sessionStorage' ? sessionStorage : localStorage
    this.onQuotaExceeded = null // 配额超出时的回调函数
  }

  set(key, value) {
    try {
      this.cache.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Cache set error for key "${key}":`, error)

      // 如果是配额超出错误，调用回调函数
      if (error.name === 'QuotaExceededError' && this.onQuotaExceeded) {
        console.warn('存储空间不足，尝试清理...')
        const handled = this.onQuotaExceeded(key, value, error)

        // 如果回调返回 true，表示已经处理成功，不再抛出错误
        if (handled) {
          return
        }
      }

      // 重新抛出错误，让外部知道保存失败
      throw error
    }
  }

  get(key, defaultValue = null) {
    try {
      const value = this.cache.getItem(key)
      if (value === null || value === undefined) return defaultValue
      return JSON.parse(value)
    } catch (error) {
      console.error(`Cache get error for key "${key}":`, error)
      return defaultValue
    }
  }

  remove(key) {
    try {
      this.cache.removeItem(key)
    } catch (error) {
      console.error(`Cache remove error for key "${key}":`, error)
    }
  }

  clear() {
    try {
      this.cache.clear()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

// 默认导出 localStorage 实例
const myLocalCache = new myCache('localStorage')
export default myLocalCache

// 导出 sessionStorage 实例
export const sessionCache = new myCache('sessionStorage')
