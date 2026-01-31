import useAgent from '@/sotre/module/agent'
import { storeToRefs } from 'pinia'

// 格式化输入内容
export function formatInputMessage(message) {
  return message
}
// 格式化输出(对AI)
export function formatOutputMessageToAgent(userName, message) {
  let newMessage = `${userName}对你说：${message}`
  const pattern = /t.*?\|/
  newMessage = newMessage.replace(pattern, '')
  return newMessage
}
// 格式化输出——高亮对话内容
export function formatSpecialOutput(message, istextLight = true) {
  let newMessage = message

  if (istextLight) {
    // 使用 [^"'“”‘’]+ 确保不会跨行匹配或过度匹配
    const quoteRegex = /((["“])([^"“”]+)(["”]))/g
    newMessage = newMessage.replace(quoteRegex, '<span class="chat">$1</span>')
  }
  return newMessage
    .replace(/\*/g, '') // 移除星号
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>') // 先处理代码块，防止内部换行被替换
    .replace(/\n/g, '<br>') // 替换换行
}
// 格式化输入audio——截取对话内容
export function formatAudioMessage(message) {
  // 使用与高亮相同的正则表达式，匹配所有引号组合
  const quoteRegex = /((["“])([^"“”]+)(["”]))/g
  const matches = message.match(quoteRegex)
  if (!matches || matches.length === 0) {
    return undefined
  }
  // 提取引号内的内容（去掉引号本身）
  const contents = matches
    .map((match) => {
      // 去掉首尾的引号字符
      return match.slice(1, -1)
    })
    .filter((content) => content.trim()) // 过滤空内容
  return contents.length > 0 ? contents.join('。') : undefined
}
// 对内容进行审查
export function checkContentFirstName(message) {
  const agentStore = useAgent()
  const { users } = storeToRefs(agentStore)
  // 获取所有角色名称
  let userNameList = users.value.map((item) => item.userName)
  userNameList.shift()
  // 查找是否带有角色名称
  for (let i = 0; i < userNameList.length; i++) {
    if (message.includes(userNameList[i])) {
      return userNameList[i]
    }
  }
  return undefined
}
// 格式化输出(展示)(弃用)
export function formatOutPutMessage(message) {
  const pattern = /t.*?\|/
  const emotionReg = /\[(.*?)\]/g
  const descReg = /\{([\s\S]*?)\}/g // 匹配{}内内容
  const emotionMatch = emotionReg.exec(message)
  let emotion = ''
  if (emotionMatch) {
    emotion = emotionMatch[1]
  }
  let newMessage = message.replace(pattern, '').replace(emotionReg, '')
  // 将{}内内容用div.desc包裹，并处理换行
  newMessage = newMessage.replace(descReg, (match, p1) => {
    return `<div class="desc">${p1.replace(/\n/g, '<br>')}</div>`
  })
  return [newMessage, emotion]
}
