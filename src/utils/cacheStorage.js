class myCache {
  constructor() {
    this.cache = localStorage
  }
  set(key, value) {
    this.cache.setItem(key, JSON.stringify(value))
  }
  get(key) {
    const value = this.cache.getItem(key)
    return JSON.parse(value)
  }
  remove(key) {
    this.cache.removeItem(key)
  }
}
export default new myCache()
