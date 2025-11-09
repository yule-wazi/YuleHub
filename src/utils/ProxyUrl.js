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
  if(!url) {
    return
  }
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
  const proxyUrl1 = /i\.pixiv\.re/
  const proxyUrl2 = /i\.pximg\.net/
  //切换代理服务器（如果觉得卡可以不换）
  newUrl = newUrl.replace(proxyUrl1, 'i.pximg.org').replace(proxyUrl2, 'i.pximg.org')
  return newUrl
}
// 拼接图片URL(pica)
export function spliceImgUrl(path) {
  const baseUrl = 'https://img.safedataplj.com/'
  const newPath = path.replace('tobeimg', '')
  return baseUrl + newPath
}
