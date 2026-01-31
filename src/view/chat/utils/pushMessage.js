import { formatAudioMessage } from './formatOutput'
import { postDZMMAgent, postGeminiAgent } from '@/service/module/agents'
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
    }

    // 2. 在角色描述后插入 (position: 1)
    if (positionGroups.afterChar.length > 0 && firstSystemIndex !== -1) {
      const insertIndex = firstSystemIndex + 1 + positionGroups.beforeChar.length
      messageList.splice(insertIndex, 0, ...positionGroups.afterChar)
    }

    // 3. 在用户最后一条消息前插入 (position: 2, 3, 4 或其他)
    if (positionGroups.beforeUser.length > 0) {
      messageList.splice(-1, 0, ...positionGroups.beforeUser)
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

  // 根据模型类型选择不同的处理函数
  const modelType = myCache.get('modelType') || 'dzmm'
  if (modelType === 'gemini') {
    chatWithGemini(currentMessage, messageList, contentElem, getAudio, targetUser)
  } else {
    chatWithDZMMAI(currentMessage, messageList, contentElem, getAudio, targetUser)
  }

  return messageKeys
}
// 发出请求&流式输出 （DZMM）
export async function chatWithDZMMAI(
  currentMessage,
  messageList,
  contentElem,
  getAudio,
  targetUser,
) {
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

// 发出请求&流式输出 (Gemini)
export async function chatWithGemini(
  currentMessage,
  messageList,
  contentElem,
  getAudio,
  targetUser,
) {
  const agentStore = useAgent()
  const geminiApiKey = myCache.get('GeminiApiKey')

  if (!geminiApiKey) {
    ElMessage.error('尚未设置 Gemini API Key')
    targetUser.message.splice(-2, 2)
    return
  }

  // 转换消息格式：DZMM -> Gemini
  const { systemInstruction, contents } = convertToGeminiFormat(messageList)

  const requestBody = {
    contents,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 10000,
      topP: 0.4,
      topK: 40,
    },
  }

  try {
    const response = await postGeminiAgent(requestBody, geminiApiKey)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      ElMessage.error(`Gemini API 错误: ${errorData.error?.message || response.statusText}`)
      targetUser.message.splice(-2, 2)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let insideArray = false
    let hasContent = false // 标记是否已经有内容输出

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Gemini 3 流式响应：[{...},{...},{...}]
      // 逐个提取和解析 JSON 对象

      // 检测数组开始
      if (!insideArray && buffer.includes('[')) {
        insideArray = true
        buffer = buffer.substring(buffer.indexOf('[') + 1)
      }

      if (insideArray) {
        // 尝试提取完整的 JSON 对象
        let braceCount = 0
        let startIndex = -1
        let inString = false
        let escapeNext = false

        for (let i = 0; i < buffer.length; i++) {
          const char = buffer[i]

          if (escapeNext) {
            escapeNext = false
            continue
          }

          if (char === '\\') {
            escapeNext = true
            continue
          }

          if (char === '"') {
            inString = !inString
            continue
          }

          if (inString) continue

          if (char === '{') {
            if (braceCount === 0) startIndex = i
            braceCount++
          } else if (char === '}') {
            braceCount--
            if (braceCount === 0 && startIndex !== -1) {
              // 找到完整的 JSON 对象
              const jsonStr = buffer.substring(startIndex, i + 1)

              try {
                const jsonData = JSON.parse(jsonStr)

                // 检查错误 - 如果已有内容，只警告不删除
                if (jsonData.error) {
                  console.error('Gemini stream error:', jsonData.error)
                  const errorMsg = jsonData.error.message || '未知错误'

                  if (hasContent) {
                    // 已有内容输出，只显示警告，不删除消息
                    ElMessage.warning(`Gemini 中断: ${errorMsg}`)
                    // 在消息末尾添加中断提示
                    if (currentMessage.message && !currentMessage.message.endsWith('...')) {
                      currentMessage.message += '\n\n[响应被中断]'
                    }
                    // 跳出循环，保留已有内容
                    break
                  } else {
                    // 还没有内容输出，删除空消息
                    ElMessage.error(`Gemini 错误: ${errorMsg}`)
                    targetUser.message.splice(-2, 2)
                    return
                  }
                }

                // 提取文本内容
                const text = jsonData.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  currentMessage.message += text
                  hasContent = true // 标记已有内容
                }

                // 检查是否被安全过滤
                const finishReason = jsonData.candidates?.[0]?.finishReason
                if (finishReason === 'SAFETY') {
                  ElMessage.warning('内容被 Gemini 安全过滤器拦截')
                  if (hasContent) {
                    break // 保留已有内容
                  }
                }
              } catch (e) {
                console.warn('Failed to parse JSON object:', e)
              }

              // 移除已处理的部分
              buffer = buffer.substring(i + 1)
              i = -1 // 重置索引
              startIndex = -1
            }
          }
        }
      }
    }

    // 判断是否生成语音
    if (getAudio && currentMessage.message) {
      try {
        const [audioElem, audioSrc] = await agentStore.audioToAgent(
          formatAudioMessage(currentMessage.message),
          targetUser.userName,
        )
        currentMessage.audioSrc = audioSrc
        await playAudio(audioElem)
      } catch (error) {
        console.error('语音生成错误', error)
      }
    }
  } catch (error) {
    console.error('Gemini request failed:', error)

    // 检查是否已有内容输出
    if (currentMessage.message && currentMessage.message.trim()) {
      // 有内容，只显示警告，保留已输出的内容
      ElMessage.warning(`请求中断: ${error.message}`)
      if (!currentMessage.message.endsWith('...')) {
        currentMessage.message += '\n\n[连接中断]'
      }
    } else {
      // 没有内容，删除空消息
      ElMessage.error(`请求失败: ${error.message}`)
      targetUser.message.splice(-2, 2)
    }
  }
}

// 转换消息格式：DZMM -> Gemini
function convertToGeminiFormat(messageList) {
  let systemInstruction = null
  const contents = []

  for (const msg of messageList) {
    if (msg.role === 'system') {
      // 合并所有 system 消息到 systemInstruction
      if (!systemInstruction) {
        systemInstruction = { parts: [{ text: msg.content }] }
      } else {
        systemInstruction.parts[0].text += '\n\n' + msg.content
      }
    } else if (msg.role === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: msg.content }],
      })
    } else if (msg.role === 'assistant') {
      contents.push({
        role: 'model',
        parts: [{ text: msg.content }],
      })
    }
  }

  return { systemInstruction, contents }
}
