export function switchProxyUrl(url) {
  const regex = /i\.pximg\.net/
  const newUrl = url.replace(regex, 'i.pximg.org')
  return newUrl
}
export function emunProxyUrl(url, index) {
  const regex = /_p.*?_/
  const newIndex = `_p${index}_`
  const newUrl = url.replace(regex, newIndex)
  return newUrl
}
// 切换图片分辨率
export function switchImgResolutionUrl(url, quality = 'low') {
  let newUrl = ''
  const reg = /c[^/]*\/[^/]*\//
  switch (quality) {
    case 'origin':
      newUrl = url.replace(reg, '')
      break
    case 'low':
      newUrl = url.replace(reg, 'c/48x48/')
      break
    default:
      newUrl = url
      break
  }
  const proxyUrl = /i\.pixiv\.re/
  //切换代理服务器（如果觉得卡可以不换）
  newUrl = newUrl.replace(proxyUrl, 'i.pximg.org')
  return newUrl
}
