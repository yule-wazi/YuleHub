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
  // const audioData = hexStringToUint8Array(hexString)
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
// 生成音源-二进制
export async function createAudioToBlob(response) {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`TTS 失败: ${response.status} - ${errorText}`)
  }
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  const audioElem = document.createElement('audio')
  audioElem.src = audioUrl
  document.body.appendChild(audioElem)

  // 直接返回 Blob 对象，而不是 base64 字符串
  return [audioElem, audioBlob]
}

// 播放音源
export function playAudio(audioElem) {
  return new Promise((resolve) => {
    audioElem.addEventListener('loadedmetadata', () => {
      const duration = audioElem.duration * 1000
      console.log(`音频长度：${(duration / 1000 / 60).toFixed(2)}分钟`)
      const waitDuration = duration - 5000
      resolve(waitDuration)
    })
    audioElem.addEventListener('ended', () => {
      document.body.removeChild(audioElem)
    })
    audioElem.play()
  })
}
