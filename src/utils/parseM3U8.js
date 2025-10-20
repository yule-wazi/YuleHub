export default function parseM3U8(videoElem, baseUrl) {
  if (baseUrl.includes('.m3u8')) {
    console.log('m3u8解析')
    if (videoElem.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('浏览器原生支持m3u8')
      videoElem.src = baseUrl
    } else if (Hls.isSupported()) {
      let hls = new Hls()
      hls.loadSource(baseUrl)
      hls.attachMedia(videoElem)
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log('解析成功')
      })
    }
  } else if (videoElem.canPlayType('video/mp4')) {
    console.log('mp4解析')
    videoElem.src = baseUrl
  }
}
