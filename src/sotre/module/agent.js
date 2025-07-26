import { defineStore } from 'pinia'
import { postAgent, textToAudio } from '@/service/module/agents'
import { formatInputMessage } from '@/utils/formatOutput'
import { createAudio } from '@/utils/createAudio'
import audioConfig from '../agentAudioConfig'
import allUsers from '../agentUsersConfig'
const DZMMAGENT_TOKEN = '' /*电子魅魔API-Key*/ || import.meta.env.VITE_DZMMAGENT_TOKEN

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
      console.log('message=', message)
      if (!message) return
      // 查找目标智能体配置
      const targetConfig = audioConfig.find((item) => item.userName === userName).data
      targetConfig.text = message
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
