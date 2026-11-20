export default async function parseM3U8(videoElem, baseUrl) {
  if (baseUrl.includes('.m3u8')) {
    // 检查浏览器原生支持
    const canPlayNatively = videoElem.canPlayType('application/vnd.apple.mpegurl')

    // 强制使用 HLS.js，因为浏览器的 canPlayType 可能返回 "maybe" 但实际不支持
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isSafari && canPlayNatively) {
      videoElem.src = baseUrl
    } else {
      // 等待 HLS.js 加载完成
      await waitForHls()

      if (window.Hls && window.Hls.isSupported()) {
        let hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })

        hls.loadSource(baseUrl)
        hls.attachMedia(videoElem)

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            console.error('HLS播放错误:', data.type, data.details)
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad()
                break
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError()
                break
              default:
                hls.destroy()
                break
            }
          }
        })
      } else {
        console.error('HLS.js 不可用')
      }
    }
  } else if (videoElem.canPlayType('video/mp4')) {
    videoElem.src = baseUrl
  }
}

// 等待 HLS.js 加载完成的辅助函数
function waitForHls() {
  return new Promise((resolve) => {
    if (window.Hls) {
      resolve()
      return
    }

    const existingScript = document.querySelector('script[src*="hls.js"]')

    if (existingScript) {
      if (existingScript.onload) {
        existingScript.onload = resolve
      } else {
        existingScript.addEventListener('load', resolve)
      }
    }

    const checkInterval = setInterval(() => {
      if (window.Hls) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)

    setTimeout(() => {
      clearInterval(checkInterval)
      resolve()
    }, 5000)
  })
}
