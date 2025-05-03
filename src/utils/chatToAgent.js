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
// 格式化输出(展示)
export function formatOutPutMessage(message) {
  console.log(message)
  const pattern = /t.*?\|/
  const emotionReg = /\[(.*?)\]/g
  const emotionMatch = emotionReg.exec(message)
  let emotion = ''
  if(emotionMatch) {
    emotion = emotionMatch[1]
  }
  const newMessage = message.replace(pattern, '').replace(emotionReg, '')
  return [newMessage, emotion]
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
