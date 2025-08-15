import { switchImgResolutionUrl, switchProxyUrl } from '@/utils/ProxyUrl'
import { shuffleArray } from '@/utils/handleArray'
import myCache from '@/utils/cacheStorage'
import MyRequest from '../request/index'
const HOST = import.meta.env.VITE_HOST || 'localhost'
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
  // console.log(pidList)
  return pidList
}

// 福利图APIT-2
export function postNewVipList(options) {
  let isR18 = myCache.get('isNSFW') ?? false
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(
    `https://image.anosu.top/pixiv?num=30&r18=${isR18 ? 1 : 0}&db=0&size=small${queryString}`,
  )
  return MyRequest.post()
}
// Lolicon
export function postLoliconList(options) {
  let isR18 = myCache.get('isNSFW') ?? false
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(
    `http://${HOST}:3000/proxy?url=${encodeURIComponent(`https://api.lolicon.app/setu/v2?num=20&r18=${isR18 ? 1 : 0}&size=small${queryString}`)}`,
  )
  return MyRequest.get()
}

// pixivRank
export function postPixivRankList(options) {
  let isR18 = myCache.get('isNSFW') ?? false
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(
    `https://hibiapi.getloli.com/api/pixiv/rank?mode=${isR18 ? 'day_r18' : 'day'}${queryString}`,
  )
  return MyRequest.get()
}
// pixivSearch
export function postPixivSearchList(options) {
  let queryString = ''
  for (const k in options) {
    queryString += `&${k}=${options[k]}`
  }
  MyRequest.setBaseUrl(
    `https://hibiapi.getloli.com/api/pixiv/search?${queryString}`,
  )
  return MyRequest.get()
}
