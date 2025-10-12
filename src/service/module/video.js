import MyRequest from '../request/index'

export function getVideoList(page = 1) {
  MyRequest.setBaseUrl(`http://localhost:3000/video/list?page=${page}`)
  return MyRequest.get()
}

export function getVideoAuthor(name) {
  MyRequest.setBaseUrl(`http://localhost:3000/video/author?name=${name}`)
  return MyRequest.get()
}

export function searchVideo(keyword, page) {
  MyRequest.setBaseUrl(`http://localhost:3000/video/search?keyword=${keyword}&page=${page}`)
  return MyRequest.get()
}

export function getProxyVideoInfo(url) {
  MyRequest.setBaseUrl(`https://api.mir6.com/api/bzjiexi?url=https://www.bilibili.com/video/${url}/&type=json`)
  return MyRequest.get()
}
