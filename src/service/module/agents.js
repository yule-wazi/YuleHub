import MyRequest from '../request/index'

// 引入环境变量
const AGENT_TOKEN = import.meta.env.VITE_AGENT_TOKEN
const TEXT_TO_AUDIO_TOKEN = import.meta.env.VITE_TEXT_TO_AUDIO_TOKEN

export function postAgent(data, url) {
  MyRequest.setBaseUrl('https://dashscope.aliyuncs.com')
  MyRequest.setToken(AGENT_TOKEN) // 使用环境变量中的 Token
  return MyRequest.post({
    url,
    data,
  })
}

export function textToAudio(data) {
  MyRequest.setBaseUrl('https://api.minimax.chat/v1/t2a_v2?GroupId=1915215735274082544')
  MyRequest.setToken(TEXT_TO_AUDIO_TOKEN) // 使用环境变量中的 Token
  return MyRequest.post({
    data,
  })
}
