import MyRequest from '../request/index'

// 阿里云ai（弃用）
export function postAgent(data, url) {
  MyRequest.setBaseUrl('https://dashscope.aliyuncs.com')
  MyRequest.setToken(AGENT_TOKEN) // 使用环境变量中的 Token
  return MyRequest.post({
    url,
    data,
  })
}
// DZMMai
export function postDZMMAgent(requestBody, firstToken) {
  return fetch('https://www.gpt4novel.com/api/xiaoshuoai/ext/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${firstToken}`,
    },
    body: JSON.stringify(requestBody),
  })
}

// 文字语音
export function textToAudio(data, groupId, token) {
  MyRequest.setBaseUrl(`https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`)
  MyRequest.setToken(token) // 使用环境变量中的 Token
  return MyRequest.post({
    data,
  })
}
