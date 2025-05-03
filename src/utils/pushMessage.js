import { nextTick } from 'vue'
const delay = 100
export function updateMessage({
  targetUser,
  isMe,
  message,
  image,
  audioSrc,
  content,
  audioDuration,
}) {
  targetUser.message.push({
    isMe,
    message: '',
    image,
    audioSrc,
  })
  const currentIndex = targetUser.message.length - 1
  const currentMessage = targetUser.message[currentIndex]
  audioDuration.value = message.length * delay
  showText(currentMessage, message, content)
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
