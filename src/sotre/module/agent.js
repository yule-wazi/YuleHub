import { defineStore } from 'pinia'
import { postAgent, textToAudio } from '@/service/module/agents'
import { formatInputMessage } from '@/utils/chatToAgent'
import { createAudio } from '@/utils/createAudio'
import audioConfig from '../agentAudioConfig'

const useAgent = defineStore('agent', {
  state: () => {
    return {
      currentUser: '和睦一家人',
      backgroundImg: 'https://haowallpaper.com/link/common/file/previewFileImg/15838540283482432',
      isPlay: true,
      isMute: true,
      audioDuration: 0,
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
    audioToAgent([message, emotion], userName) {
      // 查找目标智能体配置
      const targetConfig = audioConfig.find((item) => item.userName === userName).data
      targetConfig.text = message
      targetConfig.voice_setting.emotion = emotion || 'disgusted'
      return new Promise((resolve, reject) => {
        textToAudio(targetConfig)
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
