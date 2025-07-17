import { nextTick } from 'vue'
const DZMMAGENT_TOKEN = '' /*电子魅魔API-Key*/ || import.meta.env.VITE_DZMMAGENT_TOKEN

const delay = 0
export function updateMessage({
  targetUser,
  isMe,
  message,
  image,
  audioSrc,
  content,
  audioDuration,
  chunk,
}) {
  let messageList = targetUser.message.map((item) => {
    if (item.description) {
      return { role: 'system', content: item.description }
    }
    return { role: item.isMe ? 'user' : 'assistant', content: item.message }
  })
  targetUser.message.push({
    isMe,
    message: '',
    image,
    audioSrc,
  })
  const currentIndex = targetUser.message.length - 1
  let currentMessage = targetUser.message[currentIndex]
  // 将信息请求处理存入message
  chatWithDZMMAI(currentMessage, messageList)

  // audioDuration.value = message.length * delay
  // showText(currentMessage, message, content)
}
// 流式输出
async function chatWithDZMMAI(currentMessage, messageList) {
  try {
    const requestBody = {
      model: 'nalang-turbo-v19',
      messages: messageList,
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.35,
      repetition_penalty: 1.05,
    }

    const response = await fetch(
      'https://www.gpt4novel.com/api/xiaoshuoai/ext/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DZMMAGENT_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      },
    )
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
            if (jsonData.completed) {
              console.log('Stream completed:', jsonData.completed)
              return
            }
            if (jsonData.choices?.[0]?.delta?.content) {
              const content = jsonData.choices[0].delta.content
              currentMessage.message += content
            }
          } catch (e) {
            if (line.trim()) {
              console.error('Error parsing JSON:', e)
            }
          }
        }
      }
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
