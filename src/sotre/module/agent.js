import { defineStore } from 'pinia'
import { postAgent, textToSpeech } from '@/service/module/agents'
import { formatInputMessage } from '@/view/chat/utils/formatOutput'
import { createAudioToBlob } from '@/view/chat/utils/createAudio'
import allUsers from '../agentUsersConfig'
import myCache from '@/utils/cacheStorage'
import indexedDBStorage from '@/utils/indexedDBStorage'
import { streamingTTS } from '@/utils/streamingTTS'
const useAgent = defineStore('agent', {
  state: () => {
    return {
      currentUser: allUsers[0].userName,
      backgroundImg: allUsers[0].image,
      isPlay: true,
      isMute: true,
      audioDuration: 0,
      activeIndex: 0,
      textLight: false,
      showTip: true,
      users: [],
    }
  },
  actions: {
    chatToAgent(message, userName) {
      if (!this.isPlay) return
      // 查找目标智能体
      const targetUser = this.users.find((item) => item.userName === userName)
      if (!targetUser) {
        return Promise.reject(new Error(`User with name ${userName} not found`))
      }
      const url = targetUser.url
      const data = {
        input: { prompt: formatInputMessage(message), session_id: targetUser.session_id },
      }
      const dataJson = JSON.stringify(data)
      return new Promise((resolve, reject) => {
        postAgent(dataJson, url)
          .then((res) => {
            const response = res.data.output.text
            targetUser.session_id = res.data.output.session_id
            resolve(response)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    // audioToAgent(message, userName) {
    //   if (!message) return
    //   // 查找目标智能体配置
    //   const voiceId = this.users.find((item) => item.userName === userName).voiceId
    //   let targetConfig = {
    //     model: 'speech-02-hd',
    //     text: `${message}`,
    //     timber_weights: [
    //       {
    //         voice_id: `${voiceId}`,
    //         weight: 1,
    //       },
    //     ],
    //     voice_setting: {
    //       voice_id: '',
    //       speed: 1.25,
    //       pitch: 0,
    //       vol: 1.25,
    //       emotion: 'disgusted',
    //       latex_read: false,
    //     },
    //     audio_setting: {
    //       sample_rate: 32000,
    //       bitrate: 128000,
    //       format: 'mp3',
    //     },
    //     language_boost: 'auto',
    //   }
    //   const audioData = myCache.get('audioData')
    //   return new Promise((resolve, reject) => {
    //     textToAudio(targetConfig, audioData.groupId, audioData.token)
    //       .then((res) => {
    // const audioElem = createAudio(res.data.data.audio)
    //         resolve([audioElem, res.data.data.audio])
    //       })
    //       .catch((err) => {
    //         reject(err)
    //       })
    //   })
    // },
    audioToAgent(message, userName, model = 'IndexTeam/IndexTTS-2', useStreaming = true) {
      if (!message) return

      const targetUser = this.users.find((item) => item.userName === userName)
      const voiceId = targetUser.voiceId

      // 获取音频配置数据
      const audioData = myCache.get('audioData') || {}
      const token = audioData.apiKey

      // 检查是否是克隆音色，找到对应的克隆音色对象
      const clonedVoice = audioData.clonedVoices?.find((v) => v.reference_id === voiceId)
      // 构建 voice 参数
      let voice = null
      if (clonedVoice) {
        voice = clonedVoice.uri
      } else {
        voice = `${model}:${voiceId}`
      }

      const textLength = message.length

      // 短文本（<= 100 字符）或禁用流式：使用单次请求
      if (textLength <= 100 || !useStreaming) {
        return this.singleTTS(message, userName, { voice, model, token })
      }

      // 长文本：使用流式 TTS（边请求边播放，队列限制并发数为 10）
      return streamingTTS(message, userName, { voice, model, token }, 100).then((result) => [
        result.audioElem,
        { messageId: result.messageId, audioBlob: result.audioBlob },
      ])
    },

    // 单次 TTS 请求（内部方法）
    singleTTS(message, userName, { voice, model, token }) {
      const targetConfig = {
        input: message,
        gain: 0,
        model,
        speed: 1.25,
        response_format: 'mp3',
        voice,
      }

      return new Promise((resolve, reject) => {
        textToSpeech(targetConfig, token)
          .then(async (res) => {
            const [audioElem, audioBlob] = await createAudioToBlob(res)

            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            try {
              await indexedDBStorage.saveAudioMessage(userName, messageId, audioBlob, message)
              console.log('✅ 音频已保存到 IndexedDB:', messageId)
            } catch (error) {
              console.warn('⚠️ 保存音频到 IndexedDB 失败:', error)
            }

            resolve([audioElem, { messageId, audioBlob }])
          })
          .catch((err) => {
            console.error('❌ TTS 错误:', err)
            reject(err)
          })
      })
    },
  },
})
export default useAgent
