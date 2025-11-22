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
  // 世界书插入（支持TopK/预算等参数，可按需调整）
  // 提取世界书数组（兼容旧格式和新格式）
  let loreBooksArray = []
  if (targetUser.loreBooks) {
    if (Array.isArray(targetUser.loreBooks)) {
      // 旧格式：直接是数组
      loreBooksArray = targetUser.loreBooks
    } else if (targetUser.loreBooks.value && Array.isArray(targetUser.loreBooks.value)) {
      // 新格式：{ label, value }
      loreBooksArray = targetUser.loreBooks.value
    }
  }

  const { loreBooksMessageList, messageKeys } = matchLoreBooks(messageList, loreBooksArray, {
    topK: 4,
    minScore: 0.4,
    tokenBudget: 2000,
    enableRegex: true,
    // 历史扫描和会话控制
    historyMode: 'window',
    windowSize: 8,
    roles: ['user', 'assistant'],
    timeDecay: 0.85,
    sessionId: targetUser.userName,
    cooldownRounds: 2,
    maxUsesPerSession: 3,
    repetitionPenalty: 0.6,
    // 新增：角色卡增强选项
    respectPriority: true, // 使用 insertionOrder
    respectPosition: true, // 使用 position 属性
    respectProbability: true, // 应用概率过滤
    includeConstant: true, // 包含常驻条目
  })

  if (loreBooksMessageList.length) {
    console.log('世界书匹配到：', loreBooksMessageList, '关键词：', messageKeys)

    // 根据 position 属性分组插入
    const positionGroups = {
      beforeChar: [], // position: 0 - 角色描述前
      afterChar: [], // position: 1 - 角色描述后
      beforeUser: [], // position: 4 或默认 - 用户消息前
    }

    // 按位置分组
    loreBooksMessageList.forEach((loreMsg) => {
      const position = loreMsg.position ?? 4 // 默认为用户消息前
      const systemMsg = { role: 'system', content: loreMsg.content }

      if (position === 0) {
        positionGroups.beforeChar.push(systemMsg)
      } else if (position === 1) {
        positionGroups.afterChar.push(systemMsg)
      } else {
        // position: 2, 3, 4 或其他，都插入到用户消息前
        positionGroups.beforeUser.push(systemMsg)
      }
    })

    // 找到第一个 system 消息的位置（角色描述）
    const firstSystemIndex = messageList.findIndex((m) => m.role === 'system')

    // 1. 在角色描述前插入 (position: 0)
    if (positionGroups.beforeChar.length > 0 && firstSystemIndex !== -1) {
      messageList.splice(firstSystemIndex, 0, ...positionGroups.beforeChar)
      console.log(`[LoreBook] 在角色描述前插入 ${positionGroups.beforeChar.length} 个条目`)
    }

    // 2. 在角色描述后插入 (position: 1)
    if (positionGroups.afterChar.length > 0 && firstSystemIndex !== -1) {
      const insertIndex = firstSystemIndex + 1 + positionGroups.beforeChar.length
      messageList.splice(insertIndex, 0, ...positionGroups.afterChar)
      console.log(`[LoreBook] 在角色描述后插入 ${positionGroups.afterChar.length} 个条目`)
    }

    // 3. 在用户最后一条消息前插入 (position: 2, 3, 4 或其他)
    if (positionGroups.beforeUser.length > 0) {
      messageList.splice(-1, 0, ...positionGroups.beforeUser)
      console.log(`[LoreBook] 在用户消息前插入 ${positionGroups.beforeUser.length} 个条目`)
    }
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
    } catch (error) {
      console.error('检测到错误', error)
    }
  }
}
