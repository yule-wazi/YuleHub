/**
 * 分段 TTS 处理工具
 * 将长文本分段请求 TTS，实现快速响应和顺序播放
 */

import { textToSpeech } from '@/service/module/agents'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import indexedDBStorage from './indexedDBStorage'

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
  const sentences = text.split(/([。！？；.!?;])/g) // 按标点符号分割，保留分隔符
  let currentChunk = ''

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]

    // 如果当前块加上新句子不超过限制，就添加
    if ((currentChunk + sentence).length <= maxChunkLength) {
      currentChunk += sentence
    } else {
      // 如果当前块不为空，先保存
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
      // 如果单个句子超过限制，强制分割
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

  // 添加最后一块
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
    // 使用 AudioContext 合并音频
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const audioBuffers = []

    // 解码所有音频
    for (const blob of audioBlobs) {
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      audioBuffers.push(audioBuffer)
    }

    // 计算总长度
    const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0)
    const numberOfChannels = audioBuffers[0].numberOfChannels
    const sampleRate = audioBuffers[0].sampleRate

    // 创建合并后的 AudioBuffer
    const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate)

    // 复制所有音频数据
    let offset = 0
    for (const buffer of audioBuffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset)
      }
      offset += buffer.length
    }

    // 将 AudioBuffer 转换为 Blob
    const mergedBlob = await audioBufferToBlob(mergedBuffer, audioContext)
    audioContext.close()

    return mergedBlob
  } catch (error) {
    console.error('音频合并失败，使用简单拼接:', error)
    // 如果合并失败，简单拼接（可能有间隙）
    return new Blob(audioBlobs, { type: 'audio/mp3' })
  }
}

/**
 * 将 AudioBuffer 转换为 Blob
 * @param {AudioBuffer} audioBuffer
 * @param {AudioContext} audioContext
 * @returns {Promise<Blob>}
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
        // 转换为 WAV 格式
        const wav = audioBufferToWav(renderedBuffer)
        const blob = new Blob([wav], { type: 'audio/wav' })
        resolve(blob)
      })
      .catch(reject)
  })
}

/**
 * 将 AudioBuffer 转换为 WAV 格式
 * @param {AudioBuffer} buffer
 * @returns {ArrayBuffer}
 */
function audioBufferToWav(buffer) {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels = []
  let offset = 0
  let pos = 0

  // 写入 WAV 头
  const setUint16 = (data) => {
    view.setUint16(pos, data, true)
    pos += 2
  }
  const setUint32 = (data) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  // RIFF identifier
  setUint32(0x46464952)
  // file length
  setUint32(length - 8)
  // RIFF type
  setUint32(0x45564157)
  // format chunk identifier
  setUint32(0x20746d66)
  // format chunk length
  setUint32(16)
  // sample format (raw)
  setUint16(1)
  // channel count
  setUint16(buffer.numberOfChannels)
  // sample rate
  setUint32(buffer.sampleRate)
  // byte rate (sample rate * block align)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
  // block align (channel count * bytes per sample)
  setUint16(buffer.numberOfChannels * 2)
  // bits per sample
  setUint16(16)
  // data chunk identifier
  setUint32(0x61746164)
  // data chunk length
  setUint32(length - pos - 4)

  // 写入音频数据
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
 * 分段 TTS 处理类
 */
export class ChunkedTTSProcessor {
  constructor(config) {
    this.config = config // { voice, model, token }
    this.chunks = []
    this.audioBlobs = []
    this.currentPlayingIndex = 0
    this.audioElements = []
    this.isPlaying = false
    this.onChunkReady = null // 回调：当某个分段准备好时
    this.onAllComplete = null // 回调：当所有分段完成时
    this.onError = null // 回调：错误处理
  }

  /**
   * 处理文本并开始 TTS
   * @param {string} text - 完整文本
   * @param {number} chunkSize - 每段大小
   */
  async process(text, chunkSize = 100) {
    this.chunks = splitTextIntoChunks(text, chunkSize)
    console.log(`📝 文本已分为 ${this.chunks.length} 段:`, this.chunks)

    // 并行请求所有分段（但限制并发数）
    const maxConcurrent = 3 // 最多同时请求 3 个
    const results = []

    for (let i = 0; i < this.chunks.length; i += maxConcurrent) {
      const batch = this.chunks.slice(i, i + maxConcurrent)
      const batchPromises = batch.map((chunk, batchIndex) => this.requestTTS(chunk, i + batchIndex))

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }

    // 检查是否有失败的请求
    const failedCount = results.filter((r) => r.status === 'rejected').length
    if (failedCount > 0) {
      console.warn(`⚠️ ${failedCount} 个分段请求失败`)
    }

    // 合并所有成功的音频
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

  /**
   * 请求单个分段的 TTS
   * @param {string} chunk - 文本分段
   * @param {number} index - 分段索引
   */
  async requestTTS(chunk, index) {
    try {
      console.log(`🎤 请求第 ${index + 1} 段 TTS: "${chunk.substring(0, 20)}..."`)

      const targetConfig = {
        input: chunk,
        gain: 0,
        model: this.config.model,
        speed: 1.15,
        response_format: 'mp3',
        voice: this.config.voice,
      }

      const response = await textToSpeech(targetConfig, this.config.token)
      const [audioElem, audioBlob] = await createAudioToBlob(response)

      this.audioBlobs[index] = audioBlob
      this.audioElements[index] = audioElem

      console.log(`✅ 第 ${index + 1} 段完成`)

      // 如果是第一段，立即通知可以播放
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

  /**
   * 顺序播放所有分段
   */
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

  /**
   * 播放单个音频
   */
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
          resolve() // 继续播放下一段
        },
        { once: true },
      )

      audioElem.play().catch((err) => {
        console.error(`❌ 播放失败:`, err)
        resolve()
      })
    })
  }

  /**
   * 停止播放
   */
  stop() {
    this.isPlaying = false
    this.audioElements.forEach((elem) => {
      if (elem) {
        elem.pause()
        elem.currentTime = 0
      }
    })
  }

  /**
   * 清理资源
   */
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
 * 便捷函数：分段 TTS 并保存到 IndexedDB
 * @param {string} text - 文本
 * @param {string} userName - 用户名
 * @param {object} ttsConfig - TTS 配置 { voice, model, token }
 * @param {number} chunkSize - 分段大小
 * @returns {Promise<object>} { audioElem, messageId, audioBlob }
 */
export async function chunkedTTSWithStorage(text, userName, ttsConfig, chunkSize = 100) {
  const processor = new ChunkedTTSProcessor(ttsConfig)

  // 处理并获取合并后的音频
  const result = await processor.process(text, chunkSize)

  // 创建音频元素
  const audioUrl = URL.createObjectURL(result.mergedBlob)
  const audioElem = document.createElement('audio')
  audioElem.src = audioUrl
  document.body.appendChild(audioElem)

  // 保存到 IndexedDB
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  try {
    await indexedDBStorage.saveAudioMessage(userName, messageId, result.mergedBlob, text)
    console.log('✅ 合并音频已保存到 IndexedDB:', messageId)
  } catch (error) {
    console.warn('⚠️ 保存音频到 IndexedDB 失败:', error)
  }

  // 清理资源
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
