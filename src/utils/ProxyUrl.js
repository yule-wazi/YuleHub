export function switchProxyUrl(url) {
  const regex = /i\.pximg\.net/
  const newUrl = url.replace(regex, 'i.pixiv.re')
  return newUrl
}
export function emunProxyUrl(url, index) {
  const regex = /_p.*?_/
  const newIndex = `_p${index}_`
  const newUrl = url.replace(regex, newIndex)
  return newUrl
}
// 切换高清图
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
  return newUrl
}
