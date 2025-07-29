import { nextTick } from 'vue'
import { formatAudioMessage } from './formatOutput'
import { postDZMMAgent } from '@/service/module/agents'
import useAgent from '@/sotre/module/agent'
import { playAudio } from './createAudio'
import myCache from '@/utils/cacheStorage'
import { matchLoreBooks } from './matchLoreBooks'
const delay = 0
export function updateMessage({
  targetUser,
  isMe,
  message,
  image,
  audioSrc,
  contentElem,
  audioDuration,
  getAudio,
}) {
  let messageList = targetUser.message.map((item) => {
    if (item.description) {
      return { role: 'system', content: item.description }
    }
    return { role: item.isMe ? 'user' : 'assistant', content: item.message }
  })
  // 世界书插入
  const { loreBooksMessageList, messageKeys } = matchLoreBooks(messageList, targetUser.loreBooks)
  if (loreBooksMessageList.length) {
    console.log('世界书匹配到：', loreBooksMessageList, '关键词：', messageKeys)
    messageList.splice(
      -1,
      0,
      ...loreBooksMessageList.map((message) => {
        return { role: 'system', content: message.content }
      }),
    )
  }
  // 给ai将要回答预留位置
  targetUser.message.push({
    isMe,
    message: '',
    image,
    audioSrc: '',
  })
  const currentIndex = targetUser.message.length - 1
  let currentMessage = targetUser.message[currentIndex]
  // 将信息请求处理存入message
  chatWithDZMMAI(currentMessage, messageList, contentElem, getAudio, targetUser)
  return messageKeys
}
// 发出请求&流式输出
async function chatWithDZMMAI(currentMessage, messageList, contentElem, getAudio, targetUser) {
  const requestBody = {
    model: 'nalang-turbo-v23',
    messages: messageList,
    stream: true,
    temperature: 0.7,
    max_tokens: 10000,
    top_p: 0.4,
    repetition_penalty: 1.1,
  }
  // ai网络请求
  const agentStore = useAgent()
  const tokenList = myCache.get('TokenList')
  const firstToken = tokenList[0]

  const response = await postDZMMAgent(requestBody, firstToken)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true })
    let newlineIndex
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      if (line.startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(line.slice(6).trim())
          if (jsonData.error) {
            console.log('积分不足', jsonData.error)
            // 弹出多余消息
            console.log('targetUser.message=', targetUser.message)
            targetUser.message.splice(-2, 2)
            console.log('targetUser.message=', targetUser.message)
            // 转换token
            ElMessage({
              message: '当前Token余额不足,已自动切换至下一条Token',
              type: 'warning',
            })
            tokenList.shift()
            tokenList.push(firstToken)
            myCache.set('TokenList', tokenList)
            console.log('转换token', tokenList)
            return
          }
          if (jsonData.choices?.[0]?.delta?.content) {
            const content = jsonData.choices[0].delta.content
            currentMessage.message += content
            // nextTick(() => {
            //   contentElem.scrollTop = contentElem.scrollHeight
            // })
          }
        } catch (e) {
          if (line.trim()) {
            console.error('Error parsing JSON:', e)
          }
        }
      }
    }
  }
  // 判断是否生成语音
  if (getAudio) {
    try {
      const [audioElem, audioSrc] = await agentStore.audioToAgent(
        formatAudioMessage(currentMessage.message),
        targetUser.userName,
      )
      currentMessage.audioSrc = audioSrc
      // 播放音频
      await playAudio(audioElem)
    } catch {
      console.log('为查询到语音字')
    }
  }
}
