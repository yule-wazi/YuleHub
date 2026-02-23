import MyRequest from '../request/index'

export function getVideoList(page = 1) {
  MyRequest.setBaseUrl(`/api/video/list?page=${page}`)
  return MyRequest.get()
}

export function searchVideo(keyword, page) {
  MyRequest.setBaseUrl(`/api/video/search?keyword=${keyword}&page=${page}`)
  return MyRequest.get()
}

export function getVideoFeedList(limit) {
  MyRequest.setBaseUrl(`/api/video/feed?limit=${limit}`)
  return MyRequest.get()
}

export function getVideoAuthor(name) {
  MyRequest.setBaseUrl(`/api/video/author?name=${name}`)
  return MyRequest.get()
}

export function getProxyVideoInfo(url) {
  MyRequest.setBaseUrl(
    `https://api.mir6.com/api/bzjiexi?url=https://www.bilibili.com/video/${url}/&type=json`,
  )
  return MyRequest.get()
}

// 请求动漫类型
export function getAnimeType(baseUrl, params = '') {
  const queryParams = params ? `&params=${encodeURIComponent(params)}` : ''
  MyRequest.setBaseUrl(`/api/type?baseUrl=${baseUrl}${queryParams}`)
  return MyRequest.get()
}

// 请求动漫数据
export function getAnimeList(baseUrl, params) {
  MyRequest.setBaseUrl(`/api/type?baseUrl=${baseUrl}&params=${encodeURIComponent(params)}`)
  return MyRequest.get()
}
