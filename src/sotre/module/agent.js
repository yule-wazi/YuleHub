import { defineStore } from 'pinia'
import { postAgent, textToAudio } from '@/service/module/agents'
import { formatInputMessage } from '@/utils/formatOutput'
import { createAudio } from '@/utils/createAudio'
import allUsers from '../agentUsersConfig'
import myCache from '@/utils/cacheStorage'
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
    audioToAgent(message, userName) {
      if (!message) return
      // 查找目标智能体配置
      const voiceId = this.users.find((item) => item.userName === userName).voiceId
      let targetConfig = {
        model: 'speech-02-hd',
        text: `${message}`,
        timber_weights: [
          {
            voice_id: `${voiceId}`,
            weight: 1,
          },
        ],
        voice_setting: {
          voice_id: '',
          speed: 1.25,
          pitch: 0,
          vol: 1.25,
          emotion: 'disgusted',
          latex_read: false,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
        },
        language_boost: 'auto',
      }
      const audioData = myCache.get('audioData')
      return new Promise((resolve, reject) => {
        textToAudio(targetConfig, audioData.groupId, audioData.token)
          .then((res) => {
            const audioElem = createAudio(res.data.data.audio)
            resolve([audioElem, res.data.data.audio])
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  },
})
export default useAgent
