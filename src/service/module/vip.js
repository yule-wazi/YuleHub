import myCache from '@/utils/cacheStorage'
import MyRequest from '../request/index'
// const baseURL = 'api.cocomi.eu.org'
// const baseURL = 'hibiapi.getloli.com'
const baseURL = 'hi.yyaan.com'
// pixivRank
export function getPixivRankList(options, date = null) {
  let isR18 = myCache.get('isNSFW') ?? false
  // 如果未提供日期，使用当前时间减去1天的日期
  let queryString = `&date=${date}`
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(
    `https://${baseURL}/api/pixiv/rank?mode=${isR18 ? 'day_r18' : 'day'}${queryString}`,
  )
  return MyRequest.get()
}
// pixivSearch
export function getPixivSearchList(options) {
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/search?${queryString}`)
  return MyRequest.get()
}
// 根据UID获取作者作品列表
export function getPixivMemberIllust(options) {
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/member_illust?${queryString}`)
  return MyRequest.get()
}
// 获取pixiv插画详情
export function getPixivImgDetail(pid) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/illust?id=${pid}`)
  return MyRequest.get()
}
// 获取pixiv插画评论
export function getPixivImgComments(pid, page = 1) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/illust_comments?id=${pid}&page=${page}`)
  return MyRequest.get()
}
// 获取pixiv作者详情
export function getPixivArtistDetail(uid) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/member?id=${uid}`)
  return MyRequest.get()
}
// 获取pixiv相关作者
export function getPixivRelatedArtist(uid) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/related_member?id=${uid}`)
  return MyRequest.get()
}
// 获取pixiv相关作品
export function getPixivRelatedImg(pid, page = 1) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/related?id=${pid}&page=${page}`)
  return MyRequest.get()
}
// 获取pixiv动图元数据
export function getPixivUgoiraMetadata(pid) {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/ugoira_metadata?id=${pid}`)
  return MyRequest.get()
}
// 获取pixivsion特辑
export function getPixivsionSpotlights() {
  MyRequest.setBaseUrl(`https://${baseURL}/api/pixiv/spotlights?category=all&page=1&size=20`)
  return MyRequest.get()
}