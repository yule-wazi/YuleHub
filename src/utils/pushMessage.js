import { nextTick } from 'vue'
import { formatAudioMessage } from './formatOutput'
import { postDZMMAgent } from '@/service/module/agents'
import useAgent from '@/sotre/module/agent'
import { playAudio } from './createAudio'
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
  // 获取输入对话内容（对话次数关系到输入Token）
  let limitLengthMessage = takeLimitLengthMessage(targetUser.message, 10)
  let messageList = limitLengthMessage.map((item) => {
    if (item.description) {
      return { role: 'system', content: item.description }
    }
    return { role: item.isMe ? 'user' : 'assistant', content: item.message }
  })

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

  // audioDuration.value = message.length * delay
  // showText(currentMessage, message, content)
}
// 拿取指定长度对话内容
function takeLimitLengthMessage(messageList, length = 100) {
  const firstMessage = messageList.slice(0, 1)
  const limitLengthMessage = messageList.slice(-length)
  const combined = [...firstMessage, ...limitLengthMessage]
  return [...new Set(combined)]
}
// 发出请求&流式输出
async function chatWithDZMMAI(currentMessage, messageList, contentElem, getAudio, targetUser) {
  try {
    const requestBody = {
      model: 'nalang-turbo-v23',
      messages: messageList,
      stream: true,
      temperature: 0.7,
      max_tokens: 10000,
      top_p: 0.35,
      repetition_penalty: 1.05,
    }
    // ai网络请求
    const agentStore = useAgent()
    const firstToken = agentStore.aiTokenList[0]
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
              console.log('targetUser.message=',targetUser.message)
              targetUser.message.splice(-2, 2)
              console.log('targetUser.message=',targetUser.message)
              // 转换token
              agentStore.aiTokenList.shift()
              agentStore.aiTokenList.push(firstToken)
              console.log("转换token",agentStore.aiTokenList)
              return
            }
            if (jsonData.choices?.[0]?.delta?.content) {
              const content = jsonData.choices[0].delta.content
              currentMessage.message += content
              nextTick(() => {
                contentElem.scrollTop = contentElem.scrollHeight
              })
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
      const [audioElem, audioSrc] = await agentStore.audioToAgent(
        formatAudioMessage(currentMessage.message),
        targetUser.userName,
      )
      currentMessage.audioSrc = audioSrc
      // 播放音频
      await playAudio(audioElem)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
function showText(currentMessage, text, content) {
  let index = 0
  let timerId
  function displayNextChar() {
    if (index < text.length) {
      currentMessage.message += text.charAt(index)
      nextTick(() => {
        content.scrollTop = content.scrollHeight
      })
      index++
      timerId = setTimeout(displayNextChar, delay)
    } else {
      clearTimeout(timerId)
    }
  }
  displayNextChar()
}
