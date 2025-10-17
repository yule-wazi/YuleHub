import { PORT } from '../../../express/config/globalVar'
import MyRequest from '../request/index'
const HOST = import.meta.env.VITE_HOST || 'localhost'

export function getVideoList(page = 1) {
  MyRequest.setBaseUrl(`http://${HOST}:${PORT}/video/list?page=${page}`)
  return MyRequest.get()
}

export function searchVideo(keyword, page) {
  MyRequest.setBaseUrl(`http://${HOST}:${PORT}/video/search?keyword=${keyword}&page=${page}`)
  return MyRequest.get()
}

export function getVideoFeedList(limit) {
  MyRequest.setBaseUrl(`http://${HOST}:${PORT}/video/feed?limit=${limit}`)
  return MyRequest.get()
}

export function getVideoAuthor(name) {
  MyRequest.setBaseUrl(`http://${HOST}:${PORT}/video/author?name=${name}`)
  return MyRequest.get()
}

export function getProxyVideoInfo(url) {
  MyRequest.setBaseUrl(
    `https://api.mir6.com/api/bzjiexi?url=https://www.bilibili.com/video/${url}/&type=json`,
  )
  return MyRequest.get()
}
