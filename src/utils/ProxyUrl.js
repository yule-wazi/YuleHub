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
