/**
 * IndexedDB 存储工具类
 * 用于存储大容量数据（如音频 Blob）
 */

const DB_NAME = 'YuLeChat'
const DB_VERSION = 1
const STORE_NAME = 'audioMessages'

class IndexedDBStorage {
  constructor() {
    this.db = null
  }

  /**
   * 初始化数据库
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建音频消息存储空间
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          // 创建索引
          objectStore.createIndex('userName', 'userName', { unique: false })
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // 创建克隆音色存储空间
        if (!db.objectStoreNames.contains('clonedVoices')) {
          const voiceStore = db.createObjectStore('clonedVoices', { keyPath: 'reference_id' })
          voiceStore.createIndex('customName', 'customName', { unique: false })
          voiceStore.createIndex('timestamp', 'createdAt', { unique: false })
        }
      }
    })
  }

  /**
   * 确保数据库已初始化
   */
  async ensureDB() {
    if (!this.db) {
      await this.init()
    }
  }

  /**
   * 保存音频消息
   * @param {string} userName - 用户名
   * @param {string} messageId - 消息 ID
   * @param {Blob} audioBlob - 音频 Blob
   * @param {string} text - 消息文本
   */
  async saveAudioMessage(userName, messageId, audioBlob, text) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)

      // 确保 audioBlob 是 Blob 对象
      if (!(audioBlob instanceof Blob)) {
        reject(new Error('audioBlob 必须是 Blob 对象'))
        return
      }

      const data = {
        id: `${userName}_${messageId}`,
        userName,
        messageId,
        audioBlob, // IndexedDB 原生支持存储 Blob
        text,
        timestamp: Date.now(),
      }

      const request = objectStore.put(data)

      request.onsuccess = () => {
        console.log('✅ 音频已保存到 IndexedDB:', data.id, 'Blob size:', audioBlob.size)
        resolve(data.id)
      }
      request.onerror = () => {
        console.error('❌ 保存音频失败:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 获取音频消息
   * @param {string} userName - 用户名
   * @param {string} messageId - 消息 ID
   */
  async getAudioMessage(userName, messageId) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)

      const request = objectStore.get(`${userName}_${messageId}`)

      request.onsuccess = () => {
        const result = request.result
        resolve(result)
      }
      request.onerror = () => {
        console.error('❌ 读取音频失败:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 获取用户的所有音频消息
   * @param {string} userName - 用户名
   */
  async getUserAudioMessages(userName) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)
      const index = objectStore.index('userName')

      const request = index.getAll(userName)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除音频消息
   * @param {string} userName - 用户名
   * @param {string} messageId - 消息 ID
   */
  async deleteAudioMessage(userName, messageId) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)

      const request = objectStore.delete(`${userName}_${messageId}`)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除用户的所有音频消息
   * @param {string} userName - 用户名
   */
  async deleteUserAudioMessages(userName) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const index = objectStore.index('userName')

      const request = index.openCursor(IDBKeyRange.only(userName))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 清理旧数据（保留最近 N 天的数据）
   * @param {number} days - 保留天数
   */
  async cleanOldData(days = 7) {
    await this.ensureDB()

    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const index = objectStore.index('timestamp')

      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取数据库使用情况
   */
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return await navigator.storage.estimate()
    }
    return null
  }

  /**
   * 保存克隆音色
   * @param {Object} voiceData - 克隆音色数据
   */
  async saveClonedVoice(voiceData) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clonedVoices'], 'readwrite')
      const objectStore = transaction.objectStore('clonedVoices')

      // 确保 audioBlob 是 Blob 对象
      if (voiceData.audioBlob && !(voiceData.audioBlob instanceof Blob)) {
        reject(new Error('audioBlob 必须是 Blob 对象'))
        return
      }

      const request = objectStore.put(voiceData)

      request.onsuccess = () => {
        console.log('✅ 克隆音色已保存到 IndexedDB:', voiceData.reference_id)
        resolve(voiceData.reference_id)
      }
      request.onerror = () => {
        console.error('❌ 保存克隆音色失败:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 获取克隆音色
   * @param {string} reference_id - 音色 ID
   */
  async getClonedVoice(reference_id) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clonedVoices'], 'readonly')
      const objectStore = transaction.objectStore('clonedVoices')

      const request = objectStore.get(reference_id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取所有克隆音色
   */
  async getAllClonedVoices() {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clonedVoices'], 'readonly')
      const objectStore = transaction.objectStore('clonedVoices')

      const request = objectStore.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除克隆音色
   * @param {string} reference_id - 音色 ID
   */
  async deleteClonedVoice(reference_id) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clonedVoices'], 'readwrite')
      const objectStore = transaction.objectStore('clonedVoices')

      const request = objectStore.delete(reference_id)

      request.onsuccess = () => {
        console.log('✅ 克隆音色已删除:', reference_id)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }
}

// 创建单例
const indexedDBStorage = new IndexedDBStorage()

export default indexedDBStorage
