export default async function parseM3U8(videoElem, baseUrl) {
  if (baseUrl.includes('.m3u8')) {
    if (videoElem.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('浏览器原生支持m3u8')
      videoElem.src = baseUrl
    } else {
      // 等待 HLS.js 加载完成
      await waitForHls()
      if (window.Hls && window.Hls.isSupported()) {
        let hls = new window.Hls()
        hls.loadSource(baseUrl)
        hls.attachMedia(videoElem)
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {})
      }
    }
  } else if (videoElem.canPlayType('video/mp4')) {
    videoElem.src = baseUrl
  }
}

// 等待 HLS.js 加载完成的辅助函数
function waitForHls() {
  return new Promise((resolve) => {
    // 如果已经加载，直接返回
    if (window.Hls) {
      resolve()
      return
    }
    // 检查脚本是否已经存在
    const existingScript = document.querySelector('script[src*="hls.js"]')

    if (existingScript) {
      // 如果脚本存在但还未加载完成，等待其加载
      if (existingScript.onload) {
        existingScript.onload = resolve
      } else {
        existingScript.addEventListener('load', resolve)
      }
    }
    // 轮询检查 window.Hls 是否已定义
    const checkInterval = setInterval(() => {
      if (window.Hls) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)
    // 设置超时，避免无限等待（最多等待5秒）
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve() 
    }, 5000)
  })
}
