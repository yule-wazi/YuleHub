class myCache {
  constructor(storageType = 'localStorage') {
    // 默认使用 localStorage，也可以传入 'sessionStorage'
    this.cache = storageType === 'sessionStorage' ? sessionStorage : localStorage
  }

  set(key, value) {
    try {
      this.cache.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Cache set error for key "${key}":`, error)
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
