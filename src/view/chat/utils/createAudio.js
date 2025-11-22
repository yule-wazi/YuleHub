// 将hex字符串转换为Uint8Array
function hexStringToUint8Array(hexString) {
  const bytes = []
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16))
  }
  return new Uint8Array(bytes)
}
// 生成音源
export function createAudio(hexString) {
  // 转换为Uint8Array
  const audioData = hexStringToUint8Array(hexString)
  // 创建一个FileReader对象
  const reader = new FileReader()
  // 创建一个Blob对象（直接用于FileReader）
  const blob = new Blob([audioData], { type: 'audio/mp3' }) // 根据音频格式选择MIME类型
  // 使用FileReader读取Blob对象
  const audioElement = document.createElement('audio')
  reader.onload = function (event) {
    // 将结果设置为audio元素的src
    audioElement.src = event.target.result
    document.body.appendChild(audioElement) // 将audio元素添加到页面中
  }
  // 开始读取
  reader.readAsDataURL(blob)
  return audioElement
}

// 播放音源
export function playAudio(audioElem) {
  return new Promise((resolve) => {
    audioElem.addEventListener('loadedmetadata', () => {
      const duration = audioElem.duration * 1000
      const waitDuration = duration - 5000
      resolve(waitDuration)
    })
    audioElem.addEventListener('ended', () => {
      document.body.removeChild(audioElem)
    })
    audioElem.play()
  })
}
