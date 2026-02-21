/**
 * 小说 TTS 处理器 - 专门用于小说听书功能
 * 不保存音频，支持停止后续请求
 */

import { textToSpeech } from '@/service/module/agents'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import { splitTextIntoChunks } from './ttsProcessor'

// Debug 模式
const DEBUG_MODE = false

const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

/**
 * 请求队列管理器（小说专用）
 */
class NovelRequestQueue {
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
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 && this.currentCount < this.maxConcurrent) {
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

    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    )

    if (this.requestTimestamps.length < this.rpmLimit) {
      this.requestTimestamps.push(now)
      debugLog(`✅ 通过频率检查，窗口内: ${this.requestTimestamps.length}/${this.rpmLimit}`)
      return
    }

    const oldestTimestamp = this.requestTimestamps[0]
    const waitTime = this.windowMs - (now - oldestTimestamp) + 100

    debugLog(
      `⏱️ RPM 限制：等待 ${(waitTime / 1000).toFixed(1)}秒 (窗口内: ${this.requestTimestamps.length}/${this.rpmLimit})`,
    )

    await new Promise((resolve) => setTimeout(resolve, waitTime))
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
      this.processQueue()
    }
  }

  // 清空队列
  clear() {
    this.queue = []
    debugLog('🧹 清空请求队列')
  }
}

// 小说专用的全局队列
const novelQueue = new NovelRequestQueue(2, 10, 60000)

/**
 * 小说 TTS 处理器
 */
export class NovelTTSProcessor {
  constructor(config) {
    this.config = config
    this.chunks = []
    this.audioBlobs = []
    this.audioElements = []
    this.currentIndex = -1
    this.completedCount = 0
    this.isPlaying = false
    this.isStopped = false
    this.onFirstReady = null
    this.onError = null
    this.onComplete = null // 添加完成回调
  }

  async start(text, chunkSize = 150) {
    this.chunks = splitTextIntoChunks(text, chunkSize)
    this.isStopped = false
    debugLog(`📝 文本分为 ${this.chunks.length} 段`)

    // 开始所有请求
    const allChunksPromise = this.requestAllChunks()

    // 等待第一个分段
    await this.waitForFirstChunk()

    if (this.isStopped) {
      debugLog('⏹️ 已停止，不开始播放')
      return
    }

    // 开始播放
    this.isPlaying = true
    if (this.onFirstReady) {
      this.onFirstReady()
    }
    this.playNext()

    // 等待所有请求完成
    await allChunksPromise
  }

  async requestAllChunks() {
    const promises = []
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.isStopped) {
        debugLog('⏹️ 停止添加新请求')
        break
      }

      const chunk = this.chunks[i]
      debugLog(`📋 添加第 ${i + 1}/${this.chunks.length} 段到队列`)

      const promise = novelQueue
        .add(() => {
          if (this.isStopped) {
            debugLog(`⏹️ 第 ${i + 1} 段请求被取消`)
            return Promise.reject(new Error('已停止'))
          }
          return this.requestChunk(chunk, i)
        })
        .catch((error) => {
          if (error.message !== '已停止') {
            console.error(`❌ 第 ${i + 1} 段请求失败:`, error)
          }
          this.audioBlobs[i] = null
          this.audioElements[i] = null
        })
      promises.push(promise)
    }

    await Promise.allSettled(promises)
    debugLog('✅ 所有分段请求完成')
  }

  async requestChunk(chunk, index) {
    debugLog(`🔵 开始请求第 ${index + 1}/${this.chunks.length} 段`)
    try {
      const config = {
        input: chunk,
        gain: 0,
        model: this.config.model,
        speed: this.config.speed || 1.0,
        response_format: 'mp3',
        voice: this.config.voice,
      }

      const response = await textToSpeech(config, this.config.token)

      if (this.isStopped) {
        debugLog(`⏹️ 第 ${index + 1} 段请求完成但已停止，丢弃结果`)
        return null
      }

      const [audioElem, audioBlob] = await createAudioToBlob(response)

      this.audioBlobs[index] = audioBlob
      this.audioElements[index] = audioElem
      this.completedCount++

      debugLog(`✅ 第 ${index + 1}/${this.chunks.length} 段完成 (已完成: ${this.completedCount})`)

      return audioBlob
    } catch (error) {
      console.error(`❌ TTS 第 ${index + 1} 段失败:`, error)
      this.audioBlobs[index] = null
      this.audioElements[index] = null
      if (this.onError) this.onError(error, index)
      throw error
    }
  }

  async waitForFirstChunk() {
    const maxWaitTime = 30000
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      if (this.isStopped) {
        debugLog('⏹️ 等待首段时检测到停止')
        return
      }

      if (this.audioElements[0]) {
        debugLog(`🎵 第一段准备好`)
        return
      }
      if (this.audioElements[0] === null) {
        debugLog(`❌ 第一段失败，将从下一段开始`)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    throw new Error('等待首个音频分段超时')
  }

  async playNext() {
    if (!this.isPlaying || this.isStopped) return

    this.currentIndex++

    if (this.currentIndex >= this.chunks.length) {
      debugLog('▶️ 所有分段播放完成')
      this.isPlaying = false
      if (this.onComplete) {
        this.onComplete()
      }
      this.cleanup()
      return
    }

    // 等待当前段准备好
    while (
      this.audioElements[this.currentIndex] === undefined &&
      this.currentIndex < this.chunks.length &&
      !this.isStopped
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (this.isStopped) {
      debugLog('⏹️ 播放过程中检测到停止')
      return
    }

    // 如果当前段失败，跳过
    if (this.audioElements[this.currentIndex] === null) {
      debugLog(`⏭️ 第 ${this.currentIndex + 1} 段失败，跳过`)
      this.playNext()
      return
    }

    // 播放当前段
    const audio = this.audioElements[this.currentIndex]
    if (audio) {
      debugLog(`▶️ 播放第 ${this.currentIndex + 1} 段`)
      audio.addEventListener('ended', () => this.playNext(), { once: true })
      audio.play().catch((err) => {
        console.error(`❌ 播放失败:`, err)
        this.playNext()
      })
    } else {
      this.playNext()
    }
  }

  stop() {
    this.isPlaying = false
    this.isStopped = true
    debugLog('⏹️ 停止播放和所有请求')

    // 清空队列中的待处理请求
    novelQueue.clear()

    // 停止所有正在播放的音频
    this.audioElements.forEach((elem) => {
      if (elem) {
        elem.pause()
        elem.currentTime = 0
      }
    })
  }

  cleanup() {
    this.stop()
    debugLog('🧹 清理所有音频资源')

    // 清理所有音频元素
    this.audioElements.forEach((elem) => {
      if (elem?.parentNode) {
        elem.parentNode.removeChild(elem)
      }
    })

    // 清空数组
    this.audioElements = []
    this.audioBlobs = []
    this.currentIndex = -1
    this.completedCount = 0
  }
}
