/**
 * 流式 TTS 播放器 - 边请求边播放
 * 包含滑动窗口频率限制
 */

import { textToSpeech } from '@/service/module/agents'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import indexedDBStorage from './indexedDBStorage'
import { splitTextIntoChunks, mergeAudioBlobs } from './chunkedTTS'

// Debug 模式开关（设置为 true 启用调试日志）
const DEBUG_MODE = true

// 调试日志函数
const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

/**
 * 请求队列管理器（滑动窗口频率限制）
 */
class RequestQueue {
  constructor(maxConcurrent = 2, rpmLimit = 10, windowMs = 60000) {
    this.maxConcurrent = maxConcurrent
    this.rpmLimit = rpmLimit
    this.windowMs = windowMs
    this.currentCount = 0
    this.queue = []
    this.requestTimestamps = []
    this.processing = false
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject })
      debugLog(`📋 请求加入队列，当前队列长度: ${this.queue.length}`)
      this.processQueue()
    })
  }

  async processQueue() {
    // 防止重复处理
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 && this.currentCount < this.maxConcurrent) {
      // 检查频率限制
      await this.waitForRateLimit()

      if (this.queue.length === 0) break

      const { requestFn, resolve, reject } = this.queue.shift()
      debugLog(`📤 出队列，剩余: ${this.queue.length}`)

      this.execute(requestFn, resolve, reject)
    }

    this.processing = false
  }

  async waitForRateLimit() {
    const now = Date.now()

    // 清理过期的时间戳
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    )

    // 如果窗口内请求数未达到限制，直接返回
    if (this.requestTimestamps.length < this.rpmLimit) {
      this.requestTimestamps.push(now)
      debugLog(`✅ 通过频率检查，窗口内: ${this.requestTimestamps.length}/${this.rpmLimit}`)
      return
    }

    // 需要等待
    const oldestTimestamp = this.requestTimestamps[0]
    const waitTime = this.windowMs - (now - oldestTimestamp) + 100

    debugLog(
      `⏱️ RPM 限制：等待 ${(waitTime / 1000).toFixed(1)}秒 (窗口内: ${this.requestTimestamps.length}/${this.rpmLimit})`,
    )

    await new Promise((resolve) => setTimeout(resolve, waitTime))

    // 递归检查（等待后可能还需要继续等待）
    return this.waitForRateLimit()
  }

  async execute(requestFn, resolve, reject) {
    this.currentCount++

    debugLog(`🚀 执行请求 [${this.currentCount}/${this.maxConcurrent}]`)

    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.currentCount--
      debugLog(`✅ 请求完成 [${this.currentCount}/${this.maxConcurrent}]`)
      // 继续处理队列
      this.processQueue()
    }
  }

  getStatus() {
    const now = Date.now()
    const recentRequests = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    )

    return {
      current: this.currentCount,
      queued: this.queue.length,
      max: this.maxConcurrent,
      windowRequests: recentRequests.length,
      rpmLimit: this.rpmLimit,
    }
  }
}

const globalQueue = new RequestQueue(2, 10, 60000)

/**
 * 流式 TTS 播放器
 */
export class StreamingTTSPlayer {
  constructor(config) {
    this.config = config
    this.chunks = []
    this.audioBlobs = []
    this.audioElements = []
    this.currentIndex = -1
    this.isPlaying = false
    this.completedCount = 0
    this.onFirstReady = null
    this.onComplete = null
    this.onError = null
  }

  async start(text, chunkSize = 100) {
    this.chunks = splitTextIntoChunks(text, chunkSize)
    debugLog(`📝 文本分为 ${this.chunks.length} 段`)

    // 立即开始所有请求
    const allChunksPromise = this.requestAllChunks()

    // 等待第一个可用分段
    await this.waitForFirstChunk()

    // 开始播放
    this.isPlaying = true
    if (this.onFirstReady) {
      this.onFirstReady()
    }
    this.playNext()

    // 等待所有请求完成后合并
    await allChunksPromise
    await this.mergeAndSave()
  }

  async requestAllChunks() {
    // 按顺序添加所有请求到队列
    const promises = []
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      debugLog(`📋 添加第 ${i + 1}/${this.chunks.length} 段到队列`)

      const promise = globalQueue
        .add(() => this.requestChunk(chunk, i))
        .catch((error) => {
          console.error(`❌ 第 ${i + 1} 段请求失败:`, error)
          // 标记为失败
          this.audioBlobs[i] = null
          this.audioElements[i] = null
        })
      promises.push(promise)
    }

    // 等待所有请求完成
    await Promise.allSettled(promises)
    debugLog('✅ 所有分段请求完成')
  }

  async mergeAndSave() {
    debugLog('🎵 开始合并音频...')
    const mergedBlob = await mergeAudioBlobs(this.audioBlobs.filter((b) => b))
    debugLog('✅ 音频合并完成')

    if (this.onComplete) {
      this.onComplete(mergedBlob)
    }
  }

  async requestChunk(chunk, index) {
    debugLog(`🔵 开始请求第 ${index + 1}/${this.chunks.length} 段`)
    try {
      const config = {
        input: chunk,
        gain: 0,
        model: this.config.model,
        speed: 1.25,
        response_format: 'mp3',
        voice: this.config.voice,
      }

      const response = await textToSpeech(config, this.config.token)
      const [audioElem, audioBlob] = await createAudioToBlob(response)

      this.audioBlobs[index] = audioBlob
      this.audioElements[index] = audioElem
      this.completedCount++

      debugLog(`✅ 第 ${index + 1}/${this.chunks.length} 段完成 (已完成: ${this.completedCount})`)

      return audioBlob
    } catch (error) {
      console.error(`❌ TTS 第 ${index + 1} 段失败:`, error)

      // 标记为失败，但不阻塞后续播放
      this.audioBlobs[index] = null
      this.audioElements[index] = null

      if (this.onError) this.onError(error, index)

      // 抛出错误让 requestAllChunks 捕获
      throw error
    }
  }

  async waitForFirstChunk() {
    // 等待第一段（索引 0）准备好或失败
    const maxWaitTime = 30000 // 最多等待 30 秒
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      // 检查第一段是否准备好
      if (this.audioElements[0]) {
        debugLog(`🎵 第一段准备好`)
        return
      }
      // 检查第一段是否失败（标记为 null）
      if (this.audioElements[0] === null) {
        debugLog(`❌ 第一段失败，将从下一段开始`)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    throw new Error('等待首个音频分段超时')
  }

  async playNext() {
    if (!this.isPlaying) return

    this.currentIndex++

    if (this.currentIndex >= this.chunks.length) {
      debugLog('▶️ 所有分段播放完成')
      this.cleanup()
      return
    }

    // 等待当前段准备好或失败
    while (
      this.audioElements[this.currentIndex] === undefined &&
      this.currentIndex < this.chunks.length
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // 如果当前段失败（null），跳过并继续下一段
    if (this.audioElements[this.currentIndex] === null) {
      debugLog(`⏭️ 第 ${this.currentIndex + 1} 段失败，跳过`)
      this.playNext()
      return
    }

    // 如果当前段准备好，播放
    const audio = this.audioElements[this.currentIndex]
    if (audio) {
      debugLog(`▶️ 播放第 ${this.currentIndex + 1} 段`)
      audio.addEventListener('ended', () => this.playNext(), { once: true })
      audio.play()
    } else {
      // 理论上不应该到这里，但以防万一
      this.playNext()
    }
  }

  play() {
    this.isPlaying = true
  }

  stop() {
    this.isPlaying = false
    this.audioElements.forEach((elem) => {
      if (elem) elem.pause()
    })
  }

  cleanup() {
    this.audioElements.forEach((elem) => {
      if (elem?.parentNode) elem.parentNode.removeChild(elem)
    })
  }
}

/**
 * 便捷函数：流式 TTS
 */
export async function streamingTTS(text, userName, ttsConfig, chunkSize = 100) {
  return new Promise((resolve, reject) => {
    const player = new StreamingTTSPlayer(ttsConfig)

    player.onFirstReady = () => {
      debugLog('🎉 第一段准备好，开始播放')
    }

    player.onComplete = async (blob) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      try {
        await indexedDBStorage.saveAudioMessage(userName, messageId, blob, text)
        debugLog('✅ 合并音频已保存到 IndexedDB:', messageId)
      } catch (error) {
        console.warn('⚠️ TTS 音频保存失败:', error)
      }

      const audioUrl = URL.createObjectURL(blob)
      const audioElem = document.createElement('audio')
      audioElem.src = audioUrl
      document.body.appendChild(audioElem)

      resolve({
        audioElem,
        messageId,
        audioBlob: blob,
      })
    }

    player.onError = (error) => {
      // 不要因为单个分段失败就 reject 整个流程
      console.warn('⚠️ TTS 分段失败，继续处理其他分段:', error)
    }

    player.start(text, chunkSize).catch(reject)
  })
}

/**
 * 获取队列状态
 */
export function getQueueStatus() {
  return globalQueue.getStatus()
}
