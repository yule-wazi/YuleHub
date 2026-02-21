/**
 * TTS 处理工具 - 统一的文本转语音处理
 * 支持两种模式：
 * 1. chunked: 并行请求所有分段，全部完成后合并播放
 * 2. streaming: 边请求边播放，带队列管理和频率限制
 */

import { textToSpeech } from '@/service/module/agents'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import indexedDBStorage from './indexedDBStorage'

// Debug 模式开关
const DEBUG_MODE = true

const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

/**
 * 智能文本分段
 * @param {string} text - 要分段的文本
 * @param {number} maxChunkLength - 每段最大长度（字符数）
 * @returns {string[]} 分段后的文本数组
 */
export function splitTextIntoChunks(text, maxChunkLength = 100) {
  if (!text || text.length <= maxChunkLength) {
    return [text]
  }

  const chunks = []
  const sentences = text.split(/([。！？；.!?;])/g)
  let currentChunk = ''

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]

    if ((currentChunk + sentence).length <= maxChunkLength) {
      currentChunk += sentence
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
      if (sentence.length > maxChunkLength) {
        for (let j = 0; j < sentence.length; j += maxChunkLength) {
          chunks.push(sentence.slice(j, j + maxChunkLength))
        }
        currentChunk = ''
      } else {
        currentChunk = sentence
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter((chunk) => chunk.length > 0)
}

/**
 * 合并多个音频 Blob
 * @param {Blob[]} audioBlobs - 音频 Blob 数组
 * @returns {Promise<Blob>} 合并后的音频 Blob
 */
export async function mergeAudioBlobs(audioBlobs) {
  if (audioBlobs.length === 0) {
    throw new Error('没有音频可合并')
  }

  if (audioBlobs.length === 1) {
    return audioBlobs[0]
  }

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const audioBuffers = []

    for (const blob of audioBlobs) {
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      audioBuffers.push(audioBuffer)
    }

    const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0)
    const numberOfChannels = audioBuffers[0].numberOfChannels
    const sampleRate = audioBuffers[0].sampleRate

    const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate)

    let offset = 0
    for (const buffer of audioBuffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset)
      }
      offset += buffer.length
    }

    const mergedBlob = await audioBufferToBlob(mergedBuffer, audioContext)
    audioContext.close()

    return mergedBlob
  } catch (error) {
    console.error('音频合并失败，使用简单拼接:', error)
    return new Blob(audioBlobs, { type: 'audio/mp3' })
  }
}

/**
 * 将 AudioBuffer 转换为 Blob
 */
async function audioBufferToBlob(audioBuffer, audioContext) {
  return new Promise((resolve, reject) => {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate,
    )

    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineContext.destination)
    source.start()

    offlineContext
      .startRendering()
      .then((renderedBuffer) => {
        const wav = audioBufferToWav(renderedBuffer)
        const blob = new Blob([wav], { type: 'audio/wav' })
        resolve(blob)
      })
      .catch(reject)
  })
}

/**
 * 将 AudioBuffer 转换为 WAV 格式
 */
function audioBufferToWav(buffer) {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels = []
  let offset = 0
  let pos = 0

  const setUint16 = (data) => {
    view.setUint16(pos, data, true)
    pos += 2
  }
  const setUint32 = (data) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  setUint32(0x46464952) // RIFF
  setUint32(length - 8)
  setUint32(0x45564157) // WAVE
  setUint32(0x20746d66) // fmt
  setUint32(16)
  setUint16(1)
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
  setUint16(buffer.numberOfChannels * 2)
  setUint16(16)
  setUint32(0x61746164) // data
  setUint32(length - pos - 4)

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(pos, sample, true)
      pos += 2
    }
    offset++
  }

  return arrayBuffer
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
 * TTS 处理器基类
 */
class TTSProcessor {
  constructor(config) {
    this.config = config // { voice, model, token, speed }
    this.chunks = []
    this.audioBlobs = []
    this.audioElements = []
    this.isPlaying = false
    this.onChunkReady = null
    this.onAllComplete = null
    this.onError = null
  }

  /**
   * 请求单个分段的 TTS
   */
  async requestTTS(chunk, index) {
    try {
      debugLog(`🎤 请求第 ${index + 1} 段 TTS: "${chunk.substring(0, 20)}..."`)

      const targetConfig = {
        input: chunk,
        gain: 0,
        model: this.config.model,
        speed: this.config.speed || 1.0,
        response_format: 'mp3',
        voice: this.config.voice,
      }

      const response = await textToSpeech(targetConfig, this.config.token)
      const [audioElem, audioBlob] = await createAudioToBlob(response)

      this.audioBlobs[index] = audioBlob
      this.audioElements[index] = audioElem

      debugLog(`✅ 第 ${index + 1} 段完成`)

      if (index === 0 && this.onChunkReady) {
        this.onChunkReady(audioElem, audioBlob, index)
      }

      return audioBlob
    } catch (error) {
      console.error(`❌ 第 ${index + 1} 段失败:`, error)
      if (this.onError) {
        this.onError(error, index)
      }
      throw error
    }
  }

  stop() {
    this.isPlaying = false
    this.audioElements.forEach((elem) => {
      if (elem) {
        elem.pause()
        elem.currentTime = 0
      }
    })
  }

  cleanup() {
    this.stop()
    this.audioElements.forEach((elem) => {
      if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem)
      }
    })
    this.audioElements = []
    this.audioBlobs = []
  }
}

/**
 * 分段 TTS 处理器 - 并行请求，全部完成后合并
 */
export class ChunkedTTSProcessor extends TTSProcessor {
  async process(text, chunkSize = 100) {
    this.chunks = splitTextIntoChunks(text, chunkSize)
    console.log(`📝 文本已分为 ${this.chunks.length} 段:`, this.chunks)

    const maxConcurrent = 3
    const results = []

    for (let i = 0; i < this.chunks.length; i += maxConcurrent) {
      const batch = this.chunks.slice(i, i + maxConcurrent)
      const batchPromises = batch.map((chunk, batchIndex) => this.requestTTS(chunk, i + batchIndex))

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }

    const failedCount = results.filter((r) => r.status === 'rejected').length
    if (failedCount > 0) {
      console.warn(`⚠️ ${failedCount} 个分段请求失败`)
    }

    const successfulBlobs = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)

    if (successfulBlobs.length === 0) {
      throw new Error('所有 TTS 请求都失败了')
    }

    console.log('🎵 开始合并音频...')
    const mergedBlob = await mergeAudioBlobs(successfulBlobs)
    console.log('✅ 音频合并完成')

    if (this.onAllComplete) {
      this.onAllComplete(mergedBlob, successfulBlobs)
    }

    return {
      mergedBlob,
      chunks: successfulBlobs,
      totalChunks: this.chunks.length,
      successCount: successfulBlobs.length,
    }
  }

  async playSequentially() {
    if (this.isPlaying) return
    this.isPlaying = true

    for (let i = 0; i < this.audioElements.length; i++) {
      if (this.audioElements[i]) {
        await this.playAudio(this.audioElements[i], i)
      }
    }

    this.isPlaying = false
  }

  playAudio(audioElem, index) {
    return new Promise((resolve) => {
      console.log(`▶️ 播放第 ${index + 1} 段`)

      audioElem.addEventListener(
        'ended',
        () => {
          console.log(`⏹️ 第 ${index + 1} 段播放完成`)
          resolve()
        },
        { once: true },
      )

      audioElem.addEventListener(
        'error',
        (e) => {
          console.error(`❌ 第 ${index + 1} 段播放错误:`, e)
          resolve()
        },
        { once: true },
      )

      audioElem.play().catch((err) => {
        console.error(`❌ 播放失败:`, err)
        resolve()
      })
    })
  }
}

/**
 * 流式 TTS 处理器 - 边请求边播放，带队列管理
 */
export class StreamingTTSProcessor extends TTSProcessor {
  constructor(config) {
    super(config)
    this.currentIndex = -1
    this.completedCount = 0
    this.onFirstReady = null
  }

  async start(text, chunkSize = 100) {
    this.chunks = splitTextIntoChunks(text, chunkSize)
    debugLog(`📝 文本分为 ${this.chunks.length} 段`)

    const allChunksPromise = this.requestAllChunks()

    await this.waitForFirstChunk()

    this.isPlaying = true
    if (this.onFirstReady) {
      this.onFirstReady()
    }
    this.playNext()

    await allChunksPromise
    await this.mergeAndSave()
  }

  async requestAllChunks() {
    const promises = []
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      debugLog(`📋 添加第 ${i + 1}/${this.chunks.length} 段到队列`)

      const promise = globalQueue
        .add(() => this.requestChunk(chunk, i))
        .catch((error) => {
          console.error(`❌ 第 ${i + 1} 段请求失败:`, error)
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
    if (!this.isPlaying) return

    this.currentIndex++

    if (this.currentIndex >= this.chunks.length) {
      debugLog('▶️ 所有分段播放完成')
      this.cleanup()
      return
    }

    while (
      this.audioElements[this.currentIndex] === undefined &&
      this.currentIndex < this.chunks.length
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (this.audioElements[this.currentIndex] === null) {
      debugLog(`⏭️ 第 ${this.currentIndex + 1} 段失败，跳过`)
      this.playNext()
      return
    }

    const audio = this.audioElements[this.currentIndex]
    if (audio) {
      debugLog(`▶️ 播放第 ${this.currentIndex + 1} 段`)
      audio.addEventListener('ended', () => this.playNext(), { once: true })
      audio.play()
    } else {
      this.playNext()
    }
  }

  async mergeAndSave() {
    debugLog('🎵 开始合并音频...')
    const mergedBlob = await mergeAudioBlobs(this.audioBlobs.filter((b) => b))
    debugLog('✅ 音频合并完成')

    if (this.onAllComplete) {
      this.onAllComplete(mergedBlob)
    }
  }
}

/**
 * 便捷函数：分段 TTS 并保存到 IndexedDB
 */
export async function chunkedTTSWithStorage(text, userName, ttsConfig, chunkSize = 100) {
  const processor = new ChunkedTTSProcessor(ttsConfig)

  const result = await processor.process(text, chunkSize)

  const audioUrl = URL.createObjectURL(result.mergedBlob)
  const audioElem = document.createElement('audio')
  audioElem.src = audioUrl
  document.body.appendChild(audioElem)

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  try {
    await indexedDBStorage.saveAudioMessage(userName, messageId, result.mergedBlob, text)
    console.log('✅ 合并音频已保存到 IndexedDB:', messageId)
  } catch (error) {
    console.warn('⚠️ 保存音频到 IndexedDB 失败:', error)
  }

  processor.cleanup()

  return {
    audioElem,
    messageId,
    audioBlob: result.mergedBlob,
    chunks: result.chunks,
    stats: {
      totalChunks: result.totalChunks,
      successCount: result.successCount,
    },
  }
}

/**
 * 便捷函数：流式 TTS
 */
export async function streamingTTS(text, userName, ttsConfig, chunkSize = 100) {
  return new Promise((resolve, reject) => {
    const processor = new StreamingTTSProcessor(ttsConfig)

    processor.onFirstReady = () => {
      debugLog('🎉 第一段准备好，开始播放')
    }

    processor.onAllComplete = async (blob) => {
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

    processor.onError = (error) => {
      console.warn('⚠️ TTS 分段失败，继续处理其他分段:', error)
    }

    processor.start(text, chunkSize).catch(reject)
  })
}

/**
 * 获取队列状态
 */
export function getQueueStatus() {
  return globalQueue.getStatus()
}
