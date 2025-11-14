import { switchImgResolutionUrl, switchProxyUrl } from '@/utils/ProxyUrl'
import { shuffleArray } from '@/utils/handleArray'
import myCache from '@/utils/cacheStorage'
import MyRequest from '../request/index'
const HOST = import.meta.env.VITE_HOST || 'localhost'
// const baseURL = 'api.cocomi.eu.org'
// const baseURL = 'hibiapi.getloli.com'
const baseURL = 'hi.yyaan.com'
// 获取画师作品id列表
function getPixivUID(uid) {
  MyRequest.setBaseUrl(
    `http://${HOST}:3000/proxy?url=${encodeURIComponent(`https://open.pximg.org/works.php?uid=${uid}`)}`,
  )
  return MyRequest.get()
}
// 获取id作品
function getPixivPID(pid) {
  MyRequest.setBaseUrl(
    `http://${HOST}:3000/proxy?url=${encodeURIComponent(`https://open.pximg.org/pid.php?pid=${pid}`)}`,
  )
  return MyRequest.get()
}
// 获取作者所有作品图片
export async function getAllPixivImg(uid) {
  const uidRes = await getPixivUID(uid)
  const uidList = shuffleArray([...uidRes.data.body.user_illust_ids]).slice(0, 8)
  const pidPromises = uidList.map(async (pid) => {
    const pidRes = await getPixivPID(pid)
    const pidUrl = pidRes.data.master
    return switchImgResolutionUrl(pidUrl, 'origin')
  })
  let pidList = await Promise.all(pidPromises)
  return pidList
}
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
