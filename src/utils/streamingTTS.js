/**
 * 流式 TTS 播放器 - 边请求边播放
 * 包含滑动窗口频率限制
 */

import { textToSpeech } from '@/service/module/agents'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import indexedDBStorage from './indexedDBStorage'
import { splitTextIntoChunks, mergeAudioBlobs } from './chunkedTTS'

// Debug 模式开关（设置为 true 启用调试日志）
const DEBUG_MODE = false

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
  }

  async add(requestFn) {
    await this.waitForRateLimit()

    if (this.currentCount < this.maxConcurrent) {
      return this.execute(requestFn)
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject })
      debugLog(`📋 请求加入队列，当前队列: ${this.queue.length}`)
    })
  }

  async waitForRateLimit() {
    while (true) {
      const now = Date.now()

      this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.windowMs,
      )

      if (this.requestTimestamps.length < this.rpmLimit) {
        this.requestTimestamps.push(now)
        return
      }

      const oldestTimestamp = this.requestTimestamps[0]
      const waitTime = this.windowMs - (now - oldestTimestamp) + 100

      debugLog(
        `⏱️ RPM 限制：等待 ${(waitTime / 1000).toFixed(1)}秒 (窗口内已有 ${this.requestTimestamps.length}/${this.rpmLimit} 个请求)`,
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  async execute(requestFn) {
    this.currentCount++

    const now = Date.now()
    const validTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    )

    debugLog(
      `🚀 执行请求 [${this.currentCount}/${this.maxConcurrent}] 窗口内: ${validTimestamps.length}/${this.rpmLimit}`,
    )

    try {
      const result = await requestFn()
      this.onComplete()
      return result
    } catch (error) {
      this.onComplete()
      throw error
    }
  }

  onComplete() {
    this.currentCount--
    debugLog(`✅ 请求完成 [${this.currentCount}/${this.maxConcurrent}]`)

    if (this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift()
      debugLog(`📤 出队列，剩余: ${this.queue.length}`)
      this.execute(requestFn).then(resolve).catch(reject)
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

    const firstChunkPromise = this.waitForFirstChunk()
    const allChunksPromise = this.requestAllChunks()

    await firstChunkPromise
    this.playNext()

    await allChunksPromise
    await this.mergeAndSave()
  }

  async requestAllChunks() {
    const promises = this.chunks.map((chunk, index) =>
      globalQueue.add(() => this.requestChunk(chunk, index)),
    )
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
    try {
      const config = {
        input: chunk,
        gain: 0,
        model: this.config.model,
        speed: 1,
        response_format: 'mp3',
        voice: this.config.voice,
      }

      const response = await textToSpeech(config, this.config.token)
      const [audioElem, audioBlob] = await createAudioToBlob(response)

      this.audioBlobs[index] = audioBlob
      this.audioElements[index] = audioElem
      this.completedCount++

      debugLog(`✅ 第 ${index + 1}/${this.chunks.length} 段完成`)

      if (index === 0 && this.onFirstReady) {
        this.onFirstReady()
      }

      return audioBlob
    } catch (error) {
      console.error(`❌ TTS 第 ${index + 1} 段失败:`, error)

      // 标记为失败，但不阻塞后续播放
      this.audioBlobs[index] = null
      this.audioElements[index] = null

      if (this.onError) this.onError(error, index)

      // 如果第一段失败，尝试触发下一段作为起始
      if (index === 0) {
        this.tryTriggerFirstReady()
      }

      // 返回 null 而不是抛出错误，让其他分段继续
      return null
    }
  }

  // 尝试触发第一段准备好的回调（找到第一个成功的分段）
  tryTriggerFirstReady() {
    // 延迟检查，给其他分段一些时间完成
    setTimeout(() => {
      for (let i = 0; i < this.audioElements.length; i++) {
        if (this.audioElements[i]) {
          debugLog(`🎉 第 ${i + 1} 段作为起始段`)
          if (this.onFirstReady) {
            this.onFirstReady()
          }
          break
        }
      }
    }, 1000)
  }

  async waitForFirstChunk() {
    // 等待第一个成功的分段（不一定是索引 0）
    const maxWaitTime = 30000 // 最多等待 30 秒
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      // 检查是否有任何分段准备好
      for (let i = 0; i < this.chunks.length; i++) {
        if (this.audioElements[i]) {
          debugLog(`🎵 找到第一个可用分段: 第 ${i + 1} 段`)
          return
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    throw new Error('等待首个音频分段超时')
  }

  async playNext() {
    if (!this.isPlaying) return

    this.currentIndex++

    // 跳过失败的分段，找到下一个可用的
    while (this.currentIndex < this.chunks.length && !this.audioElements[this.currentIndex]) {
      debugLog(`⏭️ 跳过失败的第 ${this.currentIndex + 1} 段`)
      this.currentIndex++
    }

    if (this.currentIndex >= this.chunks.length) {
      debugLog('▶️ 所有分段播放完成')
      this.cleanup()
      return
    }

    // 等待当前段准备好（可能还在请求中）
    while (!this.audioElements[this.currentIndex] && this.currentIndex < this.chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 如果等待过程中发现这段失败了，跳到下一段
      if (this.audioElements[this.currentIndex] === null) {
        debugLog(`⏭️ 第 ${this.currentIndex + 1} 段失败，跳过`)
        this.currentIndex++

        // 继续寻找下一个可用分段
        while (this.currentIndex < this.chunks.length && !this.audioElements[this.currentIndex]) {
          if (this.audioElements[this.currentIndex] === null) {
            debugLog(`⏭️ 跳过失败的第 ${this.currentIndex + 1} 段`)
            this.currentIndex++
          } else {
            break
          }
        }

        if (this.currentIndex >= this.chunks.length) {
          debugLog('▶️ 所有分段播放完成')
          this.cleanup()
          return
        }
      }
    }

    const audio = this.audioElements[this.currentIndex]
    if (audio) {
      debugLog(`▶️ 播放第 ${this.currentIndex + 1} 段`)
      audio.addEventListener('ended', () => this.playNext(), { once: true })
      audio.play()
    } else {
      // 如果还是没有可用音频，继续下一段
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
      player.play()
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
      reject(error)
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
